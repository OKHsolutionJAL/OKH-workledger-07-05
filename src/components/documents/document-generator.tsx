"use client";

import { FileDown, Printer, Send, Share2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Client, Profile } from "@/lib/database.types";
import { createReportNumber } from "@/lib/format";
import type { Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { australianDocumentLabels, australianDocumentPrefixes } from "@/lib/pdf/australian-document-labels";
import { generateAustralianDocumentPdf } from "@/lib/pdf/australian-documents";
import { documentClientDisplayName } from "@/lib/pdf/document-client";
import { generateJapaneseDocumentPdf } from "@/lib/pdf/japanese-documents";
import {
  australianDocumentTypes,
  japaneseDocumentLabels,
  japaneseDocumentPrefixes,
  japaneseDocumentTypes,
  normalizeAustralianDocumentType,
  normalizeDocumentMarket,
  normalizeJapaneseDocumentType,
  type AustralianDocumentType,
  type DocumentEntry,
  type DocumentMarket,
  type JapaneseDocumentType,
  type PdfAction
} from "@/lib/pdf/types";
import { calculateWorkEntryAmount, isDocumentBillableEntry } from "@/lib/work-entries";
import type { Json } from "@/lib/database.types";

type EntryWithClient = DocumentEntry;

type MarketProfile = Profile & {
  company_country?: string | null;
  country?: string | null;
  default_document_market?: string | null;
  document_market?: string | null;
  gst_registered?: boolean | null;
  japan_invoice_prefix?: string | null;
  japan_estimate_prefix?: string | null;
  japan_delivery_prefix?: string | null;
  japan_receipt_prefix?: string | null;
  australia_invoice_prefix?: string | null;
  australia_quote_prefix?: string | null;
  australia_receipt_prefix?: string | null;
  australia_statement_prefix?: string | null;
};

type MarketClient = Client & {
  client_company_id?: string | null;
  client_country?: string | null;
  preferred_document_market?: string | null;
  currency?: string | null;
  phone_normalized?: string | null;
};

type DocumentGeneratorProps = {
  profile: Profile | null;
  client: Client | null;
  clients?: Client[];
  entries: EntryWithClient[];
  month: number;
  year: number;
  sequence: number;
  onError: (message: string) => void;
  onSuccess?: (message: string) => void;
  onTaxExport?: () => Promise<void> | void;
  isExporting?: boolean;
};

const documentGeneratorText: Record<
  Language,
  {
    customerRequired: string;
    onePerCustomer: string;
    selectedCustomer: string;
    modalKicker: string;
    modalHint: string;
    japan: string;
    australia: string;
    japanHint: string;
    australiaHint: string;
    printA4: string;
    savePdf: string;
    sendToTax: string;
    exportUnavailable: string;
    generatedPerCustomer: string;
    allCustomers: string;
  }
> = {
  pt: {
    customerRequired: "Selecione um cliente para gerar este documento.",
    onePerCustomer: "Gerar um documento por cliente",
    selectedCustomer: "Cliente selecionado",
    modalKicker: "Documentos profissionais",
    modalHint: "Escolha Jap\u00e3o ou Austr\u00e1lia. O idioma do documento segue o mercado selecionado.",
    japan: "Jap\u00e3o",
    australia: "Austr\u00e1lia",
    japanHint: "Documentos sempre em japon\u00eas",
    australiaHint: "Documentos sempre em ingl\u00eas australiano",
    printA4: "Imprimir / Salvar PDF",
    savePdf: "Salvar PDF",
    sendToTax: "Enviar dados para declara\u00e7\u00e3o",
    exportUnavailable: "A exporta\u00e7\u00e3o para declara\u00e7\u00e3o est\u00e1 dispon\u00edvel na tela de relat\u00f3rios.",
    generatedPerCustomer: "Documentos por cliente preparados.",
    allCustomers: "Todos"
  },
  ja: {
    customerRequired: "\u66f8\u985e\u3092\u4f5c\u6210\u3059\u308b\u524d\u306b\u53d6\u5f15\u5148\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    onePerCustomer: "\u53d6\u5f15\u5148\u3054\u3068\u306b\u66f8\u985e\u3092\u4f5c\u6210",
    selectedCustomer: "\u9078\u629e\u4e2d\u306e\u53d6\u5f15\u5148",
    modalKicker: "\u696d\u52d9\u7528\u66f8\u985e",
    modalHint:
      "\u65e5\u672c\u307e\u305f\u306f\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u66f8\u985e\u306e\u8a00\u8a9e\u306f\u9078\u629e\u3057\u305f\u5e02\u5834\u306b\u5f93\u3044\u307e\u3059\u3002",
    japan: "\u65e5\u672c",
    australia: "\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2",
    japanHint: "\u66f8\u985e\u306f\u5e38\u306b\u65e5\u672c\u8a9e\u3067\u4f5c\u6210\u3055\u308c\u307e\u3059",
    australiaHint: "\u66f8\u985e\u306f\u5e38\u306b\u30aa\u30fc\u30b9\u30c8\u30e9\u30ea\u30a2\u82f1\u8a9e\u3067\u4f5c\u6210\u3055\u308c\u307e\u3059",
    printA4: "\u5370\u5237 / PDF\u4fdd\u5b58",
    savePdf: "PDF\u4fdd\u5b58",
    sendToTax: "\u7533\u544a\u30b7\u30b9\u30c6\u30e0\u3078\u9001\u4fe1",
    exportUnavailable: "\u7533\u544a\u30b7\u30b9\u30c6\u30e0\u3078\u306e\u9001\u4fe1\u306f\u30ec\u30dd\u30fc\u30c8\u753b\u9762\u3067\u5229\u7528\u3067\u304d\u307e\u3059\u3002",
    generatedPerCustomer: "\u53d6\u5f15\u5148\u3054\u3068\u306e\u66f8\u985e\u3092\u4f5c\u6210\u3057\u307e\u3057\u305f\u3002",
    allCustomers: "\u3059\u3079\u3066"
  },
  en: {
    customerRequired: "Please select a customer before generating this document.",
    onePerCustomer: "Generate one document per customer",
    selectedCustomer: "Selected customer",
    modalKicker: "Professional documents",
    modalHint: "Choose Japan or Australia. The document language follows the selected market.",
    japan: "Japan",
    australia: "Australia",
    japanHint: "Documents always in Japanese",
    australiaHint: "Documents always in Australian English",
    printA4: "Print / Save PDF",
    savePdf: "Save PDF",
    sendToTax: "Send to Tax System",
    exportUnavailable: "Tax system export is available from the reports page.",
    generatedPerCustomer: "Documents per customer prepared.",
    allCustomers: "All"
  }
};

function suggestedMarket(profile: Profile | null, client: Client | null): DocumentMarket {
  const marketClient = client as MarketClient | null;
  const marketProfile = profile as MarketProfile | null;
  return normalizeDocumentMarket(
    marketClient?.preferred_document_market ||
      marketClient?.client_country ||
      marketProfile?.default_document_market ||
      marketProfile?.document_market ||
      marketProfile?.company_country ||
      marketProfile?.country
  );
}

function japanesePrefixFor(profile: Profile | null, type: JapaneseDocumentType) {
  const marketProfile = profile as MarketProfile | null;
  const profilePrefixes: Record<JapaneseDocumentType, string | null | undefined> = {
    invoice: marketProfile?.japan_invoice_prefix,
    estimate: marketProfile?.japan_estimate_prefix,
    delivery: marketProfile?.japan_delivery_prefix,
    receipt: marketProfile?.japan_receipt_prefix
  };
  return profilePrefixes[type]?.trim() || japaneseDocumentPrefixes[type] || japaneseDocumentPrefixes.invoice;
}

function australianPrefixFor(profile: Profile | null, type: AustralianDocumentType) {
  const marketProfile = profile as MarketProfile | null;
  const profilePrefixes: Partial<Record<AustralianDocumentType, string | null | undefined>> = {
    tax_invoice: marketProfile?.australia_invoice_prefix,
    invoice: marketProfile?.australia_invoice_prefix,
    quote: marketProfile?.australia_quote_prefix,
    receipt: marketProfile?.australia_receipt_prefix,
    statement: marketProfile?.australia_statement_prefix
  };
  return profilePrefixes[type]?.trim() || australianDocumentPrefixes[type] || australianDocumentPrefixes.invoice;
}

function normalizeSearchPhone(value: string | null | undefined) {
  return String(value ?? "").replace(/[^0-9+]/g, "");
}

async function resolveClientCompanyId(targetClient: Client, workerUserId: string) {
  const supabase = getSupabaseBrowser();
  const directCompanyId = (targetClient as MarketClient).client_company_id;
  if (directCompanyId) return directCompanyId;

  const { data: relationships } = await supabase
    .from("contractor_relationships")
    .select("client_company_id")
    .eq("worker_user_id", workerUserId)
    .eq("status", "active");

  const companyIds = [...new Set((relationships ?? []).map((item) => item.client_company_id).filter(Boolean))];
  if (companyIds.length === 0) return null;

  const { data: companies } = await supabase
    .from("profiles")
    .select("id, email, phone, phone_normalized, company_name, business_name, full_name")
    .in("id", companyIds);

  const clientEmail = String(targetClient.email ?? "").trim().toLowerCase();
  const clientPhone = normalizeSearchPhone((targetClient as MarketClient).phone_normalized || targetClient.phone);
  const clientNames = [targetClient.company_name, targetClient.client_name]
    .map((item) => String(item ?? "").trim().toLowerCase())
    .filter(Boolean);

  const match = (companies ?? []).find((company) => {
    const companyEmail = String(company.email ?? "").trim().toLowerCase();
    const companyPhone = normalizeSearchPhone(company.phone_normalized || company.phone);
    const companyNames = [company.company_name, company.business_name, company.full_name]
      .map((item) => String(item ?? "").trim().toLowerCase())
      .filter(Boolean);

    return (
      (clientEmail && companyEmail && clientEmail === companyEmail) ||
      (clientPhone && companyPhone && clientPhone === companyPhone) ||
      clientNames.some((name) => companyNames.includes(name))
    );
  });

  return match?.id ?? null;
}

async function saveIssuedDocumentForPortal(input: {
  targetClient: Client;
  billableEntries: EntryWithClient[];
  profile: Profile | null;
  month: number;
  year: number;
  targetMarket: DocumentMarket;
  documentType: string;
  documentTitle: string;
  documentNumber: string;
}) {
  const supabase = getSupabaseBrowser();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  const clientCompanyId = await resolveClientCompanyId(input.targetClient, user.id);
  if (!clientCompanyId) return;

  const currency = input.targetClient.currency === "AUD" || input.targetMarket === "AU" ? "AUD" : "JPY";
  const grossAmount = input.billableEntries.reduce((total, entry) => total + calculateWorkEntryAmount(entry), 0);

  await supabase.from("issued_documents").insert({
    worker_user_id: user.id,
    client_company_id: clientCompanyId,
    client_id: input.targetClient.id,
    document_number: input.documentNumber,
    document_type: input.documentType,
    document_market: input.targetMarket,
    title: input.documentTitle,
    period_year: input.year,
    period_month: input.month,
    gross_amount: grossAmount,
    currency,
    original_payload: {
      documentNumber: input.documentNumber,
      documentType: input.documentType,
      documentMarket: input.targetMarket,
      month: input.month,
      year: input.year,
      client: {
        id: input.targetClient.id,
        name: input.targetClient.client_name,
        companyName: input.targetClient.company_name,
        email: input.targetClient.email
      },
      entryIds: input.billableEntries.map((entry) => entry.id)
    } as Json,
    status: "issued"
  });
}

export function DocumentGenerator({
  profile,
  client,
  clients = [],
  entries,
  month,
  year,
  sequence,
  onError,
  onSuccess,
  onTaxExport,
  isExporting = false
}: DocumentGeneratorProps) {
  const { language, t } = useLanguage();
  const text = documentGeneratorText[language];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<DocumentMarket>(() => suggestedMarket(profile, client));
  const [selectedJapaneseType, setSelectedJapaneseType] = useState<JapaneseDocumentType>("invoice");
  const [selectedAustralianType, setSelectedAustralianType] = useState<AustralianDocumentType>("tax_invoice");
  const [isGenerating, setIsGenerating] = useState(false);
  const [disabledModules, setDisabledModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedMarket(suggestedMarket(profile, client));
  }, [client, profile]);

  useEffect(() => {
    async function loadModuleAccess() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_module_access")
          .select("module_name, is_enabled")
          .eq("user_id", user.id);

        if (error) return;
        setDisabledModules(new Set((data ?? []).filter((item) => !item.is_enabled).map((item) => item.module_name)));
      } catch {
        setDisabledModules(new Set());
      }
    }

    loadModuleAccess();
  }, []);

  const safeJapaneseType = normalizeJapaneseDocumentType(selectedJapaneseType);
  const safeAustralianType = normalizeAustralianDocumentType(selectedAustralianType);
  const isGstRegistered = ((profile as MarketProfile | null)?.gst_registered ?? true) === true;
  const effectiveAustralianType: AustralianDocumentType = !isGstRegistered && safeAustralianType === "tax_invoice" ? "invoice" : safeAustralianType;
  const selectedClientName = documentClientDisplayName(client) || text.allCustomers;
  const actionsDisabled = !client || isGenerating;
  const canUseJapanDocuments = !disabledModules.has("japan_documents");
  const canUseAustraliaDocuments = !disabledModules.has("australia_documents");
  const canUseTaxExport = !disabledModules.has("tax_export");
  const availableMarkets = useMemo(() => {
    const markets = [canUseJapanDocuments ? "JP" : null, canUseAustraliaDocuments ? "AU" : null].filter(Boolean) as DocumentMarket[];
    return markets.length > 0 ? markets : (["JP"] as DocumentMarket[]);
  }, [canUseAustraliaDocuments, canUseJapanDocuments]);

  useEffect(() => {
    if (!availableMarkets.includes(selectedMarket)) {
      setSelectedMarket(availableMarkets[0] ?? "JP");
    }
  }, [availableMarkets, selectedMarket]);

  const documentNumber = useMemo(() => {
    const reportNumber = createReportNumber(year, month, sequence);
    if (selectedMarket === "AU") {
      return reportNumber.replace("REP", australianPrefixFor(profile, effectiveAustralianType));
    }
    return reportNumber.replace("REP", japanesePrefixFor(profile, safeJapaneseType));
  }, [effectiveAustralianType, month, profile, safeJapaneseType, selectedMarket, sequence, year]);

  async function generateForClient(
    targetClient: Client,
    targetEntries: EntryWithClient[],
    action: PdfAction,
    targetSequence = sequence,
    marketOverride?: DocumentMarket
  ) {
    const billableEntries = targetEntries.filter(isDocumentBillableEntry);
    if (billableEntries.length === 0) {
      throw new Error(t("noEntriesForDocument"));
    }

    const reportNumber = createReportNumber(year, month, targetSequence);
    const targetMarket = marketOverride ?? suggestedMarket(profile, targetClient);
    const targetAustralianType =
      !isGstRegistered && safeAustralianType === "tax_invoice" ? "invoice" : normalizeAustralianDocumentType(safeAustralianType);
    const targetDocumentNumber =
      targetMarket === "AU"
        ? reportNumber.replace("REP", australianPrefixFor(profile, targetAustralianType))
        : reportNumber.replace("REP", japanesePrefixFor(profile, safeJapaneseType));

    if (targetMarket === "AU") {
      await generateAustralianDocumentPdf({
        type: targetAustralianType,
        profile,
        client: targetClient,
        entries: billableEntries,
        month,
        year,
        documentNumber: targetDocumentNumber,
        action
      });
      await saveIssuedDocumentForPortal({
        targetClient,
        billableEntries,
        profile,
        month,
        year,
        targetMarket,
        documentType: targetAustralianType,
        documentTitle: australianDocumentLabels[targetAustralianType],
        documentNumber: targetDocumentNumber
      });
      return `${australianDocumentLabels[targetAustralianType]} ${targetDocumentNumber}: ${t("documentGenerated")}`;
    }

    await generateJapaneseDocumentPdf({
      type: safeJapaneseType,
      profile,
      client: targetClient,
      entries: billableEntries,
      month,
      year,
      documentNumber: targetDocumentNumber,
      action
    });
    await saveIssuedDocumentForPortal({
      targetClient,
      billableEntries,
      profile,
      month,
      year,
      targetMarket,
      documentType: safeJapaneseType,
      documentTitle: japaneseDocumentLabels[safeJapaneseType],
      documentNumber: targetDocumentNumber
    });
    return `${japaneseDocumentLabels[safeJapaneseType]} ${targetDocumentNumber}: ${t("documentGenerated")}`;
  }

  async function generate(action: PdfAction) {
    if (!client) {
      onError(text.customerRequired);
      return;
    }

    if (entries.length === 0) {
      onError(t("noEntriesForDocument"));
      return;
    }

    setIsGenerating(true);
    onError("");

    try {
      const successMessage = await generateForClient(client, entries, action, sequence, selectedMarket);
      onSuccess?.(successMessage);
      setIsOpen(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Nao foi possivel gerar o documento.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateOnePerCustomer() {
    const groupedEntries = entries.reduce<Record<string, EntryWithClient[]>>((groups, entry) => {
      if (!entry.client_id) return groups;
      groups[entry.client_id] = [...(groups[entry.client_id] ?? []), entry];
      return groups;
    }, {});
    const targetClients = clients.filter((item) => groupedEntries[item.id]?.length);

    if (targetClients.length === 0) {
      onError(text.customerRequired);
      return;
    }

    setIsGenerating(true);
    onError("");

    try {
      for (const [index, targetClient] of targetClients.entries()) {
        await generateForClient(targetClient, groupedEntries[targetClient.id] ?? [], "preview", sequence + index);
      }
      onSuccess?.(text.generatedPerCustomer);
      setIsOpen(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Nao foi possivel gerar os documentos por cliente.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleTaxExport() {
    if (!client) {
      onError(text.customerRequired);
      return;
    }

    if (!onTaxExport) {
      onError(text.exportUnavailable);
      return;
    }

    await onTaxExport();
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} type="button" variant="secondary">
        <FileDown className="h-4 w-4" aria-hidden="true" />
        {t("generateDocument")}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-3 sm:p-4">
          <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-semibold text-jade-700">{text.modalKicker}</p>
                <h2 className="mt-1 text-lg font-semibold text-ink sm:text-xl">{t("chooseDocument")}</h2>
                <p className="mt-2 text-sm text-zinc-500">{text.modalHint}</p>
              </div>
              <button
                className="rounded-md p-2 text-zinc-500 transition hover:bg-paper hover:text-ink"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">{t("cancel")}</span>
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
              {availableMarkets.map((market) => (
                <button
                  className={`rounded-lg border p-3 text-left transition sm:p-4 ${
                    selectedMarket === market ? "border-jade-600 bg-jade-50" : "border-line bg-white hover:bg-paper"
                  }`}
                  key={market}
                  onClick={() => setSelectedMarket(market)}
                  type="button"
                >
                  <span className="text-lg font-semibold text-ink">{market === "JP" ? text.japan : text.australia}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{market === "JP" ? text.japanHint : text.australiaHint}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
              {selectedMarket === "JP"
                ? japaneseDocumentTypes.map((type) => (
                    <button
                      className={`rounded-lg border p-3 text-left transition sm:p-4 ${
                        safeJapaneseType === type ? "border-jade-600 bg-jade-50" : "border-line bg-white hover:bg-paper"
                      }`}
                      key={type}
                      onClick={() => setSelectedJapaneseType(type)}
                      type="button"
                    >
                      <span className="text-lg font-semibold text-ink">{japaneseDocumentLabels[type]}</span>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {japanesePrefixFor(profile, type)}-{year}-{String(month).padStart(2, "0")}
                      </span>
                    </button>
                  ))
                : australianDocumentTypes.map((type) => (
                    <button
                      className={`rounded-lg border p-3 text-left transition sm:p-4 ${
                        safeAustralianType === type ? "border-jade-600 bg-jade-50" : "border-line bg-white hover:bg-paper"
                      }`}
                      key={type}
                      onClick={() => setSelectedAustralianType(type)}
                      type="button"
                    >
                      <span className="text-lg font-semibold text-ink">{australianDocumentLabels[type]}</span>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {australianPrefixFor(profile, type)}-{year}-{String(month).padStart(2, "0")}
                      </span>
                    </button>
                  ))}
            </div>

            <div className="mt-4 rounded-lg border border-line bg-paper p-3 text-sm text-zinc-600 sm:mt-5 sm:p-4">
              <p>
                Market: <strong>{selectedMarket === "JP" ? text.japan : text.australia}</strong>
              </p>
              <p>
                {t("referenceMonth")}: {year}/{String(month).padStart(2, "0")}
              </p>
              <p>
                {text.selectedCustomer}: <strong>{selectedClientName}</strong>
              </p>
              <p>No. {documentNumber}</p>
            </div>

            {!client ? (
              <div className="mt-4 grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p>{text.customerRequired}</p>
                <Button disabled={isGenerating} isLoading={isGenerating} onClick={generateOnePerCustomer} type="button" variant="secondary">
                  {text.onePerCustomer}
                </Button>
              </div>
            ) : null}

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Button disabled={actionsDisabled} isLoading={isGenerating} onClick={() => generate("preview")} type="button" variant="secondary">
                {t("preview")}
              </Button>
              <Button disabled={actionsDisabled} isLoading={isGenerating} onClick={() => generate("print")} type="button">
                <Printer className="h-4 w-4" aria-hidden="true" />
                {text.printA4}
              </Button>
              <Button disabled={actionsDisabled} isLoading={isGenerating} onClick={() => generate("share")} type="button" variant="secondary">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t("share")}
              </Button>
              {canUseTaxExport ? (
                <Button disabled={!client || isExporting} isLoading={isExporting} onClick={handleTaxExport} type="button" variant="secondary">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {text.sendToTax}
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
