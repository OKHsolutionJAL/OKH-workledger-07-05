"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BookmarkPlus, Copy, Edit2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { Field, SelectField, TextAreaField } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { calculateNetHours } from "@/lib/calculations";
import type { Client, ContractorRelationship, EntryTemplate, Profile, TimeEntry } from "@/lib/database.types";
import { formatDate, formatHours } from "@/lib/format";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  calculateWorkEntryAmount,
  calculateHourlyPremiumBreakdown,
  expenseCategories,
  formatWorkCurrency,
  isWorkEntryMissingTableError,
  legacyTimeEntryToWorkEntry,
  normalizeWorkEntryType,
  summarizeWorkEntries,
  workEntryDate,
  workEntryLocation,
  workEntryNotes,
  workEntryTitle,
  workEntryTypeLabels,
  workEntryStatuses,
  type WorkEntryLike,
  type WorkEntryStatus,
  type WorkEntryType,
  type WorkEntryWithClient
} from "@/lib/work-entries";

type EntryWithSource = WorkEntryLike & {
  source_table: "work_entries" | "time_entries";
};

type WorkEntryForm = {
  entry_type: WorkEntryType;
  client_id: string;
  market: "JP" | "AU";
  date: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  break_minutes: string;
  hours: string;
  days: string;
  quantity: string;
  unit: string;
  unit_price: string;
  hourly_rate: string;
  daily_rate: string;
  fixed_amount: string;
  expense_amount: string;
  material_cost: string;
  markup_amount: string;
  discount_amount: string;
  overtime_hours: string;
  overtime_rate_percent: string;
  night_hours: string;
  night_rate_percent: string;
  weekend_hours: string;
  weekend_rate_percent: string;
  holiday_hours: string;
  holiday_rate_percent: string;
  custom_premium_title: string;
  custom_premium_amount: string;
  currency: "JPY" | "AUD";
  tax_mode: "inclusive" | "exclusive" | "none";
  tax_rate: string;
  receipt_url: string;
  status: WorkEntryStatus;
  notes: string;
};

const pageText: Record<
  Language,
  {
    title: string;
    description: string;
    addEntry: string;
    editEntry: string;
    hint: string;
    entryType: string;
    market: string;
    titleField: string;
    descriptionField: string;
    location: string;
    date: string;
    start: string;
    end: string;
    breakMinutes: string;
    hourlyRate: string;
    days: string;
    dailyRate: string;
    fixedAmount: string;
    expenseAmount: string;
    materialCost: string;
    markupAmount: string;
    quantity: string;
    unit: string;
    unitPrice: string;
    discountAmount: string;
    receiptUrl: string;
    currency: string;
    status: string;
    category: string;
    notes: string;
    previewTotal: string;
    previewHours: string;
    save: string;
    saved: string;
    updated: string;
    deleteConfirm: string;
    needsClient: string;
    validationDate: string;
    validationClient: string;
    validationRequired: string;
    validationTime: string;
    latest: string;
    noEntries: string;
    emptyHint: string;
    type: string;
    amount: string;
    clientOptional: string;
  }
> = {
  pt: {
    title: "Lançamentos",
    description: "Registre horas, diarias, servicos fechados, despesas, materiais e ajustes em um unico lugar.",
    addEntry: "Novo lançamento",
    editEntry: "Editar lançamento",
    hint: "Escolha o tipo. O formulario mostra somente os campos necessarios.",
    entryType: "Tipo de lançamento",
    market: "Mercado",
    titleField: "Titulo / categoria",
    descriptionField: "Descricao do servico",
    location: "Local",
    date: "Data",
    start: "Inicio",
    end: "Termino",
    breakMinutes: "Intervalo em minutos",
    hourlyRate: "Valor por hora",
    days: "Quantidade de dias",
    dailyRate: "Valor por dia",
    fixedAmount: "Valor fechado",
    expenseAmount: "Valor da despesa",
    materialCost: "Custo do material",
    markupAmount: "Margem / acrescimo",
    quantity: "Quantidade",
    unit: "Unidade",
    unitPrice: "Preco unitario",
    discountAmount: "Desconto / ajuste",
    receiptUrl: "URL do comprovante",
    currency: "Moeda",
    status: "Status",
    category: "Categoria",
    notes: "Observacoes",
    previewTotal: "Total do lançamento",
    previewHours: "Horas calculadas",
    save: "Salvar lançamento",
    saved: "Lançamento salvo com sucesso.",
    updated: "Lançamento atualizado com sucesso.",
    deleteConfirm: "Excluir o lançamento de {date}?",
    needsClient: "Cadastre ou selecione um cliente para este tipo de lançamento.",
    validationDate: "Informe a data.",
    validationClient: "Selecione um cliente.",
    validationRequired: "Preencha os campos obrigatorios.",
    validationTime: "Informe inicio e termino.",
    latest: "Ultimos lançamentos",
    noEntries: "Nenhum lançamento registrado",
    emptyHint: "Crie o primeiro lançamento para gerar relatorios e documentos.",
    type: "Tipo",
    amount: "Valor",
    clientOptional: "Cliente opcional para despesa interna"
  },
  ja: {
    title: "\u4f5c\u696d\u30fb\u7d4c\u8cbb\u5165\u529b",
    description: "\u6642\u9593\u4f5c\u696d\u3001\u65e5\u5f53\u3001\u5b9a\u984d\u30b5\u30fc\u30d3\u30b9\u3001\u7d4c\u8cbb\u3001\u6750\u6599\u3001\u8abf\u6574\u3092\u307e\u3068\u3081\u3066\u8a18\u9332\u3057\u307e\u3059\u3002",
    addEntry: "\u65b0\u898f\u767b\u9332",
    editEntry: "\u767b\u9332\u3092\u7de8\u96c6",
    hint: "\u7a2e\u5225\u3092\u9078\u3076\u3068\u5fc5\u8981\u306a\u9805\u76ee\u3060\u3051\u8868\u793a\u3055\u308c\u307e\u3059\u3002",
    entryType: "\u767b\u9332\u7a2e\u5225",
    market: "\u5e02\u5834",
    titleField: "\u4ef6\u540d\u30fb\u30ab\u30c6\u30b4\u30ea",
    descriptionField: "\u5185\u5bb9",
    location: "\u5834\u6240",
    date: "\u65e5\u4ed8",
    start: "\u958b\u59cb",
    end: "\u7d42\u4e86",
    breakMinutes: "\u4f11\u61a9\uff08\u5206\uff09",
    hourlyRate: "\u6642\u7d66",
    days: "\u65e5\u6570",
    dailyRate: "\u65e5\u5f53",
    fixedAmount: "\u5b9a\u984d",
    expenseAmount: "\u7d4c\u8cbb\u91d1\u984d",
    materialCost: "\u6750\u6599\u539f\u4fa1",
    markupAmount: "\u4e0a\u4e57\u305b",
    quantity: "\u6570\u91cf",
    unit: "\u5358\u4f4d",
    unitPrice: "\u5358\u4fa1",
    discountAmount: "\u5024\u5f15\u304d\u30fb\u8abf\u6574",
    receiptUrl: "\u9818\u53ce\u66f8URL",
    currency: "\u901a\u8ca8",
    status: "\u30b9\u30c6\u30fc\u30bf\u30b9",
    category: "\u30ab\u30c6\u30b4\u30ea",
    notes: "\u5099\u8003",
    previewTotal: "\u767b\u9332\u91d1\u984d",
    previewHours: "\u8a08\u7b97\u6642\u9593",
    save: "\u767b\u9332\u3092\u4fdd\u5b58",
    saved: "\u767b\u9332\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    updated: "\u767b\u9332\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002",
    deleteConfirm: "{date}\u306e\u767b\u9332\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f",
    needsClient: "\u3053\u306e\u7a2e\u5225\u306b\u306f\u53d6\u5f15\u5148\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    validationDate: "\u65e5\u4ed8\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    validationClient: "\u53d6\u5f15\u5148\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    validationRequired: "\u5fc5\u9808\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    validationTime: "\u958b\u59cb\u3068\u7d42\u4e86\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    latest: "\u6700\u65b0\u306e\u767b\u9332",
    noEntries: "\u767b\u9332\u304c\u3042\u308a\u307e\u305b\u3093",
    emptyHint: "\u6700\u521d\u306e\u767b\u9332\u3092\u4f5c\u6210\u3059\u308b\u3068\u30ec\u30dd\u30fc\u30c8\u3068\u66f8\u985e\u306b\u4f7f\u3048\u307e\u3059\u3002",
    type: "\u7a2e\u5225",
    amount: "\u91d1\u984d",
    clientOptional: "\u4e8b\u696d\u7d4c\u8cbb\u306e\u53d6\u5f15\u5148\u306f\u4efb\u610f\u3067\u3059"
  },
  en: {
    title: "Work Entries",
    description: "Record hourly work, day rates, fixed services, expenses, materials and adjustments in one place.",
    addEntry: "New entry",
    editEntry: "Edit entry",
    hint: "Choose a type. The form only shows the fields you need.",
    entryType: "Entry type",
    market: "Market",
    titleField: "Title / category",
    descriptionField: "Service description",
    location: "Location",
    date: "Date",
    start: "Start",
    end: "End",
    breakMinutes: "Break in minutes",
    hourlyRate: "Hourly rate",
    days: "Days",
    dailyRate: "Daily rate",
    fixedAmount: "Fixed amount",
    expenseAmount: "Expense amount",
    materialCost: "Material cost",
    markupAmount: "Markup",
    quantity: "Quantity",
    unit: "Unit",
    unitPrice: "Unit price",
    discountAmount: "Discount / adjustment",
    receiptUrl: "Receipt URL",
    currency: "Currency",
    status: "Status",
    category: "Category",
    notes: "Notes",
    previewTotal: "Entry total",
    previewHours: "Calculated hours",
    save: "Save entry",
    saved: "Entry saved successfully.",
    updated: "Entry updated successfully.",
    deleteConfirm: "Delete the entry from {date}?",
    needsClient: "Register or select a customer for this entry type.",
    validationDate: "Enter the date.",
    validationClient: "Select a customer.",
    validationRequired: "Fill in the required fields.",
    validationTime: "Enter start and end times.",
    latest: "Latest entries",
    noEntries: "No entries registered",
    emptyHint: "Create the first entry to generate reports and documents.",
    type: "Type",
    amount: "Amount",
    clientOptional: "Customer is optional for internal business expense"
  }
};

const actionText: Record<
  Language,
  {
    customerLabel: string;
    copyLatest: string;
    copyYesterday: string;
    duplicate: string;
    templates: string;
    noTemplates: string;
    useTemplate: string;
    saveTemplate: string;
    deleteTemplate: string;
    saveTemplatePrompt: string;
    templateSaved: string;
    templateDeleted: string;
    premiumTitle: string;
    overtimeHours: string;
    overtimePercent: string;
    nightHours: string;
    nightPercent: string;
    weekendHours: string;
    weekendPercent: string;
    holidayHours: string;
    holidayPercent: string;
    customPremiumTitle: string;
    customPremiumAmount: string;
    normalAmount: string;
    premiumAmount: string;
    sendToClient: string;
    sentToClient: string;
    sendSuccess: string;
    reviewStatus: string;
    needsLinkedClientForSend: string;
    legacySendBlocked: string;
  }
> = {
  pt: {
    customerLabel: "Cliente / Contratante",
    copyLatest: "Copiar ultimo",
    copyYesterday: "Copiar ontem",
    duplicate: "Duplicar",
    templates: "Modelos rapidos",
    noTemplates: "Nenhum modelo salvo ainda.",
    useTemplate: "Usar",
    saveTemplate: "Salvar como modelo",
    deleteTemplate: "Excluir modelo",
    saveTemplatePrompt: "Nome do modelo",
    templateSaved: "Modelo salvo.",
    templateDeleted: "Modelo excluido.",
    premiumTitle: "Adicionais de hora",
    overtimeHours: "Horas extras",
    overtimePercent: "% extra",
    nightHours: "Horas noturnas",
    nightPercent: "% noturno",
    weekendHours: "Horas fim de semana",
    weekendPercent: "% fim de semana",
    holidayHours: "Horas feriado",
    holidayPercent: "% feriado",
    customPremiumTitle: "Adicional personalizado",
    customPremiumAmount: "Valor adicional",
    normalAmount: "Valor normal",
    premiumAmount: "Adicionais",
    sendToClient: "Enviar para contratante",
    sentToClient: "Enviado",
    sendSuccess: "Lancamento enviado ao contratante.",
    reviewStatus: "Revisao do contratante",
    needsLinkedClientForSend: "Este lancamento precisa de um cliente/contratante vinculado e aceito.",
    legacySendBlocked: "Lancamento antigo precisa ser salvo no novo formato antes de enviar."
  },
  ja: {
    customerLabel: "\u53d6\u5f15\u5148 / \u767a\u6ce8\u8005",
    copyLatest: "\u6700\u65b0\u3092\u30b3\u30d4\u30fc",
    copyYesterday: "\u6628\u65e5\u3092\u30b3\u30d4\u30fc",
    duplicate: "\u8907\u88fd",
    templates: "\u30af\u30a4\u30c3\u30af\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
    noTemplates: "\u4fdd\u5b58\u6e08\u307f\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002",
    useTemplate: "\u4f7f\u7528",
    saveTemplate: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u4fdd\u5b58",
    deleteTemplate: "\u524a\u9664",
    saveTemplatePrompt: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u540d",
    templateSaved: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    templateDeleted: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u3092\u524a\u9664\u3057\u307e\u3057\u305f\u3002",
    premiumTitle: "\u6642\u9593\u5272\u5897",
    overtimeHours: "\u6b8b\u696d\u6642\u9593",
    overtimePercent: "\u5272\u5897%",
    nightHours: "\u6df1\u591c\u6642\u9593",
    nightPercent: "\u6df1\u591c%",
    weekendHours: "\u9031\u672b\u6642\u9593",
    weekendPercent: "\u9031\u672b%",
    holidayHours: "\u795d\u65e5\u6642\u9593",
    holidayPercent: "\u795d\u65e5%",
    customPremiumTitle: "\u8ffd\u52a0\u624b\u5f53",
    customPremiumAmount: "\u8ffd\u52a0\u91d1\u984d",
    normalAmount: "\u901a\u5e38\u91d1\u984d",
    premiumAmount: "\u5272\u5897\u5408\u8a08",
    sendToClient: "\u767a\u6ce8\u8005\u3078\u9001\u4fe1",
    sentToClient: "\u9001\u4fe1\u6e08\u307f",
    sendSuccess: "\u767a\u6ce8\u8005\u3078\u9001\u4fe1\u3057\u307e\u3057\u305f\u3002",
    reviewStatus: "\u767a\u6ce8\u8005\u78ba\u8a8d",
    needsLinkedClientForSend: "\u627f\u8a8d\u6e08\u307f\u306e\u767a\u6ce8\u8005\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    legacySendBlocked: "\u65e7\u5f0f\u306e\u767b\u9332\u306f\u65b0\u5f62\u5f0f\u3067\u4fdd\u5b58\u3057\u3066\u304b\u3089\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
  },
  en: {
    customerLabel: "Client / Contractor",
    copyLatest: "Copy latest",
    copyYesterday: "Copy yesterday",
    duplicate: "Duplicate",
    templates: "Quick templates",
    noTemplates: "No saved templates yet.",
    useTemplate: "Use",
    saveTemplate: "Save as template",
    deleteTemplate: "Delete template",
    saveTemplatePrompt: "Template name",
    templateSaved: "Template saved.",
    templateDeleted: "Template deleted.",
    premiumTitle: "Hourly premiums",
    overtimeHours: "Overtime hours",
    overtimePercent: "Overtime %",
    nightHours: "Night hours",
    nightPercent: "Night %",
    weekendHours: "Weekend hours",
    weekendPercent: "Weekend %",
    holidayHours: "Holiday hours",
    holidayPercent: "Holiday %",
    customPremiumTitle: "Custom premium",
    customPremiumAmount: "Custom amount",
    normalAmount: "Normal amount",
    premiumAmount: "Premiums",
    sendToClient: "Send to contractor",
    sentToClient: "Sent",
    sendSuccess: "Entry sent to contractor.",
    reviewStatus: "Contractor review",
    needsLinkedClientForSend: "This entry needs an approved linked client/contractor.",
    legacySendBlocked: "Old entries must be saved in the new format before sending."
  }
};

function todayInputValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

const emptyForm: WorkEntryForm = {
  entry_type: "hourly_work",
  client_id: "",
  market: "JP",
  date: todayInputValue(),
  title: "",
  description: "",
  location: "",
  start_time: "",
  end_time: "",
  break_minutes: "0",
  hours: "",
  days: "1",
  quantity: "1",
  unit: "",
  unit_price: "0",
  hourly_rate: "0",
  daily_rate: "0",
  fixed_amount: "0",
  expense_amount: "0",
  material_cost: "0",
  markup_amount: "0",
  discount_amount: "0",
  overtime_hours: "0",
  overtime_rate_percent: "25",
  night_hours: "0",
  night_rate_percent: "25",
  weekend_hours: "0",
  weekend_rate_percent: "35",
  holiday_hours: "0",
  holiday_rate_percent: "50",
  custom_premium_title: "",
  custom_premium_amount: "0",
  currency: "JPY",
  tax_mode: "exclusive",
  tax_rate: "0",
  receipt_url: "",
  status: "billable",
  notes: ""
};

function nullable(value: string) {
  return value.trim() || null;
}

function numberValue(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function timeInput(value: unknown) {
  return String(value ?? "").slice(0, 5);
}

function requiresClient(type: WorkEntryType) {
  return type !== "business_expense";
}

function statusLabel(status: WorkEntryStatus, language: Language) {
  const labels: Record<Language, Record<WorkEntryStatus, string>> = {
    pt: {
      draft: "Rascunho",
      billable: "Cobravel",
      invoiced: "Faturado",
      paid: "Pago",
      cancelled: "Cancelado",
      non_billable: "Nao cobravel"
    },
    ja: {
      draft: "\u4e0b\u66f8\u304d",
      billable: "\u8acb\u6c42\u5bfe\u8c61",
      invoiced: "\u8acb\u6c42\u6e08\u307f",
      paid: "\u652f\u6255\u6e08\u307f",
      cancelled: "\u30ad\u30e3\u30f3\u30bb\u30eb",
      non_billable: "\u8acb\u6c42\u5bfe\u8c61\u5916"
    },
    en: {
      draft: "Draft",
      billable: "Billable",
      invoiced: "Invoiced",
      paid: "Paid",
      cancelled: "Cancelled",
      non_billable: "Non-billable"
    }
  };

  return labels[language][status];
}

function categoryLabel(category: (typeof expenseCategories)[number], language: Language) {
  return category[language];
}

function buildDraftEntry(form: WorkEntryForm): WorkEntryLike {
  const type = form.entry_type;
  const hourlyHours =
    type === "hourly_work"
      ? calculateNetHours(form.start_time, form.end_time, numberValue(form.break_minutes))
      : numberValue(form.hours, 0);

  return {
    id: "draft",
    client_id: form.client_id || null,
    entry_type: type,
    market: form.market,
    date: form.date,
    title: nullable(form.title),
    description: nullable(form.description),
    location: nullable(form.location),
    start_time: type === "hourly_work" ? form.start_time : null,
    end_time: type === "hourly_work" ? form.end_time : null,
    break_minutes: numberValue(form.break_minutes),
    hours: hourlyHours,
    days: type === "daily_work" ? numberValue(form.days, 1) : null,
    quantity: type === "material" ? numberValue(form.quantity, 1) : null,
    unit: nullable(form.unit),
    unit_price: type === "material" ? numberValue(form.unit_price) : null,
    hourly_rate: type === "hourly_work" ? numberValue(form.hourly_rate) : null,
    daily_rate: type === "daily_work" ? numberValue(form.daily_rate) : null,
    fixed_amount: type === "fixed_service" ? numberValue(form.fixed_amount) : null,
    expense_amount: type === "client_expense" || type === "business_expense" ? numberValue(form.expense_amount) : null,
    material_cost: type === "material" ? numberValue(form.material_cost) : null,
    markup_amount: type === "material" ? numberValue(form.markup_amount) : 0,
    discount_amount: type === "adjustment" ? numberValue(form.discount_amount) : 0,
    overtime_hours: type === "hourly_work" ? numberValue(form.overtime_hours) : 0,
    overtime_rate_percent: numberValue(form.overtime_rate_percent, 25),
    night_hours: type === "hourly_work" ? numberValue(form.night_hours) : 0,
    night_rate_percent: numberValue(form.night_rate_percent, 25),
    weekend_hours: type === "hourly_work" ? numberValue(form.weekend_hours) : 0,
    weekend_rate_percent: numberValue(form.weekend_rate_percent, 35),
    holiday_hours: type === "hourly_work" ? numberValue(form.holiday_hours) : 0,
    holiday_rate_percent: numberValue(form.holiday_rate_percent, 50),
    custom_premium_title: nullable(form.custom_premium_title),
    custom_premium_amount: type === "hourly_work" ? numberValue(form.custom_premium_amount) : 0,
    currency: form.currency,
    tax_mode: form.tax_mode,
    tax_rate: numberValue(form.tax_rate),
    is_billable: type !== "business_expense" && form.status !== "non_billable",
    is_business_expense: type === "business_expense",
    is_client_charge: type !== "business_expense",
    receipt_url: nullable(form.receipt_url),
    status: type === "business_expense" ? "non_billable" : form.status,
    notes: nullable(form.notes)
  };
}

function formFromEntry(entry: EntryWithSource): WorkEntryForm {
  const type = normalizeWorkEntryType(entry.entry_type);
  const currency = entry.currency === "AUD" ? "AUD" : "JPY";

  return {
    ...emptyForm,
    entry_type: type,
    client_id: entry.client_id ?? "",
    market: entry.market === "AU" ? "AU" : "JP",
    date: workEntryDate(entry),
    title: workEntryTitle(entry),
    description: String(entry.description || entry.memo || ""),
    location: workEntryLocation(entry),
    start_time: timeInput(entry.start_time),
    end_time: timeInput(entry.end_time),
    break_minutes: String(entry.break_minutes ?? 0),
    hours: String(entry.hours ?? ""),
    days: String(entry.days ?? 1),
    quantity: String(entry.quantity ?? 1),
    unit: String(entry.unit ?? ""),
    unit_price: String(entry.unit_price ?? 0),
    hourly_rate: String(entry.hourly_rate ?? 0),
    daily_rate: String(entry.daily_rate ?? 0),
    fixed_amount: String(entry.fixed_amount ?? 0),
    expense_amount: String(entry.expense_amount ?? 0),
    material_cost: String(entry.material_cost ?? 0),
    markup_amount: String(entry.markup_amount ?? 0),
    discount_amount: String(entry.discount_amount ?? 0),
    overtime_hours: String(entry.overtime_hours ?? 0),
    overtime_rate_percent: String(entry.overtime_rate_percent ?? 25),
    night_hours: String(entry.night_hours ?? 0),
    night_rate_percent: String(entry.night_rate_percent ?? 25),
    weekend_hours: String(entry.weekend_hours ?? 0),
    weekend_rate_percent: String(entry.weekend_rate_percent ?? 35),
    holiday_hours: String(entry.holiday_hours ?? 0),
    holiday_rate_percent: String(entry.holiday_rate_percent ?? 50),
    custom_premium_title: String(entry.custom_premium_title ?? ""),
    custom_premium_amount: String(entry.custom_premium_amount ?? 0),
    currency,
    tax_mode: entry.tax_mode === "inclusive" || entry.tax_mode === "none" ? entry.tax_mode : "exclusive",
    tax_rate: String(entry.tax_rate ?? 0),
    receipt_url: String(entry.receipt_url ?? ""),
    status: (entry.status as WorkEntryStatus | undefined) ?? (entry.is_invoiced ? "invoiced" : "billable"),
    notes: workEntryNotes(entry)
  };
}

function sortEntries(entries: EntryWithSource[]) {
  return entries.sort((a, b) => workEntryDate(b).localeCompare(workEntryDate(a))).slice(0, 60);
}

export default function TimecardPage() {
  const { language, t } = useLanguage();
  const text = pageText[language];
  const actions = actionText[language];
  const [form, setForm] = useState<WorkEntryForm>(emptyForm);
  const [entries, setEntries] = useState<EntryWithSource[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [relationships, setRelationships] = useState<ContractorRelationship[]>([]);
  const [templates, setTemplates] = useState<EntryTemplate[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSource, setEditingSource] = useState<EntryWithSource["source_table"] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const draftEntry = useMemo(() => buildDraftEntry(form), [form]);
  const preview = useMemo(
    () => ({
      hours: draftEntry.entry_type === "hourly_work" ? calculateNetHours(form.start_time, form.end_time, numberValue(form.break_minutes)) : 0,
      total: calculateWorkEntryAmount(draftEntry)
    }),
    [draftEntry, form.break_minutes, form.end_time, form.start_time]
  );
  const premiumPreview = useMemo(() => calculateHourlyPremiumBreakdown(draftEntry), [draftEntry]);
  const pageTotals = useMemo(() => summarizeWorkEntries(entries), [entries]);
  const selectedType = form.entry_type;
  const needsClient = requiresClient(selectedType);

  const loadData = useCallback(async () => {
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

      const [profileResult, clientsResult, legacyResult, relationshipsResult, templatesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("clients").select("*").eq("user_id", user.id).order("client_name"),
        supabase
          .from("time_entries")
          .select("*, clients(client_name, client_name_jp, hourly_rate)")
          .eq("user_id", user.id)
          .order("work_date", { ascending: false })
          .limit(60),
        supabase.from("contractor_relationships").select("*").eq("worker_user_id", user.id).eq("status", "active"),
        supabase
          .from("entry_templates")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
      ]);

      if (profileResult.error) throw profileResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (legacyResult.error) throw legacyResult.error;
      if (relationshipsResult.error) throw relationshipsResult.error;
      if (templatesResult.error) throw templatesResult.error;

      let workEntries: EntryWithSource[] = [];
      const workResult = await supabase
        .from("work_entries")
        .select("*, clients(client_name, client_name_jp, hourly_rate)")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60);

      if (workResult.error && !isWorkEntryMissingTableError(workResult.error)) throw workResult.error;
      if (!workResult.error) {
        workEntries = ((workResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
          ...entry,
          source_table: "work_entries" as const
        }));
      }

      const legacyEntries = ((legacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map((entry) => ({
        ...legacyTimeEntryToWorkEntry(entry),
        source_table: "time_entries" as const
      }));

      const loadedProfile = profileResult.data;
      setProfile(loadedProfile);
      setClients(clientsResult.data ?? []);
      setRelationships((relationshipsResult.data ?? []) as ContractorRelationship[]);
      setTemplates((templatesResult.data ?? []) as EntryTemplate[]);
      setEntries(sortEntries([...workEntries, ...legacyEntries]));
      setForm((current) => ({
        ...current,
        market: loadedProfile?.default_document_market ?? loadedProfile?.document_market ?? "JP",
        currency: loadedProfile?.default_currency ?? "JPY",
        hourly_rate: current.hourly_rate === "0" ? String(loadedProfile?.default_hourly_rate ?? 0) : current.hourly_rate,
        daily_rate: current.daily_rate === "0" ? String(loadedProfile?.default_daily_rate ?? 0) : current.daily_rate,
        overtime_rate_percent: String(loadedProfile?.overtime_rate_percent ?? 25),
        night_rate_percent: String(loadedProfile?.night_rate_percent ?? 25),
        weekend_rate_percent: String(loadedProfile?.weekend_rate_percent ?? 35),
        holiday_rate_percent: String(loadedProfile?.holiday_rate_percent ?? 50)
      }));
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorTimecardLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateField<K extends keyof WorkEntryForm>(field: K, value: WorkEntryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateType(type: WorkEntryType) {
    setForm((current) => ({
      ...current,
      entry_type: type,
      status: type === "business_expense" ? "non_billable" : current.status === "non_billable" ? "billable" : current.status,
      client_id: type === "business_expense" ? current.client_id : current.client_id
    }));
  }

  function handleClientChange(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    const rate = client?.hourly_rate ?? profile?.default_hourly_rate ?? 0;
    const market = client?.preferred_document_market ?? client?.client_country ?? profile?.default_document_market ?? profile?.document_market ?? "JP";
    const currency = client?.currency ?? profile?.default_currency ?? (market === "AU" ? "AUD" : "JPY");
    setForm((current) => ({
      ...current,
      client_id: clientId,
      market,
      currency,
      hourly_rate: String(rate)
    }));
  }

  function relationshipForClient(client: Client | null | undefined) {
    if (!client?.client_company_id) return null;
    return relationships.find((relationship) => relationship.client_company_id === client.client_company_id) ?? null;
  }

  function clientOptionLabel(client: Client) {
    const kind = client.client_company_id ? "Contratante vinculado" : "Cliente manual";
    const market = client.preferred_document_market ?? client.client_country ?? "JP";
    const currency = client.currency ?? (market === "AU" ? "AUD" : "JPY");
    return `${client.company_name || client.client_name} - ${kind} - ${market} - ${currency}`;
  }

  function fillFormFromEntry(entry: EntryWithSource, date = todayInputValue()) {
    setEditingId(null);
    setEditingSource(null);
    setSuccess(null);
    setFormError(null);
    setForm({
      ...formFromEntry(entry),
      date,
      status: normalizeWorkEntryType(entry.entry_type) === "business_expense" ? "non_billable" : "billable"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyLatestEntry() {
    const latestEntry = entries[0];
    if (latestEntry) fillFormFromEntry(latestEntry);
  }

  function copyYesterdayEntry() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
    const yesterdayValue = yesterday.toISOString().slice(0, 10);
    const entry = entries.find((item) => workEntryDate(item) === yesterdayValue) ?? entries[0];
    if (entry) fillFormFromEntry(entry);
  }

  function applyTemplate(template: EntryTemplate) {
    setEditingId(null);
    setEditingSource(null);
    setSuccess(null);
    setFormError(null);
    setForm((current) => ({
      ...current,
      entry_type: template.entry_type,
      client_id: template.client_id ?? "",
      market: template.market,
      currency: template.currency,
      date: todayInputValue(),
      title: template.title ?? "",
      description: template.description ?? "",
      location: template.location ?? "",
      break_minutes: String(template.default_break_minutes ?? 0),
      hourly_rate: String(template.hourly_rate ?? 0),
      daily_rate: String(template.daily_rate ?? 0),
      unit_price: String(template.unit_price ?? 0),
      overtime_rate_percent: String(template.overtime_rate_percent ?? 25),
      night_rate_percent: String(template.night_rate_percent ?? 25),
      weekend_rate_percent: String(template.weekend_rate_percent ?? 35),
      holiday_rate_percent: String(template.holiday_rate_percent ?? 50)
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(entry: EntryWithSource) {
    setEditingId(entry.id);
    setEditingSource(entry.source_table);
    setSuccess(null);
    setFormError(null);
    setForm(formFromEntry(entry));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setEditingSource(null);
    setFormError(null);
    setForm({
      ...emptyForm,
      market: profile?.default_document_market ?? profile?.document_market ?? "JP",
      currency: profile?.default_currency ?? "JPY",
      hourly_rate: String(profile?.default_hourly_rate ?? 0),
      daily_rate: String(profile?.default_daily_rate ?? 0),
      overtime_rate_percent: String(profile?.overtime_rate_percent ?? 25),
      night_rate_percent: String(profile?.night_rate_percent ?? 25),
      weekend_rate_percent: String(profile?.weekend_rate_percent ?? 35),
      holiday_rate_percent: String(profile?.holiday_rate_percent ?? 50)
    });
  }

  function validateForm() {
    if (!form.date) return text.validationDate;
    if (needsClient && !form.client_id) return text.validationClient;
    if (selectedType === "hourly_work" && (!form.start_time || !form.end_time)) return text.validationTime;
    if (selectedType === "daily_work" && (numberValue(form.days) <= 0 || numberValue(form.daily_rate) <= 0)) return text.validationRequired;
    if (selectedType === "fixed_service" && numberValue(form.fixed_amount) === 0) return text.validationRequired;
    if ((selectedType === "client_expense" || selectedType === "business_expense") && numberValue(form.expense_amount) <= 0) {
      return text.validationRequired;
    }
    if (selectedType === "material" && (numberValue(form.quantity) <= 0 || numberValue(form.unit_price) <= 0)) return text.validationRequired;
    if (selectedType === "adjustment" && numberValue(form.discount_amount) === 0) return text.validationRequired;
    return null;
  }

  function buildWorkEntryPayload() {
    const draft = buildDraftEntry(form);
    const subtotal = calculateWorkEntryAmount(draft);
    const selectedClient = clients.find((client) => client.id === draft.client_id);
    const relationship = relationshipForClient(selectedClient);
    const premium = calculateHourlyPremiumBreakdown(draft);
    const market: "JP" | "AU" = draft.market === "AU" ? "AU" : "JP";
    const currency: "JPY" | "AUD" = draft.currency === "AUD" ? "AUD" : "JPY";
    const taxMode: "inclusive" | "exclusive" | "none" =
      draft.tax_mode === "inclusive" || draft.tax_mode === "none" ? draft.tax_mode : "exclusive";
    const status: WorkEntryStatus = workEntryStatuses.includes(draft.status as WorkEntryStatus)
      ? (draft.status as WorkEntryStatus)
      : "billable";

    return {
      client_id: draft.client_id ?? null,
      client_company_id: selectedClient?.client_company_id ?? null,
      contractor_relationship_id: relationship?.id ?? null,
      entry_type: normalizeWorkEntryType(draft.entry_type),
      market,
      date: draft.date || todayInputValue(),
      title: draft.title ?? null,
      description: draft.description ?? null,
      location: draft.location ?? null,
      start_time: draft.start_time ?? null,
      end_time: draft.end_time ?? null,
      break_minutes: Number(draft.break_minutes ?? 0),
      hours: draft.hours ?? null,
      days: draft.days ?? null,
      quantity: draft.quantity ?? null,
      unit: draft.unit ?? null,
      unit_price: draft.unit_price ?? null,
      hourly_rate: draft.hourly_rate ?? null,
      daily_rate: draft.daily_rate ?? null,
      fixed_amount: draft.fixed_amount ?? null,
      expense_amount: draft.expense_amount ?? null,
      material_cost: draft.material_cost ?? null,
      markup_amount: Number(draft.markup_amount ?? 0),
      discount_amount: Number(draft.discount_amount ?? 0),
      overtime_hours: Number(draft.overtime_hours ?? 0),
      overtime_rate_percent: Number(draft.overtime_rate_percent ?? 25),
      night_hours: Number(draft.night_hours ?? 0),
      night_rate_percent: Number(draft.night_rate_percent ?? 25),
      weekend_hours: Number(draft.weekend_hours ?? 0),
      weekend_rate_percent: Number(draft.weekend_rate_percent ?? 35),
      holiday_hours: Number(draft.holiday_hours ?? 0),
      holiday_rate_percent: Number(draft.holiday_rate_percent ?? 50),
      custom_premium_title: draft.custom_premium_title ?? null,
      custom_premium_amount: Number(draft.custom_premium_amount ?? 0),
      normal_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.normalAmount : 0,
      overtime_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.overtimeAmount : 0,
      night_premium_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.nightAmount : 0,
      weekend_premium_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.weekendAmount : 0,
      holiday_premium_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.holidayAmount : 0,
      premium_total_amount: normalizeWorkEntryType(draft.entry_type) === "hourly_work" ? premium.premiumTotal : 0,
      subtotal,
      tax_amount: 0,
      total_amount: subtotal,
      currency,
      tax_mode: taxMode,
      tax_rate: Number(draft.tax_rate ?? 0),
      is_billable: Boolean(draft.is_billable),
      is_business_expense: Boolean(draft.is_business_expense),
      is_client_charge: Boolean(draft.is_client_charge),
      receipt_url: draft.receipt_url ?? null,
      status,
      notes: draft.notes ?? null,
      updated_at: new Date().toISOString()
    };
  }

  async function saveCurrentTemplate() {
    setFormError(null);
    setSuccess(null);

    if (!userId) {
      setPageError(t("errorSessionExpired"));
      return;
    }

    const name = window.prompt(actions.saveTemplatePrompt, form.title || workEntryTypeLabels[language][selectedType]);
    if (!name?.trim()) return;

    try {
      const supabase = getSupabaseBrowser();
      const selectedClient = clients.find((client) => client.id === form.client_id);
      const relationship = relationshipForClient(selectedClient);
      const { error } = await supabase.from("entry_templates").insert({
        user_id: userId,
        name: name.trim(),
        entry_type: selectedType,
        client_id: form.client_id || null,
        client_company_id: selectedClient?.client_company_id ?? null,
        contractor_relationship_id: relationship?.id ?? null,
        market: form.market,
        currency: form.currency,
        title: nullable(form.title),
        description: nullable(form.description),
        location: nullable(form.location),
        hourly_rate: selectedType === "hourly_work" ? numberValue(form.hourly_rate) : null,
        daily_rate: selectedType === "daily_work" ? numberValue(form.daily_rate) : null,
        unit_price: selectedType === "material" ? numberValue(form.unit_price) : null,
        default_break_minutes: numberValue(form.break_minutes),
        overtime_rate_percent: numberValue(form.overtime_rate_percent, 25),
        night_rate_percent: numberValue(form.night_rate_percent, 25),
        weekend_rate_percent: numberValue(form.weekend_rate_percent, 35),
        holiday_rate_percent: numberValue(form.holiday_rate_percent, 50)
      });

      if (error) throw error;
      setSuccess(actions.templateSaved);
      await loadData();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorSaveEntry"));
    }
  }

  async function deleteTemplate(template: EntryTemplate) {
    if (!userId) return;

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("entry_templates").delete().eq("id", template.id).eq("user_id", userId);
      if (error) throw error;
      setSuccess(actions.templateDeleted);
      await loadData();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorDeleteEntry"));
    }
  }

  async function sendEntryToClient(entry: EntryWithSource) {
    setPageError(null);
    setSuccess(null);

    if (!userId) {
      setPageError(t("errorSessionExpired"));
      return;
    }

    if (entry.source_table !== "work_entries") {
      setPageError(actions.legacySendBlocked);
      return;
    }

    const selectedClient = clients.find((client) => client.id === entry.client_id);
    const clientCompanyId = entry.client_company_id ?? selectedClient?.client_company_id ?? null;
    const relationship =
      relationships.find((item) => item.client_company_id === clientCompanyId && item.status === "active") ??
      relationshipForClient(selectedClient);

    if (!clientCompanyId || !relationship?.id) {
      setPageError(actions.needsLinkedClientForSend);
      return;
    }

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase
        .from("work_entries")
        .update({
          client_company_id: clientCompanyId,
          contractor_relationship_id: relationship.id,
          visibility_to_client: true,
          sent_to_client_at: new Date().toISOString(),
          client_review_status: "sent",
          updated_at: new Date().toISOString()
        })
        .eq("id", entry.id)
        .eq("user_id", userId);

      if (error) throw error;
      setSuccess(actions.sendSuccess);
      await loadData();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : actions.needsLinkedClientForSend);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setPageError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!userId) {
      setPageError(t("errorSessionExpired"));
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabaseBrowser();
      const payload = buildWorkEntryPayload();

      if (editingId && editingSource === "work_entries") {
        const { error } = await supabase.from("work_entries").update(payload).eq("id", editingId).eq("user_id", userId);
        if (error) throw error;
      } else if (editingId && editingSource === "time_entries" && payload.entry_type === "hourly_work") {
        const { error } = await supabase
          .from("time_entries")
          .update({
            client_id: payload.client_id,
            work_date: payload.date,
            site_name: payload.location,
            service_type: payload.title || payload.description,
            start_time: payload.start_time || "00:00",
            end_time: payload.end_time || "00:00",
            break_minutes: payload.break_minutes,
            hourly_rate: payload.hourly_rate || 0,
            expense_amount: 0,
            toll_amount: 0,
            fuel_amount: 0,
            memo: payload.notes,
            is_invoiced: payload.status === "invoiced" || payload.status === "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", editingId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("work_entries").insert({ ...payload, user_id: userId });
        if (error) throw error;
      }

      setSuccess(editingId ? text.updated : text.saved);
      resetForm();
      await loadData();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorSaveEntry"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEntry(entry: EntryWithSource) {
    const confirmed = window.confirm(text.deleteConfirm.replace("{date}", formatDate(workEntryDate(entry))));
    if (!confirmed || !userId) return;

    try {
      const supabase = getSupabaseBrowser();
      const table = entry.source_table;
      const { error } = await supabase.from(table).delete().eq("id", entry.id).eq("user_id", userId);
      if (error) throw error;
      await loadData();
    } catch (caught) {
      setPageError(caught instanceof Error ? caught.message : t("errorDeleteEntry"));
    }
  }

  if (isLoading) return <LoadingState label={t("loading")} />;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">{text.title}</p>
        <h2 className="page-title">{text.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">{text.description}</p>
      </div>

      <form className="section-panel grid gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-ink">{editingId ? text.editEntry : text.addEntry}</h3>
            <p className="text-sm text-zinc-500">{text.hint}</p>
          </div>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              {t("cancel")}
            </Button>
          ) : null}
        </div>

        <ErrorMessage message={pageError || formError} />
        {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

        <div className="grid gap-3 rounded-lg border border-line bg-paper p-4">
          <div className="flex flex-wrap gap-2">
            <Button disabled={entries.length === 0} type="button" variant="secondary" onClick={copyLatestEntry}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              {actions.copyLatest}
            </Button>
            <Button disabled={entries.length === 0} type="button" variant="secondary" onClick={copyYesterdayEntry}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              {actions.copyYesterday}
            </Button>
            <Button type="button" variant="secondary" onClick={saveCurrentTemplate}>
              <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
              {actions.saveTemplate}
            </Button>
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-ink">{actions.templates}</p>
            {templates.length === 0 ? <p className="text-xs text-zinc-500">{actions.noTemplates}</p> : null}
            <div className="flex flex-wrap gap-2">
              {templates.map((template) => (
                <div className="inline-flex items-center gap-1 rounded-md border border-line bg-white p-1" key={template.id}>
                  <button className="px-3 py-1.5 text-sm font-semibold text-ink" type="button" onClick={() => applyTemplate(template)}>
                    {template.name}
                  </button>
                  <button className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50" title={actions.deleteTemplate} type="button" onClick={() => deleteTemplate(template)}>
                    {t("delete")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SelectField label={text.entryType} onChange={(event) => updateType(event.target.value as WorkEntryType)} value={selectedType}>
            {Object.entries(workEntryTypeLabels[language]).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </SelectField>
          <Field label={text.date} onChange={(event) => updateField("date", event.target.value)} required type="date" value={form.date} />
          <SelectField label={text.market} onChange={(event) => updateField("market", event.target.value as "JP" | "AU")} value={form.market}>
            <option value="JP">Japan</option>
            <option value="AU">Australia</option>
          </SelectField>
          <SelectField helper={!needsClient ? text.clientOptional : undefined} label={actions.customerLabel} onChange={(event) => handleClientChange(event.target.value)} required={needsClient} value={form.client_id}>
            <option value="">{needsClient ? t("select") : t("all")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {clientOptionLabel(client)}
              </option>
            ))}
          </SelectField>
          <SelectField label={text.currency} onChange={(event) => updateField("currency", event.target.value as "JPY" | "AUD")} value={form.currency}>
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </SelectField>
          <SelectField label={text.status} onChange={(event) => updateField("status", event.target.value as WorkEntryStatus)} value={form.status}>
            {workEntryStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status, language)}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(selectedType === "client_expense" || selectedType === "business_expense") ? (
            <SelectField label={text.category} onChange={(event) => updateField("title", event.target.value)} value={form.title}>
              <option value="">{t("select")}</option>
              {expenseCategories.map((category) => (
                <option key={category.key} value={categoryLabel(category, language)}>
                  {categoryLabel(category, language)}
                </option>
              ))}
            </SelectField>
          ) : (
            <Field label={text.titleField} onChange={(event) => updateField("title", event.target.value)} value={form.title} />
          )}
          <Field label={text.location} onChange={(event) => updateField("location", event.target.value)} value={form.location} />
          <Field label={text.receiptUrl} onChange={(event) => updateField("receipt_url", event.target.value)} value={form.receipt_url} />
        </div>

        {selectedType === "hourly_work" ? (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label={text.start} onChange={(event) => updateField("start_time", event.target.value)} required type="time" value={form.start_time} />
              <Field label={text.end} onChange={(event) => updateField("end_time", event.target.value)} required type="time" value={form.end_time} />
              <Field label={text.breakMinutes} min="0" onChange={(event) => updateField("break_minutes", event.target.value)} type="number" value={form.break_minutes} />
              <Field label={text.hourlyRate} min="0" onChange={(event) => updateField("hourly_rate", event.target.value)} type="number" value={form.hourly_rate} />
            </div>
            <div className="grid gap-4 rounded-lg border border-line bg-paper p-4">
              <h4 className="font-semibold text-ink">{actions.premiumTitle}</h4>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label={actions.overtimeHours} min="0" onChange={(event) => updateField("overtime_hours", event.target.value)} step="0.25" type="number" value={form.overtime_hours} />
                <Field label={actions.overtimePercent} min="0" onChange={(event) => updateField("overtime_rate_percent", event.target.value)} type="number" value={form.overtime_rate_percent} />
                <Field label={actions.nightHours} min="0" onChange={(event) => updateField("night_hours", event.target.value)} step="0.25" type="number" value={form.night_hours} />
                <Field label={actions.nightPercent} min="0" onChange={(event) => updateField("night_rate_percent", event.target.value)} type="number" value={form.night_rate_percent} />
                <Field label={actions.weekendHours} min="0" onChange={(event) => updateField("weekend_hours", event.target.value)} step="0.25" type="number" value={form.weekend_hours} />
                <Field label={actions.weekendPercent} min="0" onChange={(event) => updateField("weekend_rate_percent", event.target.value)} type="number" value={form.weekend_rate_percent} />
                <Field label={actions.holidayHours} min="0" onChange={(event) => updateField("holiday_hours", event.target.value)} step="0.25" type="number" value={form.holiday_hours} />
                <Field label={actions.holidayPercent} min="0" onChange={(event) => updateField("holiday_rate_percent", event.target.value)} type="number" value={form.holiday_rate_percent} />
                <Field label={actions.customPremiumTitle} onChange={(event) => updateField("custom_premium_title", event.target.value)} value={form.custom_premium_title} />
                <Field label={actions.customPremiumAmount} onChange={(event) => updateField("custom_premium_amount", event.target.value)} type="number" value={form.custom_premium_amount} />
              </div>
            </div>
          </div>
        ) : null}

        {selectedType === "daily_work" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={text.days} min="0" onChange={(event) => updateField("days", event.target.value)} required step="0.5" type="number" value={form.days} />
            <Field label={text.dailyRate} min="0" onChange={(event) => updateField("daily_rate", event.target.value)} required type="number" value={form.daily_rate} />
          </div>
        ) : null}

        {selectedType === "fixed_service" ? (
          <Field label={text.fixedAmount} onChange={(event) => updateField("fixed_amount", event.target.value)} required type="number" value={form.fixed_amount} />
        ) : null}

        {selectedType === "client_expense" || selectedType === "business_expense" ? (
          <Field label={text.expenseAmount} min="0" onChange={(event) => updateField("expense_amount", event.target.value)} required type="number" value={form.expense_amount} />
        ) : null}

        {selectedType === "material" ? (
          <div className="grid gap-4 md:grid-cols-5">
            <Field label={text.quantity} min="0" onChange={(event) => updateField("quantity", event.target.value)} required step="0.001" type="number" value={form.quantity} />
            <Field label={text.unit} onChange={(event) => updateField("unit", event.target.value)} value={form.unit} />
            <Field label={text.unitPrice} min="0" onChange={(event) => updateField("unit_price", event.target.value)} required type="number" value={form.unit_price} />
            <Field label={text.materialCost} min="0" onChange={(event) => updateField("material_cost", event.target.value)} type="number" value={form.material_cost} />
            <Field label={text.markupAmount} onChange={(event) => updateField("markup_amount", event.target.value)} type="number" value={form.markup_amount} />
          </div>
        ) : null}

        {selectedType === "adjustment" ? (
          <Field label={text.discountAmount} onChange={(event) => updateField("discount_amount", event.target.value)} required type="number" value={form.discount_amount} />
        ) : null}

        <TextAreaField label={text.descriptionField} onChange={(event) => updateField("description", event.target.value)} value={form.description} />
        <TextAreaField label={text.notes} onChange={(event) => updateField("notes", event.target.value)} value={form.notes} />

        <div className="grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">{text.previewTotal}</p>
            <p className="mt-1 text-2xl font-semibold text-jade-700">{formatWorkCurrency(preview.total, form.currency)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">{text.previewHours}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatHours(preview.hours)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">{actions.premiumAmount}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatWorkCurrency(selectedType === "hourly_work" ? premiumPreview.premiumTotal : 0, form.currency)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">{t("totalAmount")}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatWorkCurrency(pageTotals.totalBilled, form.currency)}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button disabled={needsClient && clients.length === 0} isLoading={isSaving} type="submit">
            {text.save}
          </Button>
        </div>
      </form>

      {entries.length === 0 ? (
        <EmptyState title={text.noEntries} description={text.emptyHint} />
      ) : (
        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{text.latest}</h3>
          <div className="grid gap-3 md:hidden">
            {entries.map((entry) => {
              const type = normalizeWorkEntryType(entry.entry_type);
              return (
                <article className="rounded-lg border border-line bg-white p-4" key={`${entry.source_table}-${entry.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-500">{formatDate(workEntryDate(entry))}</p>
                      <h4 className="font-semibold text-ink">{entry.clients?.client_name ?? (entry.client_id ? t("removedClient") : "-")}</h4>
                      <p className="mt-1 text-sm text-zinc-600">{workEntryTypeLabels[language][type]}</p>
                      <p className="mt-1 text-sm text-zinc-600">{workEntryTitle(entry) || workEntryLocation(entry) || "-"}</p>
                      <p className="mt-2 font-semibold text-jade-700">{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency ?? form.currency)}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {actions.reviewStatus}: {entry.visibility_to_client ? entry.client_review_status || "sent" : "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button className="px-3" type="button" variant="secondary" onClick={() => fillFormFromEntry(entry)}>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      {entry.source_table === "work_entries" ? (
                        <Button className="px-3" disabled={entry.visibility_to_client === true} type="button" variant="secondary" onClick={() => sendEntryToClient(entry)}>
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                      <Button className="px-3" type="button" variant="secondary" onClick={() => startEdit(entry)}>
                        <Edit2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button className="px-3" type="button" variant="danger" onClick={() => deleteEntry(entry)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{text.date}</th>
                  <th>{t("client")}</th>
                  <th>{text.type}</th>
                  <th>{text.titleField}</th>
                  <th>{text.location}</th>
                  <th>{text.amount}</th>
                  <th>{text.status}</th>
                  <th>{actions.reviewStatus}</th>
                  <th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => {
                  const type = normalizeWorkEntryType(entry.entry_type);
                  return (
                    <tr key={`${entry.source_table}-${entry.id}`}>
                      <td>{formatDate(workEntryDate(entry))}</td>
                      <td>{entry.clients?.client_name ?? (entry.client_id ? t("removedClient") : "-")}</td>
                      <td>{workEntryTypeLabels[language][type]}</td>
                      <td>{workEntryTitle(entry) || "-"}</td>
                      <td>{workEntryLocation(entry) || "-"}</td>
                      <td>{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency ?? form.currency)}</td>
                      <td>{statusLabel((entry.status as WorkEntryStatus | undefined) ?? "billable", language)}</td>
                      <td>{entry.visibility_to_client ? entry.client_review_status || "sent" : "-"}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => fillFormFromEntry(entry)}>
                            {actions.duplicate}
                          </Button>
                          {entry.source_table === "work_entries" ? (
                            <Button disabled={entry.visibility_to_client === true} type="button" variant="secondary" onClick={() => sendEntryToClient(entry)}>
                              {entry.visibility_to_client ? actions.sentToClient : actions.sendToClient}
                            </Button>
                          ) : null}
                          <Button type="button" variant="secondary" onClick={() => startEdit(entry)}>
                            {t("edit")}
                          </Button>
                          <Button type="button" variant="danger" onClick={() => deleteEntry(entry)}>
                            {t("delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
