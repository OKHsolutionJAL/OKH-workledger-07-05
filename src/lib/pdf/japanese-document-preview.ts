import {
  japaneseDocumentLabels,
  japaneseDocumentMessages,
  japaneseDocumentNumberLabels,
  japanesePdfLabels as labels,
  japanesePreviewUiLabels
} from "@/lib/pdf/japanese-document-labels";
import { buildDocumentClient, type DocumentClient } from "@/lib/pdf/document-client";
import { normalizeJapaneseDocumentType, type JapaneseDocumentInput, type JapaneseDocumentType, type PdfAction } from "@/lib/pdf/types";
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

export const japaneseDocumentPreviewStoragePrefix = "okh-workledger-japanese-document-preview";

type BusinessProfileExtras = {
  postal_code?: string | null;
  website?: string | null;
  default_due_days?: number | null;
  tax_calculation_mode?: "inclusive" | "exclusive" | "none" | null;
  japan_consumption_tax_enabled?: boolean | null;
  japan_tax_rate?: number | null;
  japan_show_consumption_tax?: boolean | null;
  japan_show_invoice_number?: boolean | null;
  japan_invoice_registration_number?: string | null;
  invoice_registration_number?: string | null;
  document_notes?: string | null;
  payment_terms?: string | null;
  japan_bank_name?: string | null;
  japan_branch_name?: string | null;
  japan_account_type?: string | null;
  japan_account_number?: string | null;
  japan_account_holder?: string | null;
  bank_name?: string | null;
  branch_name?: string | null;
  account_type?: string | null;
  account_number?: string | null;
  account_holder?: string | null;
};

export type JapaneseDocumentPreviewRow = {
  date: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
};

export type JapaneseDocumentPreviewData = {
  market: "JP";
  type: JapaneseDocumentType;
  title: string;
  message: string;
  numberLabel: string;
  documentNumber: string;
  issueDate: string;
  referenceMonth: string;
  client: DocumentClient | null;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  clientRegistrationNumber: string;
  issuerName: string;
  issuerOwner: string;
  issuerPostalCode: string;
  issuerAddress: string;
  issuerPhone: string;
  issuerEmail: string;
  issuerRegistrationNumber: string;
  rows: JapaneseDocumentPreviewRow[];
  subtotal: string;
  tax: string;
  total: string;
  paymentDue: string;
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
  bankInfo: string;
  notes: string;
  totalHours: number;
  totalDays: number;
  totalAmount: number;
};

const fallbackBusinessName = "\u4e8b\u696d\u8005\u540d\u672a\u8a2d\u5b9a";
const fallbackUnset = "\u672a\u8a2d\u5b9a";
const yearLabel = "\u5e74";
const monthLabel = "\u6708";
const dayLabel = "\u65e5";
const fullWidthColon = "\uff1a";
const ideographicSpace = "\u3000";

function formatJapaneseDate(value = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(value);
}

function formatEntryDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "-";
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

export function formatJapaneseHours(value: number) {
  return `${Number(value || 0).toLocaleString("ja-JP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}${labels.hours}`;
}

function formatJapaneseQuantity(value: number) {
  return Number(value || 0).toLocaleString("ja-JP", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function text(value: unknown, fallback = "-") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeTaxMode(value: unknown) {
  return value === "inclusive" || value === "exclusive" || value === "none" ? value : "exclusive";
}

function numberSetting(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildJapaneseBankFields(profileExtras: BusinessProfileExtras) {
  return {
    bankName: text(profileExtras.japan_bank_name || profileExtras.bank_name, fallbackUnset),
    branchName: text(profileExtras.japan_branch_name || profileExtras.branch_name, fallbackUnset),
    accountType: text(profileExtras.japan_account_type || profileExtras.account_type, fallbackUnset),
    accountNumber: text(profileExtras.japan_account_number || profileExtras.account_number, fallbackUnset),
    accountHolder: text(profileExtras.japan_account_holder || profileExtras.account_holder, fallbackUnset)
  };
}

function buildJapaneseBankInfo(profile: JapaneseDocumentInput["profile"], profileExtras: BusinessProfileExtras) {
  const fields = buildJapaneseBankFields(profileExtras);
  const structured = [
    fields.bankName !== fallbackUnset ? `${labels.bankName}${fullWidthColon}${fields.bankName}` : null,
    fields.branchName !== fallbackUnset ? `${labels.branchName}${fullWidthColon}${fields.branchName}` : null,
    fields.accountType !== fallbackUnset ? `${labels.accountType}${fullWidthColon}${fields.accountType}` : null,
    fields.accountNumber !== fallbackUnset ? `${labels.accountNumber}${fullWidthColon}${fields.accountNumber}` : null,
    fields.accountHolder !== fallbackUnset ? `${labels.accountHolder}${fullWidthColon}${fields.accountHolder}` : null
  ]
    .filter(Boolean)
    .join("\n");

  return structured || text(profile?.bank_info, fallbackUnset);
}

function calculateJapaneseDocumentTotals(baseValue: number, type: JapaneseDocumentType, profileExtras: BusinessProfileExtras) {
  const taxEnabled = (profileExtras.japan_consumption_tax_enabled ?? true) && type !== "receipt";
  const taxRate = numberSetting(profileExtras.japan_tax_rate, 10) / 100;
  const mode = taxEnabled ? normalizeTaxMode(profileExtras.tax_calculation_mode) : "none";

  if (mode === "none" || taxRate <= 0) {
    return {
      subtotalValue: baseValue,
      taxValue: 0,
      totalValue: baseValue
    };
  }

  if (mode === "inclusive") {
    const subtotalValue = Math.round(baseValue / (1 + taxRate));
    const taxValue = baseValue - subtotalValue;
    return {
      subtotalValue,
      taxValue,
      totalValue: baseValue
    };
  }

  const taxValue = Math.round(baseValue * taxRate);
  return {
    subtotalValue: baseValue,
    taxValue,
    totalValue: baseValue + taxValue
  };
}

export function buildJapaneseDocumentPreview(input: JapaneseDocumentInput): JapaneseDocumentPreviewData {
  const safeType = normalizeJapaneseDocumentType(input.type);
  const documentClient = buildDocumentClient(input.client);
  const profileExtras = (input.profile ?? {}) as BusinessProfileExtras;
  const totals = summarizeWorkEntries(input.entries);
  const baseValue = input.entries.reduce((sum, entry) => sum + calculateWorkEntryAmount(entry), 0);
  const { subtotalValue, taxValue, totalValue } = calculateJapaneseDocumentTotals(baseValue, safeType, profileExtras);
  const referenceMonth = `${input.year}${yearLabel}${String(input.month).padStart(2, "0")}${monthLabel}`;
  const dueDays = Math.max(numberSetting(profileExtras.default_due_days, 30), 0);
  const paymentDue = `${labels.issueDate}\u3088\u308a${dueDays}${dayLabel}\u4ee5\u5185`;
  const bankFields = buildJapaneseBankFields(profileExtras);
  const defaultNotes = [
    `${labels.workMonth}${fullWidthColon}${referenceMonth}`,
    `${labels.totalDays}${fullWidthColon}${totals.totalDays}${dayLabel}`,
    `${labels.totalHours}${fullWidthColon}${formatJapaneseHours(totals.totalHours)}`
  ].join(ideographicSpace);

  return {
    market: "JP",
    type: safeType,
    title: japaneseDocumentLabels[safeType],
    message: japaneseDocumentMessages[safeType],
    numberLabel: japaneseDocumentNumberLabels[safeType],
    documentNumber: input.documentNumber,
    issueDate: formatJapaneseDate(),
    referenceMonth,
    client: documentClient,
    clientName: `${text(documentClient?.companyName || documentClient?.name, labels.client)} ${labels.honorific}`,
    clientContact: text(documentClient?.contactPerson, fallbackUnset),
    clientAddress: text(documentClient?.address, fallbackUnset),
    clientPhone: text(documentClient?.phone, fallbackUnset),
    clientEmail: text(documentClient?.email, fallbackUnset),
    clientRegistrationNumber: text(documentClient?.registrationNumber, fallbackUnset),
    issuerName: text(input.profile?.business_name, fallbackBusinessName),
    issuerOwner: text(input.profile?.owner_name),
    issuerPostalCode: text(profileExtras.postal_code),
    issuerAddress: text(input.profile?.address),
    issuerPhone: text(input.profile?.phone),
    issuerEmail: text(input.profile?.email),
    issuerRegistrationNumber:
      profileExtras.japan_show_invoice_number === false
        ? fallbackUnset
        : text(profileExtras.japan_invoice_registration_number || profileExtras.invoice_registration_number || input.profile?.invoice_number, fallbackUnset),
    rows: input.entries.map((entry) => ({
      date: formatEntryDate(workEntryDate(entry)),
      description: documentEntryDescription(entry, "JP"),
      quantity: formatJapaneseQuantity(documentEntryQuantity(entry)),
      unit: documentEntryUnit(entry, "JP"),
      unitPrice: formatWorkCurrency(documentEntryUnitPrice(entry), "JPY"),
      amount: formatWorkCurrency(calculateWorkEntryAmount(entry), "JPY")
    })),
    subtotal: formatWorkCurrency(subtotalValue, "JPY"),
    tax: formatWorkCurrency(taxValue, "JPY"),
    total: formatWorkCurrency(totalValue, "JPY"),
    paymentDue,
    bankName: bankFields.bankName,
    branchName: bankFields.branchName,
    accountType: bankFields.accountType,
    accountNumber: bankFields.accountNumber,
    accountHolder: bankFields.accountHolder,
    bankInfo: buildJapaneseBankInfo(input.profile, profileExtras),
    notes: text(profileExtras.document_notes || profileExtras.payment_terms, defaultNotes),
    totalHours: totals.totalHours,
    totalDays: totals.totalDays,
    totalAmount: totalValue
  };
}

export function saveJapaneseDocumentPreview(data: JapaneseDocumentPreviewData) {
  const key = `${japaneseDocumentPreviewStoragePrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, JSON.stringify(data));
  return key;
}

export function readJapaneseDocumentPreview(key: string | null) {
  if (!key) return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<JapaneseDocumentPreviewData>;
    const legacyClientName = String(parsed.clientName ?? "").replace(` ${labels.honorific}`, "").trim();
    return parsed.market === "JP" || !("market" in parsed)
      ? ({
          ...parsed,
          market: "JP",
          client: parsed.client ?? {
            id: "",
            name: legacyClientName,
            companyName: legacyClientName,
            contactPerson: parsed.clientContact ?? "",
            address: parsed.clientAddress ?? "",
            phone: parsed.clientPhone ?? "",
            email: parsed.clientEmail ?? "",
            registrationNumber: parsed.clientRegistrationNumber ?? "",
            country: "JP",
            currency: "JPY",
            preferredDocumentMarket: "JP"
          },
          bankName: parsed.bankName ?? fallbackUnset,
          branchName: parsed.branchName ?? fallbackUnset,
          accountType: parsed.accountType ?? fallbackUnset,
          accountNumber: parsed.accountNumber ?? fallbackUnset,
          accountHolder: parsed.accountHolder ?? fallbackUnset
        } as JapaneseDocumentPreviewData)
      : null;
  } catch {
    return null;
  }
}

export async function openJapaneseDocumentPreview(input: JapaneseDocumentInput, action: PdfAction = "preview") {
  const data = buildJapaneseDocumentPreview(input);
  const key = saveJapaneseDocumentPreview(data);
  const params = new URLSearchParams({ key });
  if (action === "download" || action === "print") params.set("print", "1");

  const previewWindow = window.open(`/documents/preview?${params.toString()}`, "_blank");
  if (!previewWindow) throw new Error(japanesePreviewUiLabels.previewOpenError);

  if (action === "share" && navigator.share) {
    await navigator.share({
      title: data.title,
      text: japanesePreviewUiLabels.shareText
    });
  }

  return {
    subtotal: Number(data.subtotal.replace(/[^\d-]/g, "")) || 0,
    tax: Number(data.tax.replace(/[^\d-]/g, "")) || 0,
    totalAmount: data.totalAmount,
    totalHours: data.totalHours,
    totalDays: data.totalDays
  };
}
