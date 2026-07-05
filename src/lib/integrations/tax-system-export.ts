import type { Client, Database, Profile } from "@/lib/database.types";
import { buildDocumentClient } from "@/lib/pdf/document-client";
import { normalizeDocumentMarket, type DocumentEntry, type DocumentMarket } from "@/lib/pdf/types";
import { calculateWorkEntryAmount, normalizeWorkEntryType, summarizeWorkEntries, workEntryDate } from "@/lib/work-entries";
import type { SupabaseClient } from "@supabase/supabase-js";

type ExportProfile = Profile & {
  default_document_market?: "JP" | "AU" | null;
  tax_calculation_mode?: "inclusive" | "exclusive" | "none" | null;
  japan_consumption_tax_enabled?: boolean | null;
  japan_tax_rate?: number | null;
  australia_gst_registered?: boolean | null;
  australia_gst_rate?: number | null;
  australia_gst_calculation_mode?: "inclusive" | "exclusive" | "none" | "no_gst" | null;
};

type ExportClient = Client & {
  client_country?: "JP" | "AU" | null;
  preferred_document_market?: "JP" | "AU" | null;
  currency?: "JPY" | "AUD" | null;
};

type ExportEntry = DocumentEntry;

type PrepareTaxSystemExportInput = {
  supabase: SupabaseClient<Database>;
  userId: string;
  profile: Profile | null;
  client: Client;
  entries: ExportEntry[];
  month: number;
  year: number;
};

function resolveMarket(profile: Profile | null, client: Client): DocumentMarket {
  const exportProfile = profile as ExportProfile | null;
  const exportClient = client as ExportClient;
  return normalizeDocumentMarket(
    exportClient.preferred_document_market ||
      exportClient.client_country ||
      exportProfile?.default_document_market ||
      exportProfile?.document_market ||
      exportProfile?.company_country ||
      exportProfile?.country
  );
}

function resolveCurrency(profile: Profile | null, client: Client, market: DocumentMarket) {
  const exportClient = client as ExportClient;
  return exportClient.currency || profile?.default_currency || (market === "AU" ? "AUD" : "JPY");
}

function normalizeTaxMode(value: unknown) {
  return value === "inclusive" || value === "exclusive" || value === "none" || value === "no_gst" ? value : "exclusive";
}

function calculateTax(profile: Profile | null, market: DocumentMarket, grossAmount: number) {
  const exportProfile = (profile ?? {}) as ExportProfile;
  const enabled =
    market === "AU"
      ? (exportProfile.australia_gst_registered ?? exportProfile.gst_registered ?? true)
      : (exportProfile.japan_consumption_tax_enabled ?? true);
  const mode =
    market === "AU"
      ? normalizeTaxMode(exportProfile.australia_gst_calculation_mode ?? exportProfile.tax_calculation_mode)
      : normalizeTaxMode(exportProfile.tax_calculation_mode);
  const rate =
    market === "AU"
      ? Number(exportProfile.australia_gst_rate ?? exportProfile.gst_rate ?? 10) / 100
      : Number(exportProfile.japan_tax_rate ?? 10) / 100;

  if (!enabled || mode === "none" || mode === "no_gst" || rate <= 0) {
    return { taxAmount: 0, netAmount: grossAmount };
  }

  if (mode === "inclusive") {
    const netAmount = Number((grossAmount / (1 + rate)).toFixed(2));
    return { taxAmount: Number((grossAmount - netAmount).toFixed(2)), netAmount };
  }

  const taxAmount = Number((grossAmount * rate).toFixed(2));
  return { taxAmount, netAmount: grossAmount };
}

function serializeEntry(entry: ExportEntry) {
  return {
    id: entry.id,
    clientId: entry.client_id ?? null,
    entryType: normalizeWorkEntryType(entry.entry_type),
    date: workEntryDate(entry),
    title: entry.title || entry.service_type || "",
    description: entry.description || entry.memo || "",
    location: entry.location || entry.site_name || "",
    totalAmount: calculateWorkEntryAmount(entry),
    taxAmount: Number(entry.tax_amount || 0),
    currency: entry.currency || "JPY",
    status: entry.status || (entry.is_invoiced ? "invoiced" : "billable")
  };
}

export async function prepareTaxSystemExport({
  supabase,
  userId,
  profile,
  client,
  entries,
  month,
  year
}: PrepareTaxSystemExportInput) {
  const market = resolveMarket(profile, client);
  const currency = resolveCurrency(profile, client, market);
  const totals = summarizeWorkEntries(entries);
  const grossAmount = totals.totalBilled;
  const { taxAmount, netAmount } = calculateTax(profile, market, grossAmount);
  const createdAt = new Date().toISOString();
  const documentClient = buildDocumentClient(client);
  const hourlyEntries = entries.filter((entry) => normalizeWorkEntryType(entry.entry_type) === "hourly_work").map(serializeEntry);
  const dailyEntries = entries.filter((entry) => normalizeWorkEntryType(entry.entry_type) === "daily_work").map(serializeEntry);
  const fixedServiceEntries = entries.filter((entry) => normalizeWorkEntryType(entry.entry_type) === "fixed_service").map(serializeEntry);
  const materialEntries = entries.filter((entry) => normalizeWorkEntryType(entry.entry_type) === "material").map(serializeEntry);
  const expenseEntries = entries
    .filter((entry) => normalizeWorkEntryType(entry.entry_type) === "business_expense" || entry.is_business_expense)
    .map(serializeEntry);
  const incomeEntries = entries
    .filter((entry) => normalizeWorkEntryType(entry.entry_type) !== "business_expense" && entry.is_billable !== false)
    .map(serializeEntry);

  const payload = {
    userId,
    client: documentClient,
    period: {
      year,
      month,
      label: `${year}-${String(month).padStart(2, "0")}`
    },
    market,
    currency,
    incomeEntries,
    expenseEntries,
    materialEntries,
    fixedServiceEntries,
    hourlyEntries,
    dailyEntries,
    tax: {
      amount: taxAmount,
      mode: market === "AU" ? "GST" : "consumption_tax",
      rate: market === "AU" ? (profile as ExportProfile | null)?.australia_gst_rate ?? 10 : (profile as ExportProfile | null)?.japan_tax_rate ?? 10
    },
    totals: {
      grossAmount,
      netAmount,
      taxAmount,
      totalHours: totals.totalHours,
      workedDays: totals.totalDays,
      dailyWorkDays: totals.dailyWorkDays,
      fixedServices: totals.fixedServices,
      clientExpenses: totals.clientExpenses,
      businessExpenses: totals.businessExpenses,
      materials: totals.materials,
      estimatedProfit: totals.estimatedProfit
    },
    createdAt
  };

  const { data, error } = await supabase
    .from("external_exports")
    .insert({
      user_id: userId,
      client_id: client.id,
      client_name: documentClient?.name || client.client_name,
      client_company_name: documentClient?.companyName || client.client_name,
      client_country: documentClient?.country || (client as ExportClient).client_country || market,
      document_id: null,
      export_type: "tax_declaration_data",
      target_system: "okh_tax_system",
      status: "pending",
      period_year: year,
      period_month: month,
      currency,
      gross_amount: grossAmount,
      tax_amount: taxAmount,
      net_amount: netAmount,
      expenses_amount: totals.businessExpenses,
      total_hours: totals.totalHours,
      worked_days: totals.totalDays,
      market,
      payload
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}
