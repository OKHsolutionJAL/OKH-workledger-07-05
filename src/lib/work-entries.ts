import { calculateNetHours } from "@/lib/calculations";
import type { Client, TimeEntry, WorkEntry } from "@/lib/database.types";
import type { Language } from "@/lib/i18n/translations";
import type { DocumentMarket } from "@/lib/pdf/types";

export const workEntryTypes = [
  "hourly_work",
  "daily_work",
  "fixed_service",
  "client_expense",
  "business_expense",
  "material",
  "adjustment"
] as const;

export type WorkEntryType = (typeof workEntryTypes)[number];

export const workEntryStatuses = ["draft", "billable", "invoiced", "paid", "cancelled", "non_billable"] as const;
export type WorkEntryStatus = (typeof workEntryStatuses)[number];

export type WorkEntryWithClient = WorkEntry & {
  clients?: (Pick<Client, "client_name" | "client_name_jp"> & { hourly_rate?: number | null }) | null;
};

export type WorkEntryLike = {
  id: string;
  user_id?: string | null;
  client_id?: string | null;
  client_company_id?: string | null;
  contractor_relationship_id?: string | null;
  entry_type?: WorkEntryType | string | null;
  market?: "JP" | "AU" | string | null;
  date?: string | null;
  work_date?: string | null;
  title?: string | null;
  service_type?: string | null;
  description?: string | null;
  location?: string | null;
  site_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  break_minutes?: number | null;
  hours?: number | null;
  days?: number | null;
  quantity?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  hourly_rate?: number | null;
  daily_rate?: number | null;
  fixed_amount?: number | null;
  expense_amount?: number | null;
  toll_amount?: number | null;
  fuel_amount?: number | null;
  material_cost?: number | null;
  markup_amount?: number | null;
  discount_amount?: number | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  currency?: "JPY" | "AUD" | string | null;
  tax_mode?: "inclusive" | "exclusive" | "none" | string | null;
  tax_rate?: number | null;
  is_billable?: boolean | null;
  is_business_expense?: boolean | null;
  is_client_charge?: boolean | null;
  receipt_url?: string | null;
  status?: WorkEntryStatus | string | null;
  visibility_to_client?: boolean | null;
  sent_to_client_at?: string | null;
  client_review_status?: "draft" | "sent" | "received" | "approved" | "rejected" | "paid" | string | null;
  client_review_comment?: string | null;
  client_reviewed_at?: string | null;
  overtime_hours?: number | null;
  overtime_rate_percent?: number | null;
  night_hours?: number | null;
  night_rate_percent?: number | null;
  weekend_hours?: number | null;
  weekend_rate_percent?: number | null;
  holiday_hours?: number | null;
  holiday_rate_percent?: number | null;
  custom_premium_title?: string | null;
  custom_premium_amount?: number | null;
  normal_amount?: number | null;
  overtime_amount?: number | null;
  night_premium_amount?: number | null;
  weekend_premium_amount?: number | null;
  holiday_premium_amount?: number | null;
  premium_total_amount?: number | null;
  notes?: string | null;
  memo?: string | null;
  is_invoiced?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  clients?: (Pick<Client, "client_name" | "client_name_jp"> & { hourly_rate?: number | null }) | null;
};

export const expenseCategories = [
  { key: "fuel", pt: "Combustivel", en: "Fuel", ja: "\u71c3\u6599" },
  { key: "parking", pt: "Estacionamento", en: "Parking", ja: "\u99d0\u8eca\u5834" },
  { key: "toll", pt: "Pedagio", en: "Toll", ja: "\u9ad8\u901f\u6599\u91d1" },
  { key: "material", pt: "Material", en: "Material", ja: "\u6750\u6599" },
  { key: "tools", pt: "Ferramentas", en: "Tools", ja: "\u5de5\u5177" },
  { key: "vehicle", pt: "Veiculo", en: "Vehicle", ja: "\u8eca\u4e21" },
  { key: "phone", pt: "Telefone", en: "Phone", ja: "\u96fb\u8a71" },
  { key: "internet", pt: "Internet", en: "Internet", ja: "\u30a4\u30f3\u30bf\u30fc\u30cd\u30c3\u30c8" },
  { key: "rent", pt: "Aluguel", en: "Rent", ja: "\u5bb6\u8cc3" },
  { key: "software", pt: "Software", en: "Software", ja: "\u30bd\u30d5\u30c8\u30a6\u30a7\u30a2" },
  { key: "marketing", pt: "Marketing", en: "Marketing", ja: "\u5e83\u544a\u5ba3\u4f1d" },
  { key: "outsourcing", pt: "Terceirizacao", en: "Outsourcing", ja: "\u5916\u6ce8\u8cbb" },
  { key: "office", pt: "Escritorio", en: "Office supplies", ja: "\u4e8b\u52d9\u7528\u54c1" },
  { key: "training", pt: "Curso", en: "Training", ja: "\u7814\u4fee\u8cbb" },
  { key: "insurance", pt: "Seguro", en: "Insurance", ja: "\u4fdd\u967a" },
  { key: "bank_fee", pt: "Taxa bancaria", en: "Bank fee", ja: "\u624b\u6570\u6599" },
  { key: "tax_accounting", pt: "Contabilidade/imposto", en: "Tax/accounting", ja: "\u7a0e\u52d9\u30fb\u4f1a\u8a08" },
  { key: "other", pt: "Outros", en: "Other", ja: "\u305d\u306e\u4ed6" }
] as const;

export const workEntryTypeLabels: Record<Language, Record<WorkEntryType, string>> = {
  pt: {
    hourly_work: "Trabalho por hora",
    daily_work: "Trabalho por dia",
    fixed_service: "Servico fechado",
    client_expense: "Despesa do cliente",
    business_expense: "Despesa do negocio",
    material: "Material",
    adjustment: "Desconto/Ajuste"
  },
  ja: {
    hourly_work: "\u6642\u9593\u4f5c\u696d",
    daily_work: "\u65e5\u5f53\u4f5c\u696d",
    fixed_service: "\u5b9a\u984d\u30b5\u30fc\u30d3\u30b9",
    client_expense: "\u53d6\u5f15\u5148\u8acb\u6c42\u7d4c\u8cbb",
    business_expense: "\u4e8b\u696d\u7d4c\u8cbb",
    material: "\u6750\u6599",
    adjustment: "\u5024\u5f15\u304d\u30fb\u8abf\u6574"
  },
  en: {
    hourly_work: "Hourly work",
    daily_work: "Daily work",
    fixed_service: "Fixed service",
    client_expense: "Client expense",
    business_expense: "Business expense",
    material: "Material",
    adjustment: "Discount/Adjustment"
  }
};

export const japaneseDocumentLineLabels: Record<WorkEntryType, string> = {
  hourly_work: "\u4f5c\u696d\u8cbb",
  daily_work: "\u65e5\u5f53\u4f5c\u696d",
  fixed_service: "\u5b9a\u984d\u30b5\u30fc\u30d3\u30b9",
  client_expense: "\u7acb\u66ff\u7d4c\u8cbb",
  business_expense: "\u4e8b\u696d\u7d4c\u8cbb",
  material: "\u6750\u6599\u8cbb",
  adjustment: "\u5024\u5f15\u304d"
};

export const australianDocumentLineLabels: Record<WorkEntryType, string> = {
  hourly_work: "Labour",
  daily_work: "Daily work",
  fixed_service: "Fixed service",
  client_expense: "Reimbursable expenses",
  business_expense: "Business expense",
  material: "Materials",
  adjustment: "Discount"
};

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isWorkEntryMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  return maybeError.code === "42P01" || String(maybeError.message ?? "").includes("work_entries");
}

export function normalizeWorkEntryType(value: unknown): WorkEntryType {
  return workEntryTypes.includes(value as WorkEntryType) ? (value as WorkEntryType) : "hourly_work";
}

export function workEntryDate(entry: WorkEntryLike) {
  return entry.date || entry.work_date || "";
}

export function workEntryTitle(entry: WorkEntryLike) {
  return String(entry.title || entry.service_type || entry.description || "").trim();
}

export function workEntryLocation(entry: WorkEntryLike) {
  return String(entry.location || entry.site_name || "").trim();
}

export function workEntryNotes(entry: WorkEntryLike) {
  return String(entry.notes || entry.memo || "").trim();
}

export function calculateWorkEntryHours(entry: WorkEntryLike) {
  const explicitHours = numberValue(entry.hours, NaN);
  if (Number.isFinite(explicitHours) && explicitHours > 0) return Number(explicitHours.toFixed(2));
  return calculateNetHours(String(entry.start_time ?? ""), String(entry.end_time ?? ""), numberValue(entry.break_minutes));
}

export function calculateHourlyPremiumBreakdown(entry: WorkEntryLike) {
  const hourlyRate = numberValue(entry.hourly_rate);
  const normalHours = calculateWorkEntryHours(entry);
  const overtimeAmount = numberValue(entry.overtime_hours) * hourlyRate * (numberValue(entry.overtime_rate_percent, 25) / 100);
  const nightAmount = numberValue(entry.night_hours) * hourlyRate * (numberValue(entry.night_rate_percent, 25) / 100);
  const weekendAmount = numberValue(entry.weekend_hours) * hourlyRate * (numberValue(entry.weekend_rate_percent, 35) / 100);
  const holidayAmount = numberValue(entry.holiday_hours) * hourlyRate * (numberValue(entry.holiday_rate_percent, 50) / 100);
  const customAmount = numberValue(entry.custom_premium_amount);
  const normalAmount = normalHours * hourlyRate;
  const premiumTotal = overtimeAmount + nightAmount + weekendAmount + holidayAmount + customAmount;

  return {
    normalAmount: Number(normalAmount.toFixed(2)),
    overtimeAmount: Number(overtimeAmount.toFixed(2)),
    nightAmount: Number(nightAmount.toFixed(2)),
    weekendAmount: Number(weekendAmount.toFixed(2)),
    holidayAmount: Number(holidayAmount.toFixed(2)),
    customAmount: Number(customAmount.toFixed(2)),
    premiumTotal: Number(premiumTotal.toFixed(2)),
    total: Number((normalAmount + premiumTotal).toFixed(2))
  };
}

export function calculateWorkEntryAmount(entry: WorkEntryLike) {
  const type = normalizeWorkEntryType(entry.entry_type);
  const explicitTotal = numberValue(entry.total_amount, NaN);
  if (Number.isFinite(explicitTotal) && (explicitTotal !== 0 || type !== "hourly_work")) return Number(explicitTotal.toFixed(2));

  if (type === "hourly_work") {
    const extras = numberValue(entry.expense_amount) + numberValue(entry.toll_amount) + numberValue(entry.fuel_amount);
    return Number((calculateHourlyPremiumBreakdown(entry).total + extras).toFixed(2));
  }

  if (type === "daily_work") return Number((numberValue(entry.days, 1) * numberValue(entry.daily_rate)).toFixed(2));
  if (type === "fixed_service") return Number(numberValue(entry.fixed_amount).toFixed(2));
  if (type === "client_expense" || type === "business_expense") return Number(numberValue(entry.expense_amount).toFixed(2));

  if (type === "material") {
    const quantity = Math.max(numberValue(entry.quantity, 1), 0);
    const unitPrice = numberValue(entry.unit_price, NaN);
    if (Number.isFinite(unitPrice)) return Number((quantity * unitPrice).toFixed(2));
    return Number((numberValue(entry.material_cost) + numberValue(entry.markup_amount)).toFixed(2));
  }

  const discount = Math.abs(numberValue(entry.discount_amount || entry.fixed_amount || entry.subtotal));
  return Number((-discount).toFixed(2));
}

export function isDocumentBillableEntry(entry: WorkEntryLike) {
  const type = normalizeWorkEntryType(entry.entry_type);
  if (type === "business_expense") return false;
  if (entry.is_business_expense) return false;
  if (entry.is_billable === false) return false;
  return true;
}

export function legacyTimeEntryToWorkEntry(entry: TimeEntry & { clients?: WorkEntryLike["clients"] }): WorkEntryLike {
  return {
    ...entry,
    entry_type: "hourly_work",
    date: entry.work_date,
    title: entry.service_type,
    description: entry.service_type,
    location: entry.site_name,
    hours: calculateNetHours(entry.start_time, entry.end_time, entry.break_minutes),
    total_amount: calculateWorkEntryAmount({ ...entry, entry_type: "hourly_work", id: entry.id }),
    currency: "JPY",
    status: entry.is_invoiced ? "invoiced" : "billable",
    is_billable: true,
    is_business_expense: false,
    is_client_charge: true
  };
}

export function formatWorkCurrency(value: number | null | undefined, currency: "JPY" | "AUD" | string = "JPY") {
  const amount = Number(value || 0);
  if (currency === "AUD") {
    return `A$${amount.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return `\u00a5${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0
  })}`;
}

export function documentEntryDescription(entry: WorkEntryLike, market: DocumentMarket) {
  const type = normalizeWorkEntryType(entry.entry_type);
  const labels = market === "AU" ? australianDocumentLineLabels : japaneseDocumentLineLabels;
  const title = workEntryTitle(entry);
  const location = workEntryLocation(entry);
  const premiumParts =
    type === "hourly_work"
      ? [
          numberValue(entry.overtime_hours) > 0
            ? market === "AU"
              ? `Overtime ${numberValue(entry.overtime_hours)}h`
              : `\u6b8b\u696d ${numberValue(entry.overtime_hours)}\u6642\u9593`
            : "",
          numberValue(entry.night_hours) > 0
            ? market === "AU"
              ? `Night ${numberValue(entry.night_hours)}h`
              : `\u6df1\u591c ${numberValue(entry.night_hours)}\u6642\u9593`
            : "",
          numberValue(entry.weekend_hours) > 0
            ? market === "AU"
              ? `Weekend ${numberValue(entry.weekend_hours)}h`
              : `\u9031\u672b ${numberValue(entry.weekend_hours)}\u6642\u9593`
            : "",
          numberValue(entry.holiday_hours) > 0
            ? market === "AU"
              ? `Holiday ${numberValue(entry.holiday_hours)}h`
              : `\u795d\u65e5 ${numberValue(entry.holiday_hours)}\u6642\u9593`
            : "",
          entry.custom_premium_title ? String(entry.custom_premium_title) : ""
        ].filter(Boolean)
      : [];
  const parts = [labels[type], title, location, ...premiumParts].filter(Boolean);
  return parts.join(market === "AU" ? " - " : " / ");
}

export function documentEntryQuantity(entry: WorkEntryLike) {
  const type = normalizeWorkEntryType(entry.entry_type);
  if (type === "hourly_work") return calculateWorkEntryHours(entry);
  if (type === "daily_work") return numberValue(entry.days, 1);
  if (type === "material") return numberValue(entry.quantity, 1);
  return 1;
}

export function documentEntryUnit(entry: WorkEntryLike, market: DocumentMarket) {
  const type = normalizeWorkEntryType(entry.entry_type);
  if (type === "hourly_work") return market === "AU" ? "Hours" : "\u6642\u9593";
  if (type === "daily_work") return market === "AU" ? "Days" : "\u65e5";
  if (type === "material") return String(entry.unit || (market === "AU" ? "pcs" : "\u500b"));
  return market === "AU" ? "Item" : "\u5f0f";
}

export function documentEntryUnitPrice(entry: WorkEntryLike) {
  const type = normalizeWorkEntryType(entry.entry_type);
  if (type === "hourly_work") return numberValue(entry.hourly_rate);
  if (type === "daily_work") return numberValue(entry.daily_rate);
  if (type === "material") {
    const unitPrice = numberValue(entry.unit_price, NaN);
    if (Number.isFinite(unitPrice)) return unitPrice;
  }

  return calculateWorkEntryAmount(entry);
}

export function summarizeWorkEntries(entries: WorkEntryLike[]) {
  const dates = new Set(entries.map(workEntryDate).filter(Boolean));
  const clientIds = new Set(entries.map((entry) => entry.client_id).filter(Boolean));

  const totals = entries.reduce(
    (summary, entry) => {
      const type = normalizeWorkEntryType(entry.entry_type);
      const amount = calculateWorkEntryAmount(entry);
      const taxAmount = numberValue(entry.tax_amount);

      summary.totalHours += calculateWorkEntryHours(entry);
      summary.totalTax += taxAmount;

      if (type === "daily_work") summary.totalDailyDays += numberValue(entry.days, 1);
      if (type === "fixed_service") summary.totalFixedServices += amount;
      if (type === "client_expense") summary.totalClientExpenses += amount;
      if (type === "business_expense") summary.totalBusinessExpenses += amount;
      if (type === "material") summary.totalMaterials += amount;

      if (type === "business_expense" || entry.is_business_expense || entry.is_billable === false) {
        summary.expenseEntries += amount;
      } else {
        summary.incomeEntries += amount;
      }

      summary.totalAmount += amount;
      summary.totalsByType[type] += amount;
      return summary;
    },
    {
      totalHours: 0,
      totalDailyDays: 0,
      totalFixedServices: 0,
      totalClientExpenses: 0,
      totalBusinessExpenses: 0,
      totalMaterials: 0,
      totalTax: 0,
      totalAmount: 0,
      incomeEntries: 0,
      expenseEntries: 0,
      totalsByType: {
        hourly_work: 0,
        daily_work: 0,
        fixed_service: 0,
        client_expense: 0,
        business_expense: 0,
        material: 0,
        adjustment: 0
      } satisfies Record<WorkEntryType, number>
    }
  );

  return {
    totalDays: dates.size,
    activeClients: clientIds.size,
    totalHours: Number(totals.totalHours.toFixed(2)),
    workedDays: dates.size,
    dailyWorkDays: Number(totals.totalDailyDays.toFixed(2)),
    fixedServices: Number(totals.totalFixedServices.toFixed(2)),
    clientExpenses: Number(totals.totalClientExpenses.toFixed(2)),
    businessExpenses: Number(totals.totalBusinessExpenses.toFixed(2)),
    materials: Number(totals.totalMaterials.toFixed(2)),
    totalExpenses: Number((totals.totalClientExpenses + totals.totalBusinessExpenses).toFixed(2)),
    taxAmount: Number(totals.totalTax.toFixed(2)),
    totalAmount: Number(totals.totalAmount.toFixed(2)),
    totalBilled: Number(totals.incomeEntries.toFixed(2)),
    estimatedProfit: Number((totals.incomeEntries - totals.expenseEntries).toFixed(2)),
    totalsByType: totals.totalsByType
  };
}
