"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClientCompany, requirePortalSession, requireWorker } from "@/lib/client-portal/auth";
import { normalizePhone } from "@/lib/client-portal/utils";
import type { ClientAdjustment, DocumentReview, Json } from "@/lib/database.types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function logActivity(action: string, entityType: string, entityId: string | null, targetUserId: string | null, details: Json = {}) {
  const { supabase, user } = await requirePortalSession();
  const { error } = await supabase.from("activity_logs").insert({
    actor_user_id: user.id,
    target_user_id: targetUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details
  });

  if (error) {
    console.error("Activity log failed:", error.message);
  }
}

export async function requestContractorRelationship(formData: FormData) {
  const { supabase, user } = await requireWorker();
  const clientCompanyId = value(formData, "client_company_id");

  const { data: existing } = await supabase
    .from("contractor_relationships")
    .select("*")
    .eq("worker_user_id", user.id)
    .eq("client_company_id", clientCompanyId)
    .maybeSingle();

  if (existing?.status === "pending" || existing?.status === "active") {
    revalidatePath("/contractors");
    return;
  }

  if (existing?.status === "rejected") {
    const { error } = await supabase
      .from("contractor_relationships")
      .update({
        status: "pending",
        requested_at: new Date().toISOString(),
        approved_at: null,
        rejected_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);

    if (error) throw new Error(error.message);

    await logActivity("contractor_relationship_requested_again", "contractor_relationship", existing.id, clientCompanyId);
  } else {
    const { data, error } = await supabase
      .from("contractor_relationships")
      .insert({
        worker_user_id: user.id,
        client_company_id: clientCompanyId,
        status: "pending"
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    await logActivity("contractor_relationship_requested", "contractor_relationship", data?.id ?? null, clientCompanyId);
  }

  revalidatePath("/contractors");
  revalidatePath("/client-portal/requests");
}

export async function updateRelationshipStatus(formData: FormData) {
  const { supabase, user, profile } = await requireClientCompany();
  const relationshipId = value(formData, "relationship_id");
  const nextStatus = value(formData, "status") as "active" | "rejected" | "suspended" | "ended";
  const now = new Date().toISOString();

  const updatePayload = {
    status: nextStatus,
    approved_at: nextStatus === "active" ? now : null,
    rejected_at: nextStatus === "rejected" ? now : null,
    suspended_at: nextStatus === "suspended" ? now : null,
    ended_at: nextStatus === "ended" ? now : null,
    updated_at: now
  };

  let query = supabase.from("contractor_relationships").update(updatePayload).eq("id", relationshipId);
  if (profile.role !== "admin") query = query.eq("client_company_id", user.id);
  const { data: relationship, error } = await query.select("id, worker_user_id, client_company_id, status").maybeSingle();

  if (error) throw new Error(error.message);
  if (!relationship) throw new Error("Solicitacao nao encontrada ou sem permissao para alterar.");

  await logActivity(`contractor_relationship_${nextStatus}`, "contractor_relationship", relationship.id, relationship.worker_user_id);
  revalidatePath("/client-portal/requests");
  revalidatePath("/client-portal/workers");
  revalidatePath("/contractors");
}

export async function updateDocumentReview(formData: FormData) {
  const { supabase, user, profile } = await requireClientCompany();
  const documentId = value(formData, "document_id");
  const status = value(formData, "status") as DocumentReview["status"];
  const comment = value(formData, "comment") || null;

  let documentQuery = supabase.from("issued_documents").select("*").eq("id", documentId);
  if (profile.role !== "admin") documentQuery = documentQuery.eq("client_company_id", user.id);
  const { data: document } = await documentQuery.maybeSingle();
  if (!document) return;

  await supabase.from("document_reviews").upsert(
    {
      document_id: document.id,
      worker_user_id: document.worker_user_id,
      client_company_id: document.client_company_id ?? user.id,
      reviewed_by: user.id,
      status,
      comment,
      updated_at: new Date().toISOString()
    },
    { onConflict: "document_id,client_company_id" }
  );

  await logActivity(`document_${status}`, "issued_document", document.id, document.worker_user_id, { comment });
  revalidatePath("/client-portal/documents");
  revalidatePath("/client-portal/payments");
}

export async function updateWorkEntryReview(formData: FormData) {
  const { supabase, user, profile } = await requireClientCompany();
  const entryId = value(formData, "entry_id");
  const status = value(formData, "status");
  const comment = value(formData, "comment") || null;

  if (!["received", "approved", "rejected", "paid"].includes(status)) {
    throw new Error("Status de revisao invalido.");
  }

  if (profile.role === "admin") {
    const { error } = await supabase
      .from("work_entries")
      .update({
        client_review_status: status as "received" | "approved" | "rejected" | "paid",
        client_review_comment: comment,
        client_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", entryId);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.rpc("review_work_entry", {
      entry_id: entryId,
      review_status: status,
      review_comment: comment
    });

    if (error) throw new Error(error.message);
  }

  await logActivity(`work_entry_${status}`, "work_entry", entryId, user.id, { comment });
  revalidatePath("/client-portal/entries");
  revalidatePath("/dashboard");
  revalidatePath("/timecard");
}

export async function createClientAdjustment(formData: FormData) {
  const { supabase, user, profile } = await requireClientCompany();
  const documentId = value(formData, "document_id") || null;
  const workerUserId = value(formData, "worker_user_id");
  const clientCompanyId = profile.role === "admin" ? value(formData, "client_company_id") || user.id : user.id;

  if (documentId) {
    let documentQuery = supabase.from("issued_documents").select("id").eq("id", documentId);
    if (profile.role !== "admin") documentQuery = documentQuery.eq("client_company_id", user.id);
    const { data: document } = await documentQuery.maybeSingle();
    if (!document) return;
  }

  const payload = {
    client_company_id: clientCompanyId,
    worker_user_id: workerUserId,
    document_id: documentId,
    period_year: numberValue(formData, "period_year", new Date().getFullYear()),
    period_month: numberValue(formData, "period_month", new Date().getMonth() + 1),
    adjustment_type: value(formData, "adjustment_type") as ClientAdjustment["adjustment_type"],
    title: value(formData, "title") || "Ajuste do cliente/contratante",
    description: value(formData, "description") || null,
    amount: numberValue(formData, "amount"),
    currency: (value(formData, "currency") || "JPY") as "JPY" | "AUD",
    created_by: user.id
  };

  const { data } = await supabase.from("client_adjustments").insert(payload).select("id").single();
  await logActivity("client_adjustment_created", "client_adjustment", data?.id ?? null, workerUserId, payload as Json);
  revalidatePath("/client-portal/adjustments");
  revalidatePath("/client-portal/documents");
  revalidatePath("/client-portal/payments");
}

export async function updateCompanyProfile(formData: FormData) {
  const { supabase, user } = await requireClientCompany();
  const country = (value(formData, "company_country") || "JP") as "JP" | "AU";
  const currency = (value(formData, "default_currency") || (country === "AU" ? "AUD" : "JPY")) as "JPY" | "AUD";

  await supabase
    .from("profiles")
    .update({
      user_type: "client_company",
      company_name: value(formData, "company_name") || null,
      business_name: value(formData, "trading_name") || null,
      owner_name: value(formData, "owner_name") || null,
      address: value(formData, "address") || null,
      phone: value(formData, "phone") || null,
      phone_normalized: normalizePhone(value(formData, "phone")),
      email: value(formData, "email") || null,
      company_country: country,
      country,
      market: country,
      default_currency: currency,
      currency,
      invoice_registration_number: value(formData, "registration_number") || null,
      australia_abn: value(formData, "abn") || null,
      notes: value(formData, "notes") || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  await logActivity("client_company_profile_updated", "profile", user.id, user.id);
  revalidatePath("/client-portal/company-profile");
  redirect("/client-portal/company-profile");
}
