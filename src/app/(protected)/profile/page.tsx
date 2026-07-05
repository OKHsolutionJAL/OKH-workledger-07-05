"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field, SelectField, TextAreaField } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getZodErrors, type ValidationErrors, profileSchema } from "@/lib/validation";

type ProfileForm = {
  owner_name: string;
  business_name: string;
  email: string;
  phone: string;
  country: "JP" | "AU";
  company_country: "JP" | "AU";
  document_market: "JP" | "AU";
  address: string;
  postal_code: string;
  website: string;
  invoice_number: string;
  invoice_registration_number: string;
  bank_info: string;
  trading_name: string;
  abn: string;
  acn: string;
  gst_registered: string;
  gst_rate: string;
  business_address: string;
  bank_name: string;
  bsb: string;
  account_number: string;
  account_name: string;
  branch_name: string;
  account_type: string;
  account_holder: string;
  payment_terms: string;
  default_currency: "JPY" | "AUD";
  default_hourly_rate: string;
  notes: string;
  logo_url: string;
  stamp_url: string;
  stamp_image: string;
  qr_code_url: string;
};

const emptyForm: ProfileForm = {
  owner_name: "",
  business_name: "",
  email: "",
  phone: "",
  country: "JP",
  company_country: "JP",
  document_market: "JP",
  address: "",
  postal_code: "",
  website: "",
  invoice_number: "",
  invoice_registration_number: "",
  bank_info: "",
  trading_name: "",
  abn: "",
  acn: "",
  gst_registered: "true",
  gst_rate: "10",
  business_address: "",
  bank_name: "",
  bsb: "",
  account_number: "",
  account_name: "",
  branch_name: "",
  account_type: "",
  account_holder: "",
  payment_terms: "",
  default_currency: "JPY",
  default_hourly_rate: "0",
  notes: "",
  logo_url: "",
  stamp_url: "",
  stamp_image: "",
  qr_code_url: ""
};

function nullable(value: string) {
  return value.trim() || null;
}

export default function ProfilePage() {
  const { errorText, t } = useLanguage();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [userId, setUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
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

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (error) throw error;

        setForm({
          owner_name: data?.owner_name ?? (user.user_metadata.owner_name as string | undefined) ?? "",
          business_name: data?.business_name ?? (user.user_metadata.business_name as string | undefined) ?? "",
          email: data?.email ?? user.email ?? "",
          phone: data?.phone ?? "",
          country: data?.country ?? "JP",
          company_country: data?.company_country ?? "JP",
          document_market: data?.document_market ?? "JP",
          address: data?.address ?? "",
          postal_code: data?.postal_code ?? "",
          website: data?.website ?? "",
          invoice_number: data?.invoice_number ?? "",
          invoice_registration_number: data?.invoice_registration_number ?? "",
          bank_info: data?.bank_info ?? "",
          trading_name: data?.trading_name ?? "",
          abn: data?.abn ?? "",
          acn: data?.acn ?? "",
          gst_registered: String(data?.gst_registered ?? true),
          gst_rate: String(data?.gst_rate ?? 10),
          business_address: data?.business_address ?? "",
          bank_name: data?.bank_name ?? "",
          bsb: data?.bsb ?? "",
          account_number: data?.account_number ?? "",
          account_name: data?.account_name ?? "",
          branch_name: data?.branch_name ?? "",
          account_type: data?.account_type ?? "",
          account_holder: data?.account_holder ?? "",
          payment_terms: data?.payment_terms ?? "",
          default_currency: data?.default_currency ?? "JPY",
          default_hourly_rate: String(data?.default_hourly_rate ?? 0),
          notes: data?.notes ?? "",
          logo_url: data?.logo_url ?? "",
          stamp_url: data?.stamp_url ?? "",
          stamp_image: data?.stamp_image ?? "",
          qr_code_url: data?.qr_code_url ?? ""
        });
      } catch (caught) {
        setPageError(caught instanceof Error ? caught.message : t("errorProfileLoad"));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [t]);

  function updateField<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setSuccess(null);
    setPageError(null);

    const parsed = profileSchema.safeParse(form);
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
      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          owner_name: parsed.data.owner_name,
          business_name: parsed.data.business_name,
          email: parsed.data.email,
          phone: nullable(form.phone),
          country: parsed.data.country,
          company_country: parsed.data.company_country,
          document_market: parsed.data.document_market,
          address: nullable(form.address),
          postal_code: nullable(form.postal_code),
          website: nullable(form.website),
          invoice_number: nullable(form.invoice_number),
          invoice_registration_number: nullable(form.invoice_registration_number),
          bank_info: nullable(form.bank_info),
          trading_name: nullable(form.trading_name),
          abn: nullable(form.abn),
          acn: nullable(form.acn),
          gst_registered: parsed.data.gst_registered,
          gst_rate: parsed.data.gst_rate,
          business_address: nullable(form.business_address),
          bank_name: nullable(form.bank_name),
          bsb: nullable(form.bsb),
          account_number: nullable(form.account_number),
          account_name: nullable(form.account_name),
          branch_name: nullable(form.branch_name),
          account_type: nullable(form.account_type),
          account_holder: nullable(form.account_holder),
          payment_terms: nullable(form.payment_terms),
          default_currency: parsed.data.default_currency,
          default_hourly_rate: parsed.data.default_hourly_rate,
          notes: nullable(form.notes),
          logo_url: nullable(form.logo_url),
          stamp_url: nullable(form.stamp_url),
          stamp_image: nullable(form.stamp_image),
          qr_code_url: nullable(form.qr_code_url),
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

      if (error) throw error;
      setSuccess(t("profileSaved"));
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorProfileSave"));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <LoadingState label={t("loading")} />;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{t("profile")}</p>
        <h2 className="page-title">{t("profileTitle")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("profileDescription")}</p>
      </div>

      <form className="section-panel grid gap-5" onSubmit={handleSubmit}>
        <ErrorMessage message={pageError} />
        {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field error={errorText(errors.owner_name)} label={t("ownerName")} onChange={(event) => updateField("owner_name", event.target.value)} required value={form.owner_name} />
          <Field error={errorText(errors.business_name)} label={t("businessName")} onChange={(event) => updateField("business_name", event.target.value)} required value={form.business_name} />
          <Field error={errorText(errors.email)} label={t("email")} onChange={(event) => updateField("email", event.target.value)} required type="email" value={form.email} />
          <Field label={t("phone")} onChange={(event) => updateField("phone", event.target.value)} value={form.phone} />
          <SelectField label="Company country" onChange={(event) => updateField("company_country", event.target.value as ProfileForm["company_country"])} value={form.company_country}>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
          </SelectField>
          <SelectField label="Default document market" onChange={(event) => updateField("document_market", event.target.value as ProfileForm["document_market"])} value={form.document_market}>
            <option value="JP">Japan documents</option>
            <option value="AU">Australia documents</option>
          </SelectField>
          <SelectField label="Country" onChange={(event) => updateField("country", event.target.value as ProfileForm["country"])} value={form.country}>
            <option value="JP">JP</option>
            <option value="AU">AU</option>
          </SelectField>
          <SelectField label="Default currency" onChange={(event) => updateField("default_currency", event.target.value as ProfileForm["default_currency"])} value={form.default_currency}>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </SelectField>
          <Field label={t("postalCode")} onChange={(event) => updateField("postal_code", event.target.value)} value={form.postal_code} />
          <Field error={errorText(errors.website)} label={t("website")} onChange={(event) => updateField("website", event.target.value)} type="url" value={form.website} />
          <Field label={t("invoiceNumber")} onChange={(event) => updateField("invoice_number", event.target.value)} value={form.invoice_number} />
          <Field
            error={errorText(errors.default_hourly_rate)}
            label={t("defaultHourlyRate")}
            min="0"
            onChange={(event) => updateField("default_hourly_rate", event.target.value)}
            required
            step="1"
            type="number"
            value={form.default_hourly_rate}
          />
        </div>

        <div className="grid gap-3 rounded-lg border border-line bg-paper p-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Australia business details</h3>
            <p className="text-sm text-zinc-500">Used only for Australian documents in English.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Trading name" onChange={(event) => updateField("trading_name", event.target.value)} value={form.trading_name} />
            <Field label="ABN" onChange={(event) => updateField("abn", event.target.value)} value={form.abn} />
            <Field label="ACN" onChange={(event) => updateField("acn", event.target.value)} value={form.acn} />
            <SelectField label="GST registered" onChange={(event) => updateField("gst_registered", event.target.value)} value={form.gst_registered}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </SelectField>
            <Field error={errorText(errors.gst_rate)} label="GST rate (%)" min="0" onChange={(event) => updateField("gst_rate", event.target.value)} step="0.01" type="number" value={form.gst_rate} />
            <Field label="Bank name" onChange={(event) => updateField("bank_name", event.target.value)} value={form.bank_name} />
            <Field label="BSB" onChange={(event) => updateField("bsb", event.target.value)} value={form.bsb} />
            <Field label="Account number" onChange={(event) => updateField("account_number", event.target.value)} value={form.account_number} />
            <Field label="Account name" onChange={(event) => updateField("account_name", event.target.value)} value={form.account_name} />
          </div>
          <TextAreaField label="Business address" onChange={(event) => updateField("business_address", event.target.value)} value={form.business_address} />
          <TextAreaField label="Payment terms" onChange={(event) => updateField("payment_terms", event.target.value)} value={form.payment_terms} />
        </div>

        <div className="grid gap-3 rounded-lg border border-line bg-white p-4">
          <div>
            <h3 className="text-base font-semibold text-ink">Japan business details</h3>
            <p className="text-sm text-zinc-500">Used only for Japanese documents.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Invoice registration number" onChange={(event) => updateField("invoice_registration_number", event.target.value)} value={form.invoice_registration_number} />
            <Field label="Bank name" onChange={(event) => updateField("bank_name", event.target.value)} value={form.bank_name} />
            <Field label="Branch name" onChange={(event) => updateField("branch_name", event.target.value)} value={form.branch_name} />
            <Field label="Account type" onChange={(event) => updateField("account_type", event.target.value)} value={form.account_type} />
            <Field label="Account number" onChange={(event) => updateField("account_number", event.target.value)} value={form.account_number} />
            <Field label="Account holder" onChange={(event) => updateField("account_holder", event.target.value)} value={form.account_holder} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field error={errorText(errors.logo_url)} helper={t("logoUrlHint")} label={t("companyLogo")} onChange={(event) => updateField("logo_url", event.target.value)} type="url" value={form.logo_url} />
          <Field error={errorText(errors.stamp_url)} helper={t("stampUrlHint")} label={t("optionalStamp")} onChange={(event) => updateField("stamp_url", event.target.value)} type="url" value={form.stamp_url} />
          <Field error={errorText(errors.stamp_image)} helper="Optional URL for stamp image." label="Stamp image" onChange={(event) => updateField("stamp_image", event.target.value)} type="url" value={form.stamp_image} />
          <Field error={errorText(errors.qr_code_url)} helper={t("qrCodeHint")} label={t("optionalQrCode")} onChange={(event) => updateField("qr_code_url", event.target.value)} type="url" value={form.qr_code_url} />
        </div>

        <TextAreaField label={t("address")} onChange={(event) => updateField("address", event.target.value)} value={form.address} />
        <TextAreaField label={t("bankInfo")} onChange={(event) => updateField("bank_info", event.target.value)} value={form.bank_info} />
        <TextAreaField label={t("defaultDocumentNotes")} onChange={(event) => updateField("notes", event.target.value)} value={form.notes} />

        <div className="flex justify-end">
          <Button isLoading={isSaving} type="submit">
            {t("saveProfile")}
          </Button>
        </div>
      </form>
    </div>
  );
}
