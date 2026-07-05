"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileText, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field, SelectField, TextAreaField } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import type { Profile } from "@/lib/database.types";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type TaxMode = "inclusive" | "exclusive" | "none";

type DocumentSettingsForm = {
  default_document_market: "JP" | "AU";
  default_currency: "JPY" | "AUD";
  default_hourly_rate: string;
  default_daily_rate: string;
  overtime_rate_percent: string;
  night_rate_percent: string;
  weekend_rate_percent: string;
  holiday_rate_percent: string;
  night_start_time: string;
  night_end_time: string;
  custom_premium_enabled: string;
  default_due_days: string;
  next_document_sequence: string;
  japan_invoice_prefix: string;
  japan_estimate_prefix: string;
  japan_delivery_prefix: string;
  japan_receipt_prefix: string;
  australia_invoice_prefix: string;
  australia_quote_prefix: string;
  australia_receipt_prefix: string;
  australia_statement_prefix: string;
  tax_calculation_mode: TaxMode;
  japan_consumption_tax_enabled: string;
  japan_tax_rate: string;
  japan_show_consumption_tax: string;
  japan_show_invoice_number: string;
  japan_invoice_registration_number: string;
  australia_gst_registered: string;
  australia_gst_calculation_mode: TaxMode;
  australia_gst_rate: string;
  australia_show_gst: string;
  business_name: string;
  trading_name: string;
  australia_abn: string;
  australia_acn: string;
  japan_bank_name: string;
  japan_branch_name: string;
  japan_account_type: string;
  japan_account_number: string;
  japan_account_holder: string;
  australia_bank_name: string;
  australia_bsb: string;
  australia_account_number: string;
  australia_account_name: string;
  document_notes: string;
  payment_terms: string;
};

const emptyDocumentSettings: DocumentSettingsForm = {
  default_document_market: "JP",
  default_currency: "JPY",
  default_hourly_rate: "0",
  default_daily_rate: "0",
  overtime_rate_percent: "25",
  night_rate_percent: "25",
  weekend_rate_percent: "35",
  holiday_rate_percent: "50",
  night_start_time: "22:00",
  night_end_time: "05:00",
  custom_premium_enabled: "true",
  default_due_days: "30",
  next_document_sequence: "1",
  japan_invoice_prefix: "INV",
  japan_estimate_prefix: "EST",
  japan_delivery_prefix: "DEL",
  japan_receipt_prefix: "REC",
  australia_invoice_prefix: "INV",
  australia_quote_prefix: "QUO",
  australia_receipt_prefix: "REC",
  australia_statement_prefix: "STM",
  tax_calculation_mode: "exclusive",
  japan_consumption_tax_enabled: "true",
  japan_tax_rate: "10",
  japan_show_consumption_tax: "true",
  japan_show_invoice_number: "true",
  japan_invoice_registration_number: "",
  australia_gst_registered: "true",
  australia_gst_calculation_mode: "exclusive",
  australia_gst_rate: "10",
  australia_show_gst: "true",
  business_name: "",
  trading_name: "",
  australia_abn: "",
  australia_acn: "",
  japan_bank_name: "",
  japan_branch_name: "",
  japan_account_type: "",
  japan_account_number: "",
  japan_account_holder: "",
  australia_bank_name: "",
  australia_bsb: "",
  australia_account_number: "",
  australia_account_name: "",
  document_notes: "",
  payment_terms: ""
};

const settingsText: Record<
  Language,
  {
    documentSettings: string;
    documentSettingsHint: string;
    saveDocumentSettings: string;
    saved: string;
    general: string;
    japanTax: string;
    australiaGst: string;
    bankSettings: string;
    notesTerms: string;
    defaultMarket: string;
    defaultCurrency: string;
    defaultHourlyRate: string;
    defaultDailyRate: string;
    premiumSettings: string;
    overtimeRate: string;
    nightRate: string;
    weekendRate: string;
    holidayRate: string;
    nightStart: string;
    nightEnd: string;
    customPremiumEnabled: string;
    defaultDueDays: string;
    nextSequence: string;
    japanPrefixes: string;
    australiaPrefixes: string;
    useConsumptionTax: string;
    calculationMode: string;
    taxRate: string;
    showTax: string;
    showInvoiceNumber: string;
    invoiceRegistrationNumber: string;
    gstRegistered: string;
    gstCalculation: string;
    gstRate: string;
    showGst: string;
    businessName: string;
    tradingName: string;
    yes: string;
    no: string;
    inclusive: string;
    exclusive: string;
    none: string;
    japanBank: string;
    australiaBank: string;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    accountName: string;
    documentNotes: string;
    paymentTerms: string;
    saveError: string;
  }
> = {
  pt: {
    documentSettings: "Configura\u00e7\u00f5es de Lan\u00e7amentos e Documentos",
    documentSettingsHint:
      "Defina mercado, moeda, valores padr\u00e3o, impostos, vencimento, numera\u00e7\u00e3o e dados banc\u00e1rios usados nos lan\u00e7amentos e documentos.",
    saveDocumentSettings: "Salvar configura\u00e7\u00f5es",
    saved: "Configura\u00e7\u00f5es salvas.",
    general: "Configura\u00e7\u00e3o geral",
    japanTax: "Imposto Jap\u00e3o",
    australiaGst: "GST Austr\u00e1lia",
    bankSettings: "Dados banc\u00e1rios",
    notesTerms: "Observa\u00e7\u00f5es e termos",
    defaultMarket: "Mercado padr\u00e3o",
    defaultCurrency: "Moeda padr\u00e3o",
    defaultHourlyRate: "Valor padr\u00e3o por hora",
    defaultDailyRate: "Valor padr\u00e3o por dia",
    premiumSettings: "Adicionais de hora",
    overtimeRate: "Hora extra (%)",
    nightRate: "Adicional noturno (%)",
    weekendRate: "Fim de semana (%)",
    holidayRate: "Feriado (%)",
    nightStart: "Inicio do periodo noturno",
    nightEnd: "Fim do periodo noturno",
    customPremiumEnabled: "Permitir adicional personalizado?",
    defaultDueDays: "Dias padr\u00e3o para vencimento",
    nextSequence: "Pr\u00f3ximo n\u00famero sequencial",
    japanPrefixes: "Prefixos Jap\u00e3o",
    australiaPrefixes: "Prefixos Austr\u00e1lia",
    useConsumptionTax: "Usar imposto de consumo?",
    calculationMode: "Tipo de c\u00e1lculo",
    taxRate: "Taxa padr\u00e3o (%)",
    showTax: "Mostrar imposto no documento",
    showInvoiceNumber: "Mostrar n\u00famero de invoice",
    invoiceRegistrationNumber: "N\u00famero de registro invoice",
    gstRegistered: "GST registered?",
    gstCalculation: "GST calculation",
    gstRate: "GST rate (%)",
    showGst: "Show GST on document",
    businessName: "Business name",
    tradingName: "Trading name",
    yes: "Sim",
    no: "N\u00e3o",
    inclusive: "Imposto incluso",
    exclusive: "Imposto separado",
    none: "Sem imposto",
    japanBank: "Jap\u00e3o",
    australiaBank: "Austr\u00e1lia",
    bankName: "Banco",
    branchName: "Ag\u00eancia",
    accountType: "Tipo de conta",
    accountNumber: "N\u00famero da conta",
    accountHolder: "Titular da conta",
    accountName: "Nome da conta",
    documentNotes: "Observa\u00e7\u00e3o padr\u00e3o do documento",
    paymentTerms: "Termos de pagamento padr\u00e3o",
    saveError: "N\u00e3o foi poss\u00edvel salvar as configura\u00e7\u00f5es de documentos."
  },
  ja: {
    documentSettings: "\u4f5c\u696d\u30fb\u66f8\u985e\u8a2d\u5b9a",
    documentSettingsHint:
      "\u5e02\u5834\u3001\u901a\u8ca8\u3001\u6a19\u6e96\u5358\u4fa1\u3001\u7a0e\u91d1\u3001\u652f\u6255\u671f\u9650\u3001\u756a\u53f7\u3001\u632f\u8fbc\u5148\u3092\u8a2d\u5b9a\u3057\u307e\u3059\u3002",
    saveDocumentSettings: "\u8a2d\u5b9a\u3092\u4fdd\u5b58",
    saved: "\u8a2d\u5b9a\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    general: "\u57fa\u672c\u8a2d\u5b9a",
    japanTax: "\u65e5\u672c\u306e\u6d88\u8cbb\u7a0e\u8a2d\u5b9a",
    australiaGst: "\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2GST\u8a2d\u5b9a",
    bankSettings: "\u632f\u8fbc\u5148\u60c5\u5831",
    notesTerms: "\u5099\u8003\u30fb\u652f\u6255\u6761\u4ef6",
    defaultMarket: "\u6a19\u6e96\u5e02\u5834",
    defaultCurrency: "\u6a19\u6e96\u901a\u8ca8",
    defaultHourlyRate: "\u6a19\u6e96\u6642\u7d66",
    defaultDailyRate: "\u6a19\u6e96\u65e5\u5f53",
    premiumSettings: "\u6642\u9593\u5272\u5897\u8a2d\u5b9a",
    overtimeRate: "\u6b8b\u696d\u5272\u5897\uff08%\uff09",
    nightRate: "\u6df1\u591c\u5272\u5897\uff08%\uff09",
    weekendRate: "\u9031\u672b\u5272\u5897\uff08%\uff09",
    holidayRate: "\u795d\u65e5\u5272\u5897\uff08%\uff09",
    nightStart: "\u6df1\u591c\u958b\u59cb",
    nightEnd: "\u6df1\u591c\u7d42\u4e86",
    customPremiumEnabled: "\u4efb\u610f\u624b\u5f53\u3092\u4f7f\u7528",
    defaultDueDays: "\u6a19\u6e96\u652f\u6255\u671f\u9650\uff08\u65e5\u6570\uff09",
    nextSequence: "\u6b21\u56de\u63a1\u756a\u756a\u53f7",
    japanPrefixes: "\u65e5\u672c\u306e\u756a\u53f7\u30d7\u30ec\u30d5\u30a3\u30c3\u30af\u30b9",
    australiaPrefixes: "\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2\u306e\u756a\u53f7\u30d7\u30ec\u30d5\u30a3\u30c3\u30af\u30b9",
    useConsumptionTax: "\u6d88\u8cbb\u7a0e\u3092\u4f7f\u7528\u3059\u308b",
    calculationMode: "\u8a08\u7b97\u65b9\u6cd5",
    taxRate: "\u6a19\u6e96\u7a0e\u7387\uff08%\uff09",
    showTax: "\u66f8\u985e\u306b\u6d88\u8cbb\u7a0e\u3092\u8868\u793a",
    showInvoiceNumber: "\u30a4\u30f3\u30dc\u30a4\u30b9\u756a\u53f7\u3092\u8868\u793a",
    invoiceRegistrationNumber: "\u9069\u683c\u8acb\u6c42\u66f8\u767a\u884c\u4e8b\u696d\u8005\u767b\u9332\u756a\u53f7",
    gstRegistered: "GST\u767b\u9332\u6e08\u307f",
    gstCalculation: "GST\u8a08\u7b97\u65b9\u6cd5",
    gstRate: "GST\u7a0e\u7387\uff08%\uff09",
    showGst: "\u66f8\u985e\u306bGST\u3092\u8868\u793a",
    businessName: "\u4e8b\u696d\u8005\u540d",
    tradingName: "\u5c4b\u53f7",
    yes: "\u306f\u3044",
    no: "\u3044\u3044\u3048",
    inclusive: "\u7a0e\u8fbc",
    exclusive: "\u7a0e\u5225",
    none: "\u7a0e\u306a\u3057",
    japanBank: "\u65e5\u672c",
    australiaBank: "\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2",
    bankName: "\u9280\u884c\u540d",
    branchName: "\u652f\u5e97\u540d",
    accountType: "\u53e3\u5ea7\u7a2e\u5225",
    accountNumber: "\u53e3\u5ea7\u756a\u53f7",
    accountHolder: "\u53e3\u5ea7\u540d\u7fa9",
    accountName: "\u53e3\u5ea7\u540d\u7fa9",
    documentNotes: "\u66f8\u985e\u306e\u6a19\u6e96\u5099\u8003",
    paymentTerms: "\u6a19\u6e96\u652f\u6255\u6761\u4ef6",
    saveError: "\u66f8\u985e\u8a2d\u5b9a\u3092\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002"
  },
  en: {
    documentSettings: "Work Entry & Document Settings",
    documentSettingsHint: "Set market, currency, default rates, tax, due dates, numbering and bank details for entries and documents.",
    saveDocumentSettings: "Save settings",
    saved: "Settings saved.",
    general: "General settings",
    japanTax: "Japan tax settings",
    australiaGst: "Australia GST settings",
    bankSettings: "Bank details",
    notesTerms: "Notes and terms",
    defaultMarket: "Default market",
    defaultCurrency: "Default currency",
    defaultHourlyRate: "Default hourly rate",
    defaultDailyRate: "Default daily rate",
    premiumSettings: "Hourly premiums",
    overtimeRate: "Overtime (%)",
    nightRate: "Night premium (%)",
    weekendRate: "Weekend (%)",
    holidayRate: "Holiday (%)",
    nightStart: "Night period starts",
    nightEnd: "Night period ends",
    customPremiumEnabled: "Allow custom premium?",
    defaultDueDays: "Default due days",
    nextSequence: "Next sequential number",
    japanPrefixes: "Japan prefixes",
    australiaPrefixes: "Australia prefixes",
    useConsumptionTax: "Use consumption tax?",
    calculationMode: "Calculation mode",
    taxRate: "Default rate (%)",
    showTax: "Show tax on document",
    showInvoiceNumber: "Show invoice number",
    invoiceRegistrationNumber: "Invoice registration number",
    gstRegistered: "GST registered?",
    gstCalculation: "GST calculation",
    gstRate: "GST rate (%)",
    showGst: "Show GST on document",
    businessName: "Business name",
    tradingName: "Trading name",
    yes: "Yes",
    no: "No",
    inclusive: "Tax inclusive",
    exclusive: "Tax exclusive",
    none: "No tax",
    japanBank: "Japan",
    australiaBank: "Australia",
    bankName: "Bank name",
    branchName: "Branch name",
    accountType: "Account type",
    accountNumber: "Account number",
    accountHolder: "Account holder",
    accountName: "Account name",
    documentNotes: "Default document notes",
    paymentTerms: "Default payment terms",
    saveError: "Could not save document settings."
  }
};

function nullable(value: string) {
  return value.trim() || null;
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function settingsFromProfile(profile: Profile | null): DocumentSettingsForm {
  return {
    ...emptyDocumentSettings,
    default_document_market: profile?.default_document_market ?? profile?.document_market ?? "JP",
    default_currency: profile?.default_currency ?? "JPY",
    default_hourly_rate: String(profile?.default_hourly_rate ?? 0),
    default_daily_rate: String(profile?.default_daily_rate ?? 0),
    overtime_rate_percent: String(profile?.overtime_rate_percent ?? 25),
    night_rate_percent: String(profile?.night_rate_percent ?? 25),
    weekend_rate_percent: String(profile?.weekend_rate_percent ?? 35),
    holiday_rate_percent: String(profile?.holiday_rate_percent ?? 50),
    night_start_time: profile?.night_start_time ?? "22:00",
    night_end_time: profile?.night_end_time ?? "05:00",
    custom_premium_enabled: String(profile?.custom_premium_enabled ?? true),
    default_due_days: String(profile?.default_due_days ?? 30),
    next_document_sequence: String(profile?.next_document_sequence ?? 1),
    japan_invoice_prefix: profile?.japan_invoice_prefix ?? "INV",
    japan_estimate_prefix: profile?.japan_estimate_prefix ?? "EST",
    japan_delivery_prefix: profile?.japan_delivery_prefix ?? "DEL",
    japan_receipt_prefix: profile?.japan_receipt_prefix ?? "REC",
    australia_invoice_prefix: profile?.australia_invoice_prefix ?? "INV",
    australia_quote_prefix: profile?.australia_quote_prefix ?? "QUO",
    australia_receipt_prefix: profile?.australia_receipt_prefix ?? "REC",
    australia_statement_prefix: profile?.australia_statement_prefix ?? "STM",
    tax_calculation_mode: profile?.tax_calculation_mode ?? "exclusive",
    japan_consumption_tax_enabled: String(profile?.japan_consumption_tax_enabled ?? true),
    japan_tax_rate: String(profile?.japan_tax_rate ?? 10),
    japan_show_consumption_tax: String(profile?.japan_show_consumption_tax ?? true),
    japan_show_invoice_number: String(profile?.japan_show_invoice_number ?? true),
    japan_invoice_registration_number: profile?.japan_invoice_registration_number ?? profile?.invoice_registration_number ?? "",
    australia_gst_registered: String(profile?.australia_gst_registered ?? profile?.gst_registered ?? true),
    australia_gst_calculation_mode: profile?.australia_gst_calculation_mode ?? "exclusive",
    australia_gst_rate: String(profile?.australia_gst_rate ?? profile?.gst_rate ?? 10),
    australia_show_gst: String(profile?.australia_show_gst ?? true),
    business_name: profile?.business_name ?? "",
    trading_name: profile?.trading_name ?? "",
    australia_abn: profile?.australia_abn ?? profile?.abn ?? "",
    australia_acn: profile?.australia_acn ?? profile?.acn ?? "",
    japan_bank_name: profile?.japan_bank_name ?? profile?.bank_name ?? "",
    japan_branch_name: profile?.japan_branch_name ?? profile?.branch_name ?? "",
    japan_account_type: profile?.japan_account_type ?? profile?.account_type ?? "",
    japan_account_number: profile?.japan_account_number ?? profile?.account_number ?? "",
    japan_account_holder: profile?.japan_account_holder ?? profile?.account_holder ?? "",
    australia_bank_name: profile?.australia_bank_name ?? profile?.bank_name ?? "",
    australia_bsb: profile?.australia_bsb ?? profile?.bsb ?? "",
    australia_account_number: profile?.australia_account_number ?? profile?.account_number ?? "",
    australia_account_name: profile?.australia_account_name ?? profile?.account_name ?? "",
    document_notes: profile?.document_notes ?? profile?.notes ?? "",
    payment_terms: profile?.payment_terms ?? ""
  };
}

export default function SettingsPage() {
  const { language, t } = useLanguage();
  const text = settingsText[language];
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [documentSettings, setDocumentSettings] = useState<DocumentSettingsForm>(emptyDocumentSettings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingDocuments, setIsSavingDocuments] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setError(null);
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
        const { data, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (profileError) throw profileError;
        setDocumentSettings(settingsFromProfile(data));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("errorProfileLoad"));
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [t]);

  function updateDocumentField<K extends keyof DocumentSettingsForm>(field: K, value: DocumentSettingsForm[K]) {
    setDocumentSettings((current) => ({ ...current, [field]: value }));
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingPassword(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword("");
      setSuccess(t("passwordUpdated"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorPasswordUpdate"));
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDocumentSettingsSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId) {
      setError(t("errorSessionExpired"));
      return;
    }

    const defaultDueDays = Math.max(numberValue(documentSettings.default_due_days, 30), 0);
    const defaultHourlyRate = Math.max(numberValue(documentSettings.default_hourly_rate, 0), 0);
    const defaultDailyRate = Math.max(numberValue(documentSettings.default_daily_rate, 0), 0);
    const overtimeRatePercent = Math.max(numberValue(documentSettings.overtime_rate_percent, 25), 0);
    const nightRatePercent = Math.max(numberValue(documentSettings.night_rate_percent, 25), 0);
    const weekendRatePercent = Math.max(numberValue(documentSettings.weekend_rate_percent, 35), 0);
    const holidayRatePercent = Math.max(numberValue(documentSettings.holiday_rate_percent, 50), 0);
    const nextDocumentSequence = Math.max(numberValue(documentSettings.next_document_sequence, 1), 1);
    const japanTaxRate = Math.max(numberValue(documentSettings.japan_tax_rate, 10), 0);
    const australiaGstRate = Math.max(numberValue(documentSettings.australia_gst_rate, 10), 0);
    const japanInvoiceRegistrationNumber = nullable(documentSettings.japan_invoice_registration_number);
    const australiaAbn = nullable(documentSettings.australia_abn);
    const australiaAcn = nullable(documentSettings.australia_acn);
    const japanBankName = nullable(documentSettings.japan_bank_name);
    const japanAccountNumber = nullable(documentSettings.japan_account_number);
    const australiaBankName = nullable(documentSettings.australia_bank_name);
    const australiaAccountNumber = nullable(documentSettings.australia_account_number);
    const documentNotes = nullable(documentSettings.document_notes);

    setIsSavingDocuments(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error: saveError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          business_name: nullable(documentSettings.business_name),
          trading_name: nullable(documentSettings.trading_name),
          document_market: documentSettings.default_document_market,
          default_document_market: documentSettings.default_document_market,
          default_currency: documentSettings.default_currency,
          default_hourly_rate: defaultHourlyRate,
          default_daily_rate: defaultDailyRate,
          overtime_rate_percent: overtimeRatePercent,
          night_rate_percent: nightRatePercent,
          weekend_rate_percent: weekendRatePercent,
          holiday_rate_percent: holidayRatePercent,
          night_start_time: documentSettings.night_start_time || "22:00",
          night_end_time: documentSettings.night_end_time || "05:00",
          custom_premium_enabled: documentSettings.custom_premium_enabled === "true",
          default_due_days: defaultDueDays,
          next_document_sequence: nextDocumentSequence,
          japan_invoice_prefix: documentSettings.japan_invoice_prefix.trim() || "INV",
          japan_estimate_prefix: documentSettings.japan_estimate_prefix.trim() || "EST",
          japan_delivery_prefix: documentSettings.japan_delivery_prefix.trim() || "DEL",
          japan_receipt_prefix: documentSettings.japan_receipt_prefix.trim() || "REC",
          australia_invoice_prefix: documentSettings.australia_invoice_prefix.trim() || "INV",
          australia_quote_prefix: documentSettings.australia_quote_prefix.trim() || "QUO",
          australia_receipt_prefix: documentSettings.australia_receipt_prefix.trim() || "REC",
          australia_statement_prefix: documentSettings.australia_statement_prefix.trim() || "STM",
          tax_calculation_mode: documentSettings.tax_calculation_mode,
          japan_consumption_tax_enabled: documentSettings.japan_consumption_tax_enabled === "true",
          japan_tax_rate: japanTaxRate,
          japan_show_consumption_tax: documentSettings.japan_show_consumption_tax === "true",
          japan_show_invoice_number: documentSettings.japan_show_invoice_number === "true",
          japan_invoice_registration_number: japanInvoiceRegistrationNumber,
          invoice_registration_number: japanInvoiceRegistrationNumber,
          australia_gst_registered: documentSettings.australia_gst_registered === "true",
          gst_registered: documentSettings.australia_gst_registered === "true",
          australia_gst_calculation_mode: documentSettings.australia_gst_calculation_mode,
          australia_gst_rate: australiaGstRate,
          gst_rate: australiaGstRate,
          australia_show_gst: documentSettings.australia_show_gst === "true",
          australia_abn: australiaAbn,
          australia_acn: australiaAcn,
          abn: australiaAbn,
          acn: australiaAcn,
          japan_bank_name: japanBankName,
          japan_branch_name: nullable(documentSettings.japan_branch_name),
          japan_account_type: nullable(documentSettings.japan_account_type),
          japan_account_number: japanAccountNumber,
          japan_account_holder: nullable(documentSettings.japan_account_holder),
          australia_bank_name: australiaBankName,
          australia_bsb: nullable(documentSettings.australia_bsb),
          australia_account_number: australiaAccountNumber,
          australia_account_name: nullable(documentSettings.australia_account_name),
          bank_name: japanBankName || australiaBankName,
          bsb: nullable(documentSettings.australia_bsb),
          account_number: japanAccountNumber || australiaAccountNumber,
          account_name: nullable(documentSettings.australia_account_name),
          branch_name: nullable(documentSettings.japan_branch_name),
          account_type: nullable(documentSettings.japan_account_type),
          account_holder: nullable(documentSettings.japan_account_holder),
          document_notes: documentNotes,
          notes: documentNotes,
          payment_terms: nullable(documentSettings.payment_terms),
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

      if (saveError) throw saveError;
      setSuccess(text.saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.saveError);
    } finally {
      setIsSavingDocuments(false);
    }
  }

  if (isLoading) return <LoadingState label={t("loading")} />;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{t("settings")}</p>
        <h2 className="page-title">{t("settingsTitle")}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("settingsDescription")}</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-panel">
          <ShieldCheck className="h-6 w-6 text-jade-700" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-ink">{t("dataSecurity")}</h3>
          <p className="mt-2 text-sm text-zinc-600">{t("dataSecurityDescription")}</p>
        </article>
        <article className="section-panel">
          <Smartphone className="h-6 w-6 text-jade-700" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-ink">{t("mobileInstall")}</h3>
          <p className="mt-2 text-sm text-zinc-600">{t("mobileInstallDescription")}</p>
        </article>
        <article className="section-panel">
          <KeyRound className="h-6 w-6 text-jade-700" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-semibold text-ink">{t("supabaseAuth")}</h3>
          <p className="mt-2 text-sm text-zinc-600">{t("supabaseAuthDescription")}</p>
        </article>
      </section>

      <ErrorMessage message={error} />
      {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

      <form className="section-panel grid gap-5" onSubmit={handleDocumentSettingsSave}>
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-6 w-6 text-jade-700" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-ink">{text.documentSettings}</h3>
            <p className="text-sm text-zinc-500">{text.documentSettingsHint}</p>
          </div>
        </div>

        <section className="grid gap-4 rounded-lg border border-line bg-paper p-4">
          <h4 className="font-semibold text-ink">{text.general}</h4>
          <div className="grid gap-4 md:grid-cols-4">
            <SelectField label={text.defaultMarket} onChange={(event) => updateDocumentField("default_document_market", event.target.value as "JP" | "AU")} value={documentSettings.default_document_market}>
              <option value="JP">Japan</option>
              <option value="AU">Australia</option>
            </SelectField>
            <SelectField label={text.defaultCurrency} onChange={(event) => updateDocumentField("default_currency", event.target.value as "JPY" | "AUD")} value={documentSettings.default_currency}>
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
            </SelectField>
            <Field label={text.defaultHourlyRate} min="0" onChange={(event) => updateDocumentField("default_hourly_rate", event.target.value)} type="number" value={documentSettings.default_hourly_rate} />
            <Field label={text.defaultDailyRate} min="0" onChange={(event) => updateDocumentField("default_daily_rate", event.target.value)} type="number" value={documentSettings.default_daily_rate} />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label={text.defaultDueDays} min="0" onChange={(event) => updateDocumentField("default_due_days", event.target.value)} type="number" value={documentSettings.default_due_days} />
            <Field label={text.nextSequence} min="1" onChange={(event) => updateDocumentField("next_document_sequence", event.target.value)} type="number" value={documentSettings.next_document_sequence} />
          </div>
          <div className="grid gap-4 rounded-lg border border-line bg-white p-4">
            <h5 className="font-semibold text-ink">{text.premiumSettings}</h5>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label={text.overtimeRate} min="0" onChange={(event) => updateDocumentField("overtime_rate_percent", event.target.value)} type="number" value={documentSettings.overtime_rate_percent} />
              <Field label={text.nightRate} min="0" onChange={(event) => updateDocumentField("night_rate_percent", event.target.value)} type="number" value={documentSettings.night_rate_percent} />
              <Field label={text.weekendRate} min="0" onChange={(event) => updateDocumentField("weekend_rate_percent", event.target.value)} type="number" value={documentSettings.weekend_rate_percent} />
              <Field label={text.holidayRate} min="0" onChange={(event) => updateDocumentField("holiday_rate_percent", event.target.value)} type="number" value={documentSettings.holiday_rate_percent} />
              <Field label={text.nightStart} onChange={(event) => updateDocumentField("night_start_time", event.target.value)} type="time" value={documentSettings.night_start_time} />
              <Field label={text.nightEnd} onChange={(event) => updateDocumentField("night_end_time", event.target.value)} type="time" value={documentSettings.night_end_time} />
              <SelectField label={text.customPremiumEnabled} onChange={(event) => updateDocumentField("custom_premium_enabled", event.target.value)} value={documentSettings.custom_premium_enabled}>
                <option value="true">{text.yes}</option>
                <option value="false">{text.no}</option>
              </SelectField>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label={`${text.japanPrefixes} INV`} onChange={(event) => updateDocumentField("japan_invoice_prefix", event.target.value)} value={documentSettings.japan_invoice_prefix} />
            <Field label={`${text.japanPrefixes} EST`} onChange={(event) => updateDocumentField("japan_estimate_prefix", event.target.value)} value={documentSettings.japan_estimate_prefix} />
            <Field label={`${text.japanPrefixes} DEL`} onChange={(event) => updateDocumentField("japan_delivery_prefix", event.target.value)} value={documentSettings.japan_delivery_prefix} />
            <Field label={`${text.japanPrefixes} REC`} onChange={(event) => updateDocumentField("japan_receipt_prefix", event.target.value)} value={documentSettings.japan_receipt_prefix} />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label={`${text.australiaPrefixes} INV`} onChange={(event) => updateDocumentField("australia_invoice_prefix", event.target.value)} value={documentSettings.australia_invoice_prefix} />
            <Field label={`${text.australiaPrefixes} QUO`} onChange={(event) => updateDocumentField("australia_quote_prefix", event.target.value)} value={documentSettings.australia_quote_prefix} />
            <Field label={`${text.australiaPrefixes} REC`} onChange={(event) => updateDocumentField("australia_receipt_prefix", event.target.value)} value={documentSettings.australia_receipt_prefix} />
            <Field label={`${text.australiaPrefixes} STM`} onChange={(event) => updateDocumentField("australia_statement_prefix", event.target.value)} value={documentSettings.australia_statement_prefix} />
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-line bg-white p-4">
          <h4 className="font-semibold text-ink">{text.japanTax}</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField label={text.useConsumptionTax} onChange={(event) => updateDocumentField("japan_consumption_tax_enabled", event.target.value)} value={documentSettings.japan_consumption_tax_enabled}>
              <option value="true">{text.yes}</option>
              <option value="false">{text.no}</option>
            </SelectField>
            <SelectField label={text.calculationMode} onChange={(event) => updateDocumentField("tax_calculation_mode", event.target.value as TaxMode)} value={documentSettings.tax_calculation_mode}>
              <option value="inclusive">{text.inclusive}</option>
              <option value="exclusive">{text.exclusive}</option>
              <option value="none">{text.none}</option>
            </SelectField>
            <SelectField label={text.taxRate} onChange={(event) => updateDocumentField("japan_tax_rate", event.target.value)} value={documentSettings.japan_tax_rate}>
              <option value="10">10%</option>
              <option value="8">8%</option>
              <option value="0">0%</option>
            </SelectField>
            <SelectField label={text.showTax} onChange={(event) => updateDocumentField("japan_show_consumption_tax", event.target.value)} value={documentSettings.japan_show_consumption_tax}>
              <option value="true">{text.yes}</option>
              <option value="false">{text.no}</option>
            </SelectField>
            <SelectField label={text.showInvoiceNumber} onChange={(event) => updateDocumentField("japan_show_invoice_number", event.target.value)} value={documentSettings.japan_show_invoice_number}>
              <option value="true">{text.yes}</option>
              <option value="false">{text.no}</option>
            </SelectField>
            <Field label={text.invoiceRegistrationNumber} onChange={(event) => updateDocumentField("japan_invoice_registration_number", event.target.value)} value={documentSettings.japan_invoice_registration_number} />
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-line bg-white p-4">
          <h4 className="font-semibold text-ink">{text.australiaGst}</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField label={text.gstRegistered} onChange={(event) => updateDocumentField("australia_gst_registered", event.target.value)} value={documentSettings.australia_gst_registered}>
              <option value="true">{text.yes}</option>
              <option value="false">{text.no}</option>
            </SelectField>
            <SelectField label={text.gstCalculation} onChange={(event) => updateDocumentField("australia_gst_calculation_mode", event.target.value as TaxMode)} value={documentSettings.australia_gst_calculation_mode}>
              <option value="inclusive">{text.inclusive}</option>
              <option value="exclusive">{text.exclusive}</option>
              <option value="none">{text.none}</option>
            </SelectField>
            <SelectField label={text.gstRate} onChange={(event) => updateDocumentField("australia_gst_rate", event.target.value)} value={documentSettings.australia_gst_rate}>
              <option value="10">10%</option>
              <option value="0">0%</option>
            </SelectField>
            <SelectField label={text.showGst} onChange={(event) => updateDocumentField("australia_show_gst", event.target.value)} value={documentSettings.australia_show_gst}>
              <option value="true">{text.yes}</option>
              <option value="false">{text.no}</option>
            </SelectField>
            <Field label={text.businessName} onChange={(event) => updateDocumentField("business_name", event.target.value)} value={documentSettings.business_name} />
            <Field label={text.tradingName} onChange={(event) => updateDocumentField("trading_name", event.target.value)} value={documentSettings.trading_name} />
            <Field label="ABN" onChange={(event) => updateDocumentField("australia_abn", event.target.value)} value={documentSettings.australia_abn} />
            <Field label="ACN" onChange={(event) => updateDocumentField("australia_acn", event.target.value)} value={documentSettings.australia_acn} />
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-line bg-paper p-4">
          <h4 className="font-semibold text-ink">{text.bankSettings}</h4>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="grid gap-3">
              <h5 className="text-sm font-semibold text-zinc-700">{text.japanBank}</h5>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={text.bankName} onChange={(event) => updateDocumentField("japan_bank_name", event.target.value)} value={documentSettings.japan_bank_name} />
                <Field label={text.branchName} onChange={(event) => updateDocumentField("japan_branch_name", event.target.value)} value={documentSettings.japan_branch_name} />
                <Field label={text.accountType} onChange={(event) => updateDocumentField("japan_account_type", event.target.value)} value={documentSettings.japan_account_type} />
                <Field label={text.accountNumber} onChange={(event) => updateDocumentField("japan_account_number", event.target.value)} value={documentSettings.japan_account_number} />
                <Field label={text.accountHolder} onChange={(event) => updateDocumentField("japan_account_holder", event.target.value)} value={documentSettings.japan_account_holder} />
              </div>
            </div>
            <div className="grid gap-3">
              <h5 className="text-sm font-semibold text-zinc-700">{text.australiaBank}</h5>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={text.bankName} onChange={(event) => updateDocumentField("australia_bank_name", event.target.value)} value={documentSettings.australia_bank_name} />
                <Field label="BSB" onChange={(event) => updateDocumentField("australia_bsb", event.target.value)} value={documentSettings.australia_bsb} />
                <Field label={text.accountNumber} onChange={(event) => updateDocumentField("australia_account_number", event.target.value)} value={documentSettings.australia_account_number} />
                <Field label={text.accountName} onChange={(event) => updateDocumentField("australia_account_name", event.target.value)} value={documentSettings.australia_account_name} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 rounded-lg border border-line bg-white p-4">
          <h4 className="font-semibold text-ink">{text.notesTerms}</h4>
          <TextAreaField label={text.documentNotes} onChange={(event) => updateDocumentField("document_notes", event.target.value)} value={documentSettings.document_notes} />
          <TextAreaField label={text.paymentTerms} onChange={(event) => updateDocumentField("payment_terms", event.target.value)} value={documentSettings.payment_terms} />
        </section>

        <div className="flex justify-end">
          <Button isLoading={isSavingDocuments} type="submit">
            {text.saveDocumentSettings}
          </Button>
        </div>
      </form>

      <form className="section-panel grid max-w-xl gap-4" onSubmit={handlePasswordUpdate}>
        <div>
          <h3 className="text-lg font-semibold text-ink">{t("changePassword")}</h3>
          <p className="text-sm text-zinc-500">{t("passwordHint")}</p>
        </div>
        <Field
          autoComplete="new-password"
          label={t("newPassword")}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <div className="flex justify-end">
          <Button isLoading={isSavingPassword} type="submit">
            {t("updatePassword")}
          </Button>
        </div>
      </form>
    </div>
  );
}
