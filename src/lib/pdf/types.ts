import type { Client, Profile } from "@/lib/database.types";

export const documentMarkets = ["JP", "AU"] as const;
export type DocumentMarket = (typeof documentMarkets)[number];

export const japaneseDocumentTypes = ["invoice", "estimate", "delivery", "receipt"] as const;
export const australianDocumentTypes = ["tax_invoice", "invoice", "quote", "receipt", "statement"] as const;

export type JapaneseDocumentType = (typeof japaneseDocumentTypes)[number];
export type AustralianDocumentType = (typeof australianDocumentTypes)[number];

export type PdfAction = "download" | "preview" | "print" | "share";

export type DocumentEntry = {
  id: string;
  user_id?: string | null;
  client_id?: string | null;
  entry_type?: string | null;
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
  status?: string | null;
  notes?: string | null;
  memo?: string | null;
  is_invoiced?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  clients?: (Pick<Client, "client_name" | "client_name_jp"> & { hourly_rate?: number | null }) | null;
};

export type JapaneseDocumentInput = {
  type: JapaneseDocumentType;
  profile: Profile | null;
  client: Client | null;
  entries: DocumentEntry[];
  month: number;
  year: number;
  documentNumber: string;
  action?: PdfAction;
};

export type AustralianDocumentInput = {
  type: AustralianDocumentType;
  profile: Profile | null;
  client: Client | null;
  entries: DocumentEntry[];
  month: number;
  year: number;
  documentNumber: string;
  action?: PdfAction;
};

export { japaneseDocumentLabels, japaneseDocumentPrefixes } from "@/lib/pdf/japanese-document-labels";

export function isDocumentMarket(value: unknown): value is DocumentMarket {
  return typeof value === "string" && documentMarkets.includes(value as DocumentMarket);
}

export function normalizeDocumentMarket(value: unknown): DocumentMarket {
  return isDocumentMarket(value) ? value : "JP";
}

export function isJapaneseDocumentType(value: unknown): value is JapaneseDocumentType {
  return typeof value === "string" && japaneseDocumentTypes.includes(value as JapaneseDocumentType);
}

export function normalizeJapaneseDocumentType(value: unknown): JapaneseDocumentType {
  return isJapaneseDocumentType(value) ? value : "invoice";
}

export function isAustralianDocumentType(value: unknown): value is AustralianDocumentType {
  return typeof value === "string" && australianDocumentTypes.includes(value as AustralianDocumentType);
}

export function normalizeAustralianDocumentType(value: unknown): AustralianDocumentType {
  return isAustralianDocumentType(value) ? value : "invoice";
}
