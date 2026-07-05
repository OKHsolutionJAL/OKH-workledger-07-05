import type { ClientAdjustment, IssuedDocument, Profile } from "@/lib/database.types";

export function normalizePhone(value: string | null | undefined) {
  return String(value ?? "").replace(/[^0-9+]/g, "");
}

export function maskPhone(value: string | null | undefined) {
  const normalized = normalizePhone(value);
  if (!normalized) return "-";
  if (normalized.length <= 4) return "****";
  const prefixLength = Math.max(normalized.length - 8, 2);
  return `${normalized.slice(0, prefixLength)}****${normalized.slice(-4)}`;
}

export function maskEmail(value: string | null | undefined) {
  const email = String(value ?? "").trim();
  const [local, domain] = email.split("@");
  if (!local || !domain) return "-";
  return `${local.slice(0, Math.min(3, local.length))}****@${domain}`;
}

export function profileDisplayName(profile: Pick<Profile, "company_name" | "business_name" | "full_name" | "owner_name" | "email"> | null | undefined) {
  return profile?.company_name || profile?.business_name || profile?.full_name || profile?.owner_name || profile?.email || "-";
}

export function currencyForProfile(profile: Pick<Profile, "default_currency" | "currency"> | null | undefined): "JPY" | "AUD" {
  return profile?.default_currency === "AUD" || profile?.currency === "AUD" ? "AUD" : "JPY";
}

export function sumAdjustments(adjustments: Pick<ClientAdjustment, "amount">[]) {
  return adjustments.reduce((total, item) => total + Number(item.amount || 0), 0);
}

export function netDocumentAmount(document: Pick<IssuedDocument, "gross_amount">, adjustments: Pick<ClientAdjustment, "amount">[]) {
  return Number(document.gross_amount || 0) - sumAdjustments(adjustments);
}

export function currentPeriod() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
}

export const adjustmentLabels: Record<ClientAdjustment["adjustment_type"], string> = {
  health_insurance: "Seguro saude",
  social_insurance: "Seguro social",
  housing: "Moradia",
  transport: "Transporte",
  food: "Alimentacao",
  advance_payment: "Adiantamento",
  tools: "Ferramentas",
  uniform: "Uniforme",
  internal_fee: "Taxa interna",
  other: "Outros"
};

export const reviewStatusLabels: Record<string, string> = {
  received: "Recebido",
  reviewing: "Em revisao",
  approved: "Aprovado",
  rejected: "Rejeitado",
  paid: "Pago",
  issued: "Emitido"
};
