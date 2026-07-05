"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field, SelectField, TextAreaField } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import type { Client } from "@/lib/database.types";
import { formatCurrency } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { clientSchema, getZodErrors, type ValidationErrors } from "@/lib/validation";

type ClientForm = {
  client_name: string;
  client_name_jp: string;
  address: string;
  phone: string;
  email: string;
  contact_person: string;
  invoice_number: string;
  client_country: "JP" | "AU";
  preferred_document_market: "JP" | "AU";
  currency: "JPY" | "AUD";
  hourly_rate: string;
  notes: string;
};

const emptyForm: ClientForm = {
  client_name: "",
  client_name_jp: "",
  address: "",
  phone: "",
  email: "",
  contact_person: "",
  invoice_number: "",
  client_country: "JP",
  preferred_document_market: "JP",
  currency: "JPY",
  hourly_rate: "",
  notes: ""
};

function nullable(value: string) {
  return value.trim() || null;
}

export default function ClientsPage() {
  const { errorText, t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadClients = useCallback(async () => {
    setPageError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error(t("errorSessionExpired"));
      setUserId(user.id);

      const { data, error } = await supabase.from("clients").select("*").eq("user_id", user.id).order("client_name");
      if (error) throw error;
      setClients(data ?? []);
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorClientsLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  function updateField<K extends keyof ClientForm>(field: K, value: ClientForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setSuccess(null);
    setErrors({});
    setForm({
      client_name: client.client_name,
      client_name_jp: client.client_name_jp ?? "",
      address: client.address ?? "",
      phone: client.phone ?? "",
      email: client.email ?? "",
      contact_person: client.contact_person ?? "",
      invoice_number: client.invoice_number ?? "",
      client_country: client.client_country ?? "JP",
      preferred_document_market: client.preferred_document_market ?? "JP",
      currency: client.currency ?? "JPY",
      hourly_rate: client.hourly_rate == null ? "" : String(client.hourly_rate),
      notes: client.notes ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSuccess(null);
    setPageError(null);

    const parsed = clientSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getZodErrors(parsed.error));
      return;
    }

    if (!userId) {
      setPageError(t("errorSessionExpired"));
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseBrowser();
      const payload = {
        client_name: parsed.data.client_name,
        client_name_jp: nullable(form.client_name_jp),
        address: nullable(form.address),
        phone: nullable(form.phone),
        email: nullable(form.email),
        contact_person: nullable(form.contact_person),
        invoice_number: nullable(form.invoice_number),
        client_country: parsed.data.client_country,
        preferred_document_market: parsed.data.preferred_document_market,
        currency: parsed.data.currency,
        hourly_rate: parsed.data.hourly_rate,
        notes: nullable(form.notes),
        updated_at: new Date().toISOString()
      };

      const result = editingId
        ? await supabase.from("clients").update(payload).eq("id", editingId).eq("user_id", userId)
        : await supabase.from("clients").insert({ ...payload, user_id: userId });

      if (result.error) throw result.error;

      setSuccess(editingId ? t("clientUpdated") : t("clientSaved"));
      resetForm();
      await loadClients();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorSaveClient"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteClient(client: Client) {
    const confirmed = window.confirm(t("confirmDeleteClient").replace("{name}", client.client_name));
    if (!confirmed || !userId) return;

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("clients").delete().eq("id", client.id).eq("user_id", userId);
      if (error) throw error;
      await loadClients();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorDeleteClient"));
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{t("clients")}</p>
        <h2 className="page-title">{t("clientsTitle")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("clientsDescription")}</p>
      </div>

      <form className="section-panel grid gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-ink">{editingId ? t("editClient") : t("newClient")}</h3>
            <p className="text-sm text-zinc-500">{t("emptyFieldsLater")}</p>
          </div>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              {t("cancelEdit")}
            </Button>
          ) : null}
        </div>

        <ErrorMessage message={pageError} />
        {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field error={errorText(errors.client_name)} label={t("clientCompanyName")} onChange={(event) => updateField("client_name", event.target.value)} required value={form.client_name} />
          <Field label={t("clientJapaneseName")} onChange={(event) => updateField("client_name_jp", event.target.value)} value={form.client_name_jp} />
          <Field label={t("phone")} onChange={(event) => updateField("phone", event.target.value)} value={form.phone} />
          <Field error={errorText(errors.email)} label={t("email")} onChange={(event) => updateField("email", event.target.value)} type="email" value={form.email} />
          <Field label={t("responsiblePerson")} onChange={(event) => updateField("contact_person", event.target.value)} value={form.contact_person} />
          <Field label={t("clientInvoiceNumber")} onChange={(event) => updateField("invoice_number", event.target.value)} value={form.invoice_number} />
          <SelectField label="Client country" onChange={(event) => updateField("client_country", event.target.value as ClientForm["client_country"])} value={form.client_country}>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
          </SelectField>
          <SelectField
            label="Preferred document market"
            onChange={(event) => updateField("preferred_document_market", event.target.value as ClientForm["preferred_document_market"])}
            value={form.preferred_document_market}
          >
            <option value="JP">Japan documents</option>
            <option value="AU">Australia documents</option>
          </SelectField>
          <SelectField label="Currency" onChange={(event) => updateField("currency", event.target.value as ClientForm["currency"])} value={form.currency}>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </SelectField>
          <Field
            error={errorText(errors.hourly_rate)}
            helper={t("optionalHourlyRateHint")}
            label={t("hourlyRate")}
            min="0"
            onChange={(event) => updateField("hourly_rate", event.target.value)}
            step="1"
            type="number"
            value={form.hourly_rate}
          />
        </div>
        <TextAreaField label={t("address")} onChange={(event) => updateField("address", event.target.value)} value={form.address} />
        <TextAreaField label={t("notes")} onChange={(event) => updateField("notes", event.target.value)} value={form.notes} />
        <div className="flex justify-end">
          <Button isLoading={isSaving} type="submit">
            {editingId ? t("saveChanges") : t("registerClient")}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <LoadingState label={t("loading")} />
      ) : clients.length === 0 ? (
        <EmptyState title={t("noClients")} description={t("registerFirstClient")} />
      ) : (
        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{t("clientsRegistered")}</h3>
          <div className="grid gap-3 md:hidden">
            {clients.map((client) => (
              <article className="rounded-lg border border-line bg-white p-4" key={client.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-ink">{client.client_name}</h4>
                    {client.client_name_jp ? <p className="text-sm text-zinc-500">{client.client_name_jp}</p> : null}
                    <p className="mt-1 text-xs font-semibold text-zinc-500">{client.preferred_document_market === "AU" ? "Australia / AUD" : "Japan / JPY"}</p>
                    <p className="mt-2 text-sm text-zinc-600">{client.hourly_rate == null ? t("usesDefaultRate") : formatCurrency(client.hourly_rate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="px-3" type="button" variant="secondary" onClick={() => startEdit(client)}>
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button className="px-3" type="button" variant="danger" onClick={() => deleteClient(client)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("client")}</th>
                  <th>{t("responsiblePerson")}</th>
                  <th>{t("email")}</th>
                  <th>Market</th>
                  <th>{t("hourlyRate")}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="font-medium text-ink">{client.client_name}</div>
                      {client.client_name_jp ? <div className="text-xs text-zinc-500">{client.client_name_jp}</div> : null}
                    </td>
                    <td>{client.contact_person || "-"}</td>
                    <td>{client.email || "-"}</td>
                    <td>{client.preferred_document_market === "AU" ? "Australia" : "Japan"}</td>
                    <td>{client.hourly_rate == null ? t("defaultRate") : formatCurrency(client.hourly_rate)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => startEdit(client)}>
                          {t("edit")}
                        </Button>
                        <Button type="button" variant="danger" onClick={() => deleteClient(client)}>
                          {t("delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
