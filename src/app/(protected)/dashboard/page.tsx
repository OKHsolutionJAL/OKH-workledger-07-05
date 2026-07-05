"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Banknote, BriefcaseBusiness, CalendarDays, Clock, Package, PlusCircle, ReceiptText, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingState } from "@/components/ui/loading-state";
import { StatCard } from "@/components/ui/stat-card";
import type { Profile, TimeEntry } from "@/lib/database.types";
import { formatDate, formatHours, getMonthRange } from "@/lib/format";
import { formatMonthYear, type Language } from "@/lib/i18n/translations";
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
  workEntryTitle,
  workEntryTypeLabels,
  type WorkEntryLike,
  type WorkEntryWithClient
} from "@/lib/work-entries";

type EntryWithSource = WorkEntryLike & {
  source_table: "work_entries" | "time_entries";
};

const dashboardText: Record<
  Language,
  {
    totalBilled: string;
    fixedServices: string;
    clientExpenses: string;
    businessExpenses: string;
    estimatedProfit: string;
    latest: string;
    addEntry: string;
    title: string;
    amount: string;
  }
> = {
  pt: {
    totalBilled: "Total faturado",
    fixedServices: "Servicos fechados",
    clientExpenses: "Despesas cobradas",
    businessExpenses: "Despesas internas",
    estimatedProfit: "Lucro estimado",
    latest: "Ultimos lançamentos",
    addEntry: "Adicionar lançamento",
    title: "Titulo",
    amount: "Valor"
  },
  ja: {
    totalBilled: "\u8acb\u6c42\u5bfe\u8c61\u5408\u8a08",
    fixedServices: "\u5b9a\u984d\u30b5\u30fc\u30d3\u30b9",
    clientExpenses: "\u7acb\u66ff\u7d4c\u8cbb",
    businessExpenses: "\u4e8b\u696d\u7d4c\u8cbb",
    estimatedProfit: "\u63a8\u5b9a\u5229\u76ca",
    latest: "\u6700\u65b0\u306e\u767b\u9332",
    addEntry: "\u767b\u9332\u3092\u8ffd\u52a0",
    title: "\u4ef6\u540d",
    amount: "\u91d1\u984d"
  },
  en: {
    totalBilled: "Total billed",
    fixedServices: "Fixed services",
    clientExpenses: "Client expenses",
    businessExpenses: "Business expenses",
    estimatedProfit: "Estimated profit",
    latest: "Latest entries",
    addEntry: "Add entry",
    title: "Title",
    amount: "Amount"
  }
};

function sortLatest(entries: EntryWithSource[]) {
  return entries.sort((a, b) => workEntryDate(b).localeCompare(workEntryDate(a))).slice(0, 6);
}

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const text = dashboardText[language];
  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [monthEntries, setMonthEntries] = useState<EntryWithSource[]>([]);
  const [latestEntries, setLatestEntries] = useState<EntryWithSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
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

        const { start, end } = getMonthRange(year, month);
        const [profileResult, monthLegacyResult, latestLegacyResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("time_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .gte("work_date", start)
            .lte("work_date", end)
            .order("work_date", { ascending: false }),
          supabase
            .from("time_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .order("work_date", { ascending: false })
            .limit(6)
        ]);

        if (profileResult.error) throw profileResult.error;
        if (monthLegacyResult.error) throw monthLegacyResult.error;
        if (latestLegacyResult.error) throw latestLegacyResult.error;

        const [monthWorkResult, latestWorkResult] = await Promise.all([
          supabase
            .from("work_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .gte("date", start)
            .lte("date", end)
            .order("date", { ascending: false }),
          supabase
            .from("work_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(6)
        ]);

        if (monthWorkResult.error && !isWorkEntryMissingTableError(monthWorkResult.error)) throw monthWorkResult.error;
        if (latestWorkResult.error && !isWorkEntryMissingTableError(latestWorkResult.error)) throw latestWorkResult.error;

        const workMonthEntries = monthWorkResult.error
          ? []
          : ((monthWorkResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
              ...entry,
              source_table: "work_entries" as const
            }));
        const workLatestEntries = latestWorkResult.error
          ? []
          : ((latestWorkResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
              ...entry,
              source_table: "work_entries" as const
            }));
        const legacyMonthEntries = ((monthLegacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map(
          (entry) => ({
            ...legacyTimeEntryToWorkEntry(entry),
            source_table: "time_entries" as const
          })
        );
        const legacyLatestEntries = ((latestLegacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map(
          (entry) => ({
            ...legacyTimeEntryToWorkEntry(entry),
            source_table: "time_entries" as const
          })
        );

        setProfile(profileResult.data);
        setMonthEntries([...workMonthEntries, ...legacyMonthEntries]);
        setLatestEntries(sortLatest([...workLatestEntries, ...legacyLatestEntries]));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("errorDashboardLoad"));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [month, t, year]);

  const totals = useMemo(() => summarizeWorkEntries(monthEntries), [monthEntries]);
  const currency = profile?.default_currency ?? "JPY";

  const totalsByClient = useMemo(() => {
    const grouped = new Map<string, { name: string; amount: number }>();

    for (const entry of monthEntries) {
      if (!entry.client_id) continue;
      const key = entry.client_id;
      const current = grouped.get(key) ?? {
        name: entry.clients?.client_name ?? t("removedClient"),
        amount: 0
      };

      current.amount += calculateWorkEntryAmount(entry);
      grouped.set(key, current);
    }

    return Array.from(grouped.values()).sort((a, b) => b.amount - a.amount);
  }, [monthEntries, t]);

  if (isLoading) return <LoadingState label={t("loadingPanel")} />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-jade-700">{formatMonthYear(language, month, year)}</p>
          <h2 className="page-title">{t("dashboardTitle")}</h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("dashboardDescription")}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jade-700"
            href="/timecard"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {text.addEntry}
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
            href="/reports"
          >
            {t("generateMonthlyReport")}
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard detail={t("currentMonthSum")} icon={<Banknote className="h-5 w-5" />} label={text.totalBilled} value={formatWorkCurrency(totals.totalBilled, currency)} />
        <StatCard detail={t("currentMonthSum")} icon={<Clock className="h-5 w-5" />} label={t("totalHours")} value={formatHours(totals.totalHours)} />
        <StatCard detail={t("uniqueDaysWithEntries")} icon={<CalendarDays className="h-5 w-5" />} label={t("workedDays")} value={String(totals.workedDays)} />
        <StatCard detail={t("activeClientsThisMonth")} icon={<BriefcaseBusiness className="h-5 w-5" />} label={t("activeClients")} value={String(totals.activeClients)} />
        <StatCard icon={<ReceiptText className="h-5 w-5" />} label={text.fixedServices} value={formatWorkCurrency(totals.fixedServices, currency)} />
        <StatCard icon={<Package className="h-5 w-5" />} label={text.clientExpenses} value={formatWorkCurrency(totals.clientExpenses, currency)} />
        <StatCard icon={<Package className="h-5 w-5" />} label={text.businessExpenses} value={formatWorkCurrency(totals.businessExpenses, currency)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label={text.estimatedProfit} value={formatWorkCurrency(totals.estimatedProfit, currency)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{t("totalByClient")}</h3>
          {totalsByClient.length === 0 ? (
            <EmptyState title={t("noDataThisMonth")} description={t("registerEntriesForClientTotals")} />
          ) : (
            <div className="grid gap-3">
              {totalsByClient.map((item) => (
                <div className="rounded-lg border border-line bg-white p-4" key={item.name}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <p className="font-semibold text-jade-700">{formatWorkCurrency(item.amount, currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section-panel grid gap-4">
          <h3 className="text-lg font-semibold text-ink">{text.latest}</h3>
          {latestEntries.length === 0 ? (
            <EmptyState title={t("noEntries")} description={t("useAddTimeEntryFirst")} />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("date")}</th>
                    <th>{t("client")}</th>
                    <th>{text.title}</th>
                    <th>{text.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {latestEntries.map((entry) => {
                    const type = normalizeWorkEntryType(entry.entry_type);
                    return (
                      <tr key={`${entry.source_table}-${entry.id}`}>
                        <td>{formatDate(workEntryDate(entry))}</td>
                        <td>{entry.clients?.client_name ?? (entry.client_id ? t("removedClient") : "-")}</td>
                        <td>
                          <span className="font-medium text-ink">{workEntryTypeLabels[language][type]}</span>
                          <span className="block text-xs text-zinc-500">{workEntryTitle(entry) || "-"}</span>
                        </td>
                        <td>{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency ?? currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
