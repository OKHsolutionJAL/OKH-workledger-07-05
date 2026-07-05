"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { DocumentGenerator } from "@/components/documents/document-generator";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { SelectField } from "@/components/ui/field";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import type { Client, MonthlyReport, Profile, TimeEntry } from "@/lib/database.types";
import { formatDate, formatHours, getMonthRange } from "@/lib/format";
import { prepareTaxSystemExport } from "@/lib/integrations/tax-system-export";
import { getMonthName, type Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  calculateWorkEntryAmount,
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
  type WorkEntryLike,
  type WorkEntryWithClient
} from "@/lib/work-entries";

type EntryWithSource = WorkEntryLike & {
  source_table: "work_entries" | "time_entries";
};

type ReportWithClient = MonthlyReport & {
  clients: Pick<Client, "client_name" | "client_name_jp"> | null;
};

const currentDate = new Date();

const taxExportText: Record<Language, { customerRequired: string; success: string }> = {
  pt: {
    customerRequired: "Selecione um cliente para gerar este documento.",
    success: "Dados preparados para envio ao sistema de declaração."
  },
  ja: {
    customerRequired: "\u66f8\u985e\u3092\u4f5c\u6210\u3059\u308b\u524d\u306b\u53d6\u5f15\u5148\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    success: "\u7533\u544a\u30b7\u30b9\u30c6\u30e0\u7528\u306e\u30c7\u30fc\u30bf\u3092\u4f5c\u6210\u3057\u307e\u3057\u305f\u3002"
  },
  en: {
    customerRequired: "Please select a customer before generating this document.",
    success: "Data prepared for tax system export."
  }
};

const reportText: Record<
  Language,
  {
    totalBilled: string;
    dailyDays: string;
    fixedServices: string;
    clientExpenses: string;
    businessExpenses: string;
    materials: string;
    tax: string;
    estimatedProfit: string;
    entryType: string;
    title: string;
    amount: string;
  }
> = {
  pt: {
    totalBilled: "Total faturado",
    dailyDays: "Dias por diaria",
    fixedServices: "Servicos fechados",
    clientExpenses: "Despesas cobradas",
    businessExpenses: "Despesas internas",
    materials: "Materiais",
    tax: "Impostos",
    estimatedProfit: "Lucro estimado",
    entryType: "Tipo",
    title: "Titulo",
    amount: "Valor"
  },
  ja: {
    totalBilled: "\u8acb\u6c42\u5bfe\u8c61\u5408\u8a08",
    dailyDays: "\u65e5\u5f53\u65e5\u6570",
    fixedServices: "\u5b9a\u984d\u30b5\u30fc\u30d3\u30b9",
    clientExpenses: "\u7acb\u66ff\u7d4c\u8cbb",
    businessExpenses: "\u4e8b\u696d\u7d4c\u8cbb",
    materials: "\u6750\u6599",
    tax: "\u7a0e\u984d",
    estimatedProfit: "\u63a8\u5b9a\u5229\u76ca",
    entryType: "\u7a2e\u5225",
    title: "\u4ef6\u540d",
    amount: "\u91d1\u984d"
  },
  en: {
    totalBilled: "Total billed",
    dailyDays: "Day-rate days",
    fixedServices: "Fixed services",
    clientExpenses: "Client expenses",
    businessExpenses: "Business expenses",
    materials: "Materials",
    tax: "Tax",
    estimatedProfit: "Estimated profit",
    entryType: "Type",
    title: "Title",
    amount: "Amount"
  }
};

function sortEntries(entries: EntryWithSource[]) {
  return entries.sort((a, b) => workEntryDate(a).localeCompare(workEntryDate(b)));
}

function displayCurrency(profile: Profile | null, client: Client | null) {
  return client?.currency ?? profile?.default_currency ?? "JPY";
}

export default function ReportsPage() {
  const { language, t } = useLanguage();
  const text = reportText[language];
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [entries, setEntries] = useState<EntryWithSource[]>([]);
  const [reports, setReports] = useState<ReportWithClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const numericMonth = Number(month);
  const numericYear = Number(year);
  const selectedClient = clients.find((client) => client.id === clientId) ?? null;
  const currency = displayCurrency(profile, selectedClient);
  const totals = useMemo(() => summarizeWorkEntries(entries), [entries]);
  const nextDocumentSequence = Math.max(
    Number(profile?.next_document_sequence ?? 1),
    reports.filter((report) => report.report_year === numericYear && report.report_month === numericMonth).length + 1
  );

  const loadReportsData = useCallback(async () => {
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

      const { start, end } = getMonthRange(numericYear, numericMonth);

      let legacyQuery = supabase
        .from("time_entries")
        .select("*, clients(client_name, client_name_jp, hourly_rate)")
        .eq("user_id", user.id)
        .gte("work_date", start)
        .lte("work_date", end)
        .order("work_date", { ascending: true });

      if (clientId) legacyQuery = legacyQuery.eq("client_id", clientId);
      if (status === "invoiced") legacyQuery = legacyQuery.eq("is_invoiced", true);
      if (status === "open") legacyQuery = legacyQuery.eq("is_invoiced", false);

      const [profileResult, clientsResult, legacyResult, reportsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("clients").select("*").eq("user_id", user.id).order("client_name"),
        legacyQuery,
        supabase
          .from("monthly_reports")
          .select("*, clients(client_name, client_name_jp)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (clientsResult.error) throw clientsResult.error;
      if (legacyResult.error) throw legacyResult.error;
      if (reportsResult.error) throw reportsResult.error;

      let workQuery = supabase
        .from("work_entries")
        .select("*, clients(client_name, client_name_jp, hourly_rate)")
        .eq("user_id", user.id)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });

      if (clientId) workQuery = workQuery.eq("client_id", clientId);
      if (status === "invoiced") workQuery = workQuery.in("status", ["invoiced", "paid"]);
      if (status === "open") workQuery = workQuery.in("status", ["draft", "billable", "non_billable"]);

      const workResult = await workQuery;
      if (workResult.error && !isWorkEntryMissingTableError(workResult.error)) throw workResult.error;

      const workEntries = workResult.error
        ? []
        : ((workResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
            ...entry,
            source_table: "work_entries" as const
          }));
      const legacyEntries = ((legacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map((entry) => ({
        ...legacyTimeEntryToWorkEntry(entry),
        source_table: "time_entries" as const
      }));

      setProfile(profileResult.data);
      setClients(clientsResult.data ?? []);
      setEntries(sortEntries([...workEntries, ...legacyEntries]));
      setReports((reportsResult.data ?? []) as ReportWithClient[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorReportLoad"));
    } finally {
      setIsLoading(false);
    }
  }, [clientId, numericMonth, numericYear, status, t]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  async function handleTaxExport() {
    if (!userId) {
      setError(t("errorSessionExpired"));
      return;
    }

    if (!selectedClient) {
      setError(taxExportText[language].customerRequired);
      return;
    }

    if (entries.length === 0) {
      setError(t("noEntriesForDocument"));
      return;
    }

    setError(null);
    setSuccess(null);
    setIsExporting(true);

    try {
      const supabase = getSupabaseBrowser();
      await prepareTaxSystemExport({
        supabase,
        userId,
        profile,
        client: selectedClient,
        entries,
        month: numericMonth,
        year: numericYear
      });

      setSuccess(taxExportText[language].success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorReportLoad"));
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) return <LoadingState label={t("loading")} />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-jade-700">{t("professionalDocuments")}</p>
          <h2 className="page-title">{t("reportMonthly")}</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("reportDescription")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DocumentGenerator
            client={selectedClient}
            clients={clients}
            entries={entries}
            isExporting={isExporting}
            month={numericMonth}
            onError={(message) => setError(message || null)}
            onSuccess={setSuccess}
            onTaxExport={handleTaxExport}
            profile={profile}
            sequence={nextDocumentSequence}
            year={numericYear}
          />
        </div>
      </div>

      <section className="section-panel grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label={t("month")} onChange={(event) => setMonth(event.target.value)} value={month}>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {getMonthName(language, index + 1)}
              </option>
            ))}
          </SelectField>
          <SelectField label={t("year")} onChange={(event) => setYear(event.target.value)} value={year}>
            {Array.from({ length: 6 }, (_, index) => currentDate.getFullYear() - 3 + index).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          <SelectField label={t("client")} onChange={(event) => setClientId(event.target.value)} value={clientId}>
            <option value="">{t("all")}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name}
              </option>
            ))}
          </SelectField>
          <SelectField label={t("status")} onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">{t("all")}</option>
            <option value="invoiced">{t("invoiced")}</option>
            <option value="open">{t("notInvoiced")}</option>
          </SelectField>
        </div>
      </section>

      <ErrorMessage message={error} />
      {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label={text.totalBilled} value={formatWorkCurrency(totals.totalBilled, currency)} />
        <StatCard label={t("totalHours")} value={formatHours(totals.totalHours)} />
        <StatCard label={text.dailyDays} value={String(totals.dailyWorkDays)} />
        <StatCard label={text.fixedServices} value={formatWorkCurrency(totals.fixedServices, currency)} />
        <StatCard label={text.estimatedProfit} value={formatWorkCurrency(totals.estimatedProfit, currency)} />
        <StatCard label={text.clientExpenses} value={formatWorkCurrency(totals.clientExpenses, currency)} />
        <StatCard label={text.businessExpenses} value={formatWorkCurrency(totals.businessExpenses, currency)} />
        <StatCard label={text.materials} value={formatWorkCurrency(totals.materials, currency)} />
        <StatCard label={text.tax} value={formatWorkCurrency(totals.taxAmount, currency)} />
        <StatCard label={t("activeClients")} value={String(totals.activeClients)} />
      </section>

      {entries.length === 0 ? (
        <EmptyState title={t("noEntriesFound")} description={t("adjustFiltersOrAddEntries")} />
      ) : (
        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{t("entriesForPeriod")}</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("client")}</th>
                  <th>{text.entryType}</th>
                  <th>{text.title}</th>
                  <th>{t("local")}</th>
                  <th>{t("hours")}</th>
                  <th>{text.amount}</th>
                  <th>{t("notes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => {
                  const type = normalizeWorkEntryType(entry.entry_type);
                  const hours = type === "hourly_work" ? summarizeWorkEntries([entry]).totalHours : 0;
                  return (
                    <tr key={`${entry.source_table}-${entry.id}`}>
                      <td>{formatDate(workEntryDate(entry))}</td>
                      <td>{entry.clients?.client_name ?? (entry.client_id ? t("removedClient") : "-")}</td>
                      <td>{workEntryTypeLabels[language][type]}</td>
                      <td>{workEntryTitle(entry) || "-"}</td>
                      <td>{workEntryLocation(entry) || "-"}</td>
                      <td>{hours ? formatHours(hours) : "-"}</td>
                      <td>{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency ?? currency)}</td>
                      <td>{workEntryNotes(entry) || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section-panel grid gap-4">
        <h3 className="text-lg font-semibold text-ink">{t("generatedPdfHistory")}</h3>
        {reports.length === 0 ? (
          <EmptyState title={t("noReportsGenerated")} description={t("reportsWillAppear")} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("document")}</th>
                  <th>{t("period")}</th>
                  <th>{t("client")}</th>
                  <th>{t("hours")}</th>
                  <th>{t("total")}</th>
                  <th>{t("details")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="font-medium text-ink">{report.report_number}</td>
                    <td>
                      {String(report.report_month).padStart(2, "0")}/{report.report_year}
                    </td>
                    <td>{report.clients?.client_name ?? t("all")}</td>
                    <td>{formatHours(report.total_hours)}</td>
                    <td>{formatWorkCurrency(report.total_amount, currency)}</td>
                    <td>
                      <Link className="inline-flex items-center gap-1 font-semibold text-jade-700 hover:text-jade-600" href={`/reports/${report.id}`}>
                        {t("open")} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
