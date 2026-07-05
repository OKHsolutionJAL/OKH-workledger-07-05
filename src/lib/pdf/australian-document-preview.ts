import {
  australianDocumentLabels,
  australianDocumentMessages,
  australianDocumentNumberLabels,
  australianPdfLabels as labels
} from "@/lib/pdf/australian-document-labels";
import { buildDocumentClient, type DocumentClient } from "@/lib/pdf/document-client";
import { normalizeAustralianDocumentType, type AustralianDocumentInput, type AustralianDocumentType, type PdfAction } from "@/lib/pdf/types";
import {
  calculateWorkEntryAmount,
  documentEntryDescription,
  documentEntryQuantity,
  documentEntryUnit,
  documentEntryUnitPrice,
  formatWorkCurrency,
  summarizeWorkEntries,
  workEntryDate
} from "@/lib/work-entries";

export const australianDocumentPreviewStoragePrefix = "okh-workledger-australian-document-preview";

type AustralianProfileExtras = {
  trading_name?: string | null;
  abn?: string | null;
  acn?: string | null;
  gst_registered?: boolean | null;
  gst_rate?: number | null;
  default_due_days?: number | null;
  tax_calculation_mode?: "inclusive" | "exclusive" | "none" | null;
  australia_gst_registered?: boolean | null;
  australia_gst_calculation_mode?: "inclusive" | "exclusive" | "none" | null;
  australia_gst_rate?: number | null;
  australia_show_gst?: boolean | null;
  australia_abn?: string | null;
  australia_acn?: string | null;
  business_address?: string | null;
  document_notes?: string | null;
  bank_name?: string | null;
  bsb?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  australia_bank_name?: string | null;
  australia_bsb?: string | null;
  australia_account_number?: string | null;
  australia_account_name?: string | null;
  payment_terms?: string | null;
  default_currency?: string | null;
};

export type AustralianDocumentPreviewRow = {
  date: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
};

export type AustralianDocumentPreviewData = {
  market: "AU";
  type: AustralianDocumentType;
  title: string;
  message: string;
  numberLabel: string;
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  referenceMonth: string;
  client: DocumentClient | null;
  customerName: string;
  customerContact: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  customerRegistrationNumber: string;
  businessName: string;
  tradingName: string;
  abn: string;
  acn: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rows: AustralianDocumentPreviewRow[];
  subtotal: string;
  gst: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  gstNote: string;
  bankName: string;
  bsb: string;
  accountNumber: string;
  accountName: string;
  paymentTerms: string;
  notes: string;
  totalHours: number;
  totalDays: number;
  totalAmount: number;
};

const fallbackBusinessName = "Business name not set";
const fallbackCustomer = "Customer";
const fallbackUnset = "Not set";

function isGstRegistered(profile: AustralianProfileExtras) {
  return profile.australia_gst_registered ?? profile.gst_registered ?? true;
}

function gstRate(profile: AustralianProfileExtras) {
  return Number(profile.australia_gst_rate ?? profile.gst_rate ?? 10) / 100;
}

function normalizeGstMode(value: unknown) {
  return value === "inclusive" || value === "exclusive" || value === "none" ? value : "exclusive";
}

function numberSetting(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatAustralianDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function formatEntryDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "-";
  return formatAustralianDate(new Date(year, month - 1, day));
}

function formatAud(value: number) {
  return `A$${Number(value || 0).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatHours(value: number) {
  return Number(value || 0).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatQuantity(value: number) {
  return Number(value || 0).toLocaleString("en-AU", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function text(value: unknown, fallback = fallbackUnset) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function calculateAustralianTotals(baseValue: number, profile: AustralianProfileExtras) {
  const registeredForGst = isGstRegistered(profile);
  const rate = gstRate(profile);
  const mode = registeredForGst ? normalizeGstMode(profile.australia_gst_calculation_mode ?? profile.tax_calculation_mode) : "none";

  if (mode === "none" || rate <= 0) {
    return {
      subtotalValue: baseValue,
      gstValue: 0,
      totalValue: baseValue,
      mode
    };
  }

  if (mode === "inclusive") {
    const subtotalValue = Number((baseValue / (1 + rate)).toFixed(2));
    return {
      subtotalValue,
      gstValue: Number((baseValue - subtotalValue).toFixed(2)),
      totalValue: baseValue,
      mode
    };
  }

  const gstValue = Number((baseValue * rate).toFixed(2));
  return {
    subtotalValue: baseValue,
    gstValue,
    totalValue: Number((baseValue + gstValue).toFixed(2)),
    mode
  };
}

export function buildAustralianDocumentPreview(input: AustralianDocumentInput): AustralianDocumentPreviewData {
  const rawProfile = (input.profile ?? {}) as AustralianProfileExtras;
  const documentClient = buildDocumentClient(input.client);
  const registeredForGst = isGstRegistered(rawProfile);
  const safeType = registeredForGst ? normalizeAustralianDocumentType(input.type) : input.type === "tax_invoice" ? "invoice" : normalizeAustralianDocumentType(input.type);
  const baseValue = input.entries.reduce((sum, entry) => sum + calculateWorkEntryAmount(entry), 0);
  const { subtotalValue, gstValue, totalValue, mode } = calculateAustralianTotals(baseValue, rawProfile);
  const paidValue = safeType === "receipt" ? totalValue : 0;
  const balanceDueValue = Number((totalValue - paidValue).toFixed(2));
  const issueDate = new Date();
  const dueDays = Math.max(numberSetting(rawProfile.default_due_days, 14), 0);
  const totals = summarizeWorkEntries(input.entries);

  return {
    market: "AU",
    type: safeType,
    title: australianDocumentLabels[safeType],
    message: australianDocumentMessages[safeType],
    numberLabel: australianDocumentNumberLabels[safeType],
    documentNumber: input.documentNumber,
    issueDate: formatAustralianDate(issueDate),
    dueDate: formatAustralianDate(addDays(issueDate, dueDays)),
    referenceMonth: `${String(input.month).padStart(2, "0")}/${input.year}`,
    client: documentClient,
    customerName: text(documentClient?.companyName || documentClient?.name, fallbackCustomer),
    customerContact: text(documentClient?.contactPerson),
    customerAddress: text(documentClient?.address),
    customerPhone: text(documentClient?.phone),
    customerEmail: text(documentClient?.email),
    customerRegistrationNumber: text(documentClient?.registrationNumber),
    businessName: text(input.profile?.business_name, fallbackBusinessName),
    tradingName: text(rawProfile.trading_name),
    abn: text(rawProfile.australia_abn || rawProfile.abn || input.profile?.invoice_number),
    acn: text(rawProfile.australia_acn || rawProfile.acn),
    address: text(rawProfile.business_address || input.profile?.address),
    phone: text(input.profile?.phone),
    email: text(input.profile?.email),
    website: text(input.profile?.website),
    rows: input.entries.map((entry) => ({
      date: formatEntryDate(workEntryDate(entry)),
      description: documentEntryDescription(entry, "AU"),
      quantity: formatQuantity(documentEntryQuantity(entry)),
      unit: documentEntryUnit(entry, "AU"),
      unitPrice: formatWorkCurrency(documentEntryUnitPrice(entry), "AUD"),
      amount: formatWorkCurrency(calculateWorkEntryAmount(entry), "AUD")
    })),
    subtotal: formatAud(subtotalValue),
    gst: formatAud(gstValue),
    total: formatAud(totalValue),
    amountPaid: formatAud(paidValue),
    balanceDue: formatAud(balanceDueValue),
    gstNote:
      registeredForGst && mode !== "none"
        ? `GST has been calculated at ${Number((gstRate(rawProfile) * 100).toFixed(2)).toLocaleString("en-AU")}% (${mode}).`
        : labels.noGstCharged,
    bankName: text(rawProfile.australia_bank_name || rawProfile.bank_name),
    bsb: text(rawProfile.australia_bsb || rawProfile.bsb),
    accountNumber: text(rawProfile.australia_account_number || rawProfile.account_number),
    accountName: text(rawProfile.australia_account_name || rawProfile.account_name),
    paymentTerms: text(rawProfile.payment_terms, `Payment due within ${dueDays} days.`),
    notes:
      text(rawProfile.document_notes, "") ||
      `${labels.referenceMonth}: ${String(input.month).padStart(2, "0")}/${input.year} | ${labels.totalDays}: ${totals.totalDays} | ${labels.hours}: ${formatHours(totals.totalHours)}`,
    totalHours: totals.totalHours,
    totalDays: totals.totalDays,
    totalAmount: totalValue
  };
}

export function saveAustralianDocumentPreview(data: AustralianDocumentPreviewData) {
  const key = `${australianDocumentPreviewStoragePrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, JSON.stringify(data));
  return key;
}

export function readAustralianDocumentPreview(key: string | null) {
  if (!key) return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AustralianDocumentPreviewData>;
    return parsed.market === "AU"
      ? ({
          ...parsed,
          market: "AU",
          client: parsed.client ?? {
            id: "",
            name: parsed.customerName ?? "",
            companyName: parsed.customerName ?? "",
            contactPerson: parsed.customerContact ?? "",
            address: parsed.customerAddress ?? "",
            phone: parsed.customerPhone ?? "",
            email: parsed.customerEmail ?? "",
            registrationNumber: parsed.customerRegistrationNumber ?? "",
            country: "AU",
            currency: "AUD",
            preferredDocumentMarket: "AU"
          }
        } as AustralianDocumentPreviewData)
      : null;
  } catch {
    return null;
  }
}

export async function openAustralianDocumentPreview(input: AustralianDocumentInput, action: PdfAction = "preview") {
  const data = buildAustralianDocumentPreview(input);
  const key = saveAustralianDocumentPreview(data);
  const params = new URLSearchParams({ key });
  if (action === "download" || action === "print") params.set("print", "1");

  const previewWindow = window.open(`/documents/preview?${params.toString()}`, "_blank");
  if (!previewWindow) throw new Error("Could not open the document preview.");

  if (action === "share" && navigator.share) {
    await navigator.share({
      title: data.title,
      text: "Document created."
    });
  }

  return {
    subtotal: Number(data.subtotal.replace(/[^\d.-]/g, "")) || 0,
    tax: Number(data.gst.replace(/[^\d.-]/g, "")) || 0,
    totalAmount: data.totalAmount,
    totalHours: data.totalHours,
    totalDays: data.totalDays
  };
}
