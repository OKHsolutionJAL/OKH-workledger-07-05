"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { DocumentGenerator } from "@/components/documents/document-generator";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import { calculateEntryTotal, calculateNetHours, summarizeEntries } from "@/lib/calculations";
import type { Client, MonthlyReport, Profile, TimeEntry } from "@/lib/database.types";
import { formatCurrency, formatDate, formatHours, getMonthRange } from "@/lib/format";
import { formatMonthYear } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type EntryWithClient = TimeEntry & {
  clients: Pick<Client, "client_name" | "client_name_jp"> | null;
};

type ReportWithClient = MonthlyReport & {
  clients: Pick<Client, "client_name" | "client_name_jp"> | null;
};

export default function ReportDetailPage() {
  const { language, t } = useLanguage();
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<ReportWithClient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [entries, setEntries] = useState<EntryWithClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totals = useMemo(() => summarizeEntries(entries), [entries]);

  useEffect(() => {
    async function loadReport() {
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

        const reportResult = await supabase
          .from("monthly_reports")
          .select("*, clients(client_name, client_name_jp)")
          .eq("id", reportId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (reportResult.error) throw reportResult.error;
        if (!reportResult.data) throw new Error(t("reportNotFound"));

        const loadedReport = reportResult.data as ReportWithClient;
        const { start, end } = getMonthRange(loadedReport.report_year, loadedReport.report_month);

        let entriesQuery = supabase
          .from("time_entries")
          .select("*, clients(client_name, client_name_jp)")
          .eq("user_id", user.id)
          .gte("work_date", start)
          .lte("work_date", end)
          .order("work_date", { ascending: true });

        if (loadedReport.client_id) entriesQuery = entriesQuery.eq("client_id", loadedReport.client_id);

        const [profileResult, clientResult, entriesResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          loadedReport.client_id
            ? supabase.from("clients").select("*").eq("id", loadedReport.client_id).eq("user_id", user.id).maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          entriesQuery
        ]);

        if (profileResult.error) throw profileResult.error;
        if (clientResult.error) throw clientResult.error;
        if (entriesResult.error) throw entriesResult.error;

        setReport(loadedReport);
        setProfile(profileResult.data);
        setClient(clientResult.data);
        setEntries((entriesResult.data ?? []) as EntryWithClient[]);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("errorReportOpen"));
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [reportId, t]);

  if (isLoading) return <LoadingState label={t("loading")} />;

  if (!report) {
    return (
      <div className="grid gap-4">
        <ErrorMessage message={error} />
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-jade-700" href="/reports">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("backToReports")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-jade-700" href="/reports">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("backToReports")}
          </Link>
          <p className="text-sm font-semibold text-jade-700">
            {t("document")} {report.report_number}
          </p>
          <h2 className="page-title">{formatMonthYear(language, report.report_month, report.report_year)}</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {t("client")}: {report.clients?.client_name ?? t("allClients")}
          </p>
        </div>
        <DocumentGenerator
          client={client}
          clients={client ? [client] : []}
          entries={entries}
          month={report.report_month}
          onError={(message) => setError(message || null)}
          onSuccess={setSuccess}
          profile={profile}
          sequence={1}
          year={report.report_year}
        />
      </div>

      <ErrorMessage message={error} />
      {success ? <div className="rounded-md border border-jade-100 bg-jade-50 px-4 py-3 text-sm text-jade-700">{success}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("reportDays")} value={String(totals.totalDays)} />
        <StatCard label={t("recalculatedHours")} value={formatHours(totals.totalHours)} />
        <StatCard label={t("registeredTotal")} value={formatCurrency(report.total_amount)} />
        <StatCard label={t("recalculatedTotal")} value={formatCurrency(totals.totalAmount)} />
      </section>

      {entries.length === 0 ? (
        <EmptyState title={t("noLinkedEntries")} description={t("originalEntriesChanged")} />
      ) : (
        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{t("entriesUsedInDocument")}</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("client")}</th>
                  <th>{t("local")}</th>
                  <th>{t("schedule")}</th>
                  <th>{t("hours")}</th>
                  <th>{t("total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.work_date)}</td>
                    <td>{entry.clients?.client_name ?? t("removedClient")}</td>
                    <td>{entry.site_name || "-"}</td>
                    <td>
                      {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                    </td>
                    <td>{formatHours(calculateNetHours(entry.start_time, entry.end_time, entry.break_minutes))}</td>
                    <td>{formatCurrency(calculateEntryTotal(entry))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
