"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { Json } from "@/lib/database.types";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function logAdminAction(action: string, targetUserId: string | null, details: Json = {}) {
  const { supabase, user } = await requireAdmin();
  await supabase.from("admin_audit_logs").insert({
    admin_user_id: user.id,
    target_user_id: targetUserId,
    action,
    details
  });
}

export async function updateUserAdmin(formData: FormData) {
  const { supabase } = await requireAdmin();
  const targetUserId = value(formData, "user_id");
  const planId = value(formData, "plan_id") || null;

  await supabase
    .from("profiles")
    .update({
      role: value(formData, "role") as "admin" | "client" | "support" | "accountant",
      account_status: value(formData, "account_status") as "active" | "blocked" | "suspended" | "trial",
      subscription_status: value(formData, "subscription_status") as "free" | "trial" | "active" | "past_due" | "cancelled" | "manual",
      plan_id: planId,
      updated_at: new Date().toISOString()
    })
    .eq("id", targetUserId);

  await logAdminAction("update_user_admin", targetUserId, {
    planId,
    role: value(formData, "role"),
    accountStatus: value(formData, "account_status"),
    subscriptionStatus: value(formData, "subscription_status")
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function toggleModuleAccess(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const targetUserId = value(formData, "user_id");
  const moduleName = value(formData, "module_name");
  const isEnabled = value(formData, "is_enabled") === "true";

  await supabase.from("user_module_access").upsert(
    {
      user_id: targetUserId,
      module_name: moduleName as "work_entries",
      is_enabled: isEnabled,
      enabled_by: user.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,module_name" }
  );

  await logAdminAction(isEnabled ? "enable_module" : "disable_module", targetUserId, { moduleName });
  revalidatePath("/admin/modules");
}

export async function updatePlan(formData: FormData) {
  const { supabase } = await requireAdmin();
  const planId = value(formData, "plan_id");

  await supabase
    .from("plans")
    .update({
      name: value(formData, "name"),
      description: value(formData, "description") || null,
      price_jpy: numberValue(formData, "price_jpy"),
      price_aud: numberValue(formData, "price_aud"),
      billing_cycle: value(formData, "billing_cycle") as "monthly" | "yearly" | "manual",
      max_clients: numberValue(formData, "max_clients"),
      max_entries_per_month: numberValue(formData, "max_entries_per_month"),
      can_use_japan_documents: formData.get("can_use_japan_documents") === "on",
      can_use_australia_documents: formData.get("can_use_australia_documents") === "on",
      can_use_expenses: formData.get("can_use_expenses") === "on",
      can_use_materials: formData.get("can_use_materials") === "on",
      can_use_tax_export: formData.get("can_use_tax_export") === "on",
      can_use_support: formData.get("can_use_support") === "on",
      can_use_courses: formData.get("can_use_courses") === "on",
      is_active: formData.get("is_active") === "on",
      updated_at: new Date().toISOString()
    })
    .eq("id", planId);

  await logAdminAction("update_plan", null, { planId });
  revalidatePath("/admin/plans");
}

export async function createManualPayment(formData: FormData) {
  const { supabase } = await requireAdmin();
  const targetUserId = value(formData, "user_id");

  await supabase.from("payments").insert({
    user_id: targetUserId,
    plan_id: value(formData, "plan_id") || null,
    amount: numberValue(formData, "amount"),
    currency: value(formData, "currency") as "JPY" | "AUD",
    status: value(formData, "status") as "pending" | "paid" | "failed" | "refunded" | "cancelled" | "manual",
    payment_method: value(formData, "payment_method") || "manual",
    billing_provider: "manual",
    due_date: value(formData, "due_date") || null,
    paid_at: value(formData, "status") === "paid" ? new Date().toISOString() : null,
    notes: value(formData, "notes") || null
  });

  await logAdminAction("create_manual_payment", targetUserId, { amount: value(formData, "amount") });
  revalidatePath("/admin/payments");
}

export async function updatePaymentStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const paymentId = value(formData, "payment_id");
  const status = value(formData, "status") as "pending" | "paid" | "failed" | "refunded" | "cancelled" | "manual";

  await supabase
    .from("payments")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", paymentId);

  await logAdminAction("update_payment_status", value(formData, "user_id") || null, { paymentId, status });
  revalidatePath("/admin/payments");
}

export async function updateSupportTicket(formData: FormData) {
  const { supabase } = await requireAdmin();
  const ticketId = value(formData, "ticket_id");
  const status = value(formData, "status") as "open" | "in_review" | "answered" | "resolved" | "closed";

  await supabase
    .from("support_tickets")
    .update({
      status,
      priority: value(formData, "priority") as "low" | "medium" | "high" | "urgent",
      admin_response: value(formData, "admin_response") || null,
      closed_at: status === "closed" || status === "resolved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", ticketId);

  await logAdminAction("update_support_ticket", value(formData, "user_id") || null, { ticketId, status });
  revalidatePath("/admin/support");
}

export async function updateAdminSettings(formData: FormData) {
  const { supabase } = await requireAdmin();
  const settingsId = value(formData, "settings_id");

  await supabase
    .from("admin_settings")
    .update({
      system_name: value(formData, "system_name") || "OKH WorkLedger",
      support_email: value(formData, "support_email") || null,
      default_market: value(formData, "default_market") as "JP" | "AU",
      default_currency: value(formData, "default_currency") as "JPY" | "AUD",
      free_trial_days: numberValue(formData, "free_trial_days", 14),
      trial_days: numberValue(formData, "trial_days", 14),
      payment_block_message: value(formData, "payment_block_message"),
      updated_at: new Date().toISOString()
    })
    .eq("id", settingsId);

  await logAdminAction("update_admin_settings", null, { settingsId });
  revalidatePath("/admin/settings");
}
