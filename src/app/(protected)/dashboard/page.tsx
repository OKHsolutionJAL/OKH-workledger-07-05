"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  FileText,
  Package,
  PlusCircle,
  ReceiptText,
  RefreshCcw,
  TrendingUp
} from "lucide-react";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ClientOverviewCard, type ClientOverview } from "@/components/dashboard/client-overview-card";
import { ClientRevenueDonutChart } from "@/components/dashboard/client-revenue-donut-chart";
import type { ChartDatum, HoursDatum, MonthlyRevenueDatum } from "@/components/dashboard/chart-utils";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ExpensesByCategoryChart } from "@/components/dashboard/expenses-by-category-chart";
import { HoursWorkedChart } from "@/components/dashboard/hours-worked-chart";
import { MonthlyRevenueChart } from "@/components/dashboard/monthly-revenue-chart";
import { RecentEntriesCard } from "@/components/dashboard/recent-entries-card";
import { ServiceStatusChart, type ServiceStatusDatum } from "@/components/dashboard/service-status-chart";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { StatCard } from "@/components/ui/stat-card";
import type { Client, Profile, TimeEntry } from "@/lib/database.types";
import { formatHours, getMonthRange } from "@/lib/format";
import { formatMonthYear, type Language } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  calculateWorkEntryAmount,
  calculateWorkEntryHours,
  formatWorkCurrency,
  isWorkEntryMissingTableError,
  legacyTimeEntryToWorkEntry,
  normalizeWorkEntryType,
  summarizeWorkEntries,
  workEntryDate,
  workEntryTitle,
  type WorkEntryLike,
  type WorkEntryWithClient
} from "@/lib/work-entries";

type EntryWithSource = WorkEntryLike & {
  source_table: "work_entries" | "time_entries";
};

type DashboardClient = Pick<Client, "id" | "client_name" | "client_name_jp" | "created_at">;

const monthLabels: Record<Language, string[]> = {
  pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  ja: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

const dashboardText: Record<
  Language,
  {
    totalBilled: string;
    fixedServices: string;
    clientExpenses: string;
    businessExpenses: string;
    estimatedProfit: string;
    addEntry: string;
    monthlyRevenue: string;
    monthlyRevenueDescription: string;
    clientTotals: string;
    expensesByCategory: string;
    hoursWorked: string;
    serviceStatus: string;
    analytics: string;
    analyticsDescription: string;
    noRevenue: string;
    noClientTotals: string;
    noExpenses: string;
    noHours: string;
    noServices: string;
    emptyChart: string;
    retry: string;
    pending: string;
    inProgress: string;
    completed: string;
    cancelled: string;
  }
> = {
  pt: {
    totalBilled: "Total faturado",
    fixedServices: "Servicos fechados",
    clientExpenses: "Despesas cobradas",
    businessExpenses: "Despesas internas",
    estimatedProfit: "Lucro estimado",
    addEntry: "Adicionar lancamento",
    monthlyRevenue: "Faturamento mensal",
    monthlyRevenueDescription: "Faturamento e lucro estimado por mes no ano atual.",
    clientTotals: "Total por cliente",
    expensesByCategory: "Despesas por categoria",
    hoursWorked: "Horas trabalhadas",
    serviceStatus: "Status dos servicos",
    analytics: "Indicadores do mes",
    analyticsDescription: "Graficos gerados com os lancamentos existentes.",
    noRevenue: "Nenhum dado de faturamento registrado ainda.",
    noClientTotals: "Registre lancamentos para ver totais por cliente.",
    noExpenses: "Nenhuma despesa registrada neste mes.",
    noHours: "Nenhuma hora registrada neste mes.",
    noServices: "Nenhum servico registrado ainda.",
    emptyChart: "Nenhum dado registrado neste periodo.",
    retry: "Tentar novamente",
    pending: "Pendente",
    inProgress: "Em andamento",
    completed: "Concluido",
    cancelled: "Cancelado"
  },
  ja: {
    totalBilled: "請求対象合計",
    fixedServices: "定額サービス",
    clientExpenses: "立替経費",
    businessExpenses: "事業経費",
    estimatedProfit: "推定利益",
    addEntry: "登録を追加",
    monthlyRevenue: "月別売上",
    monthlyRevenueDescription: "今年の売上と推定利益。",
    clientTotals: "取引先別合計",
    expensesByCategory: "経費カテゴリ",
    hoursWorked: "作業時間",
    serviceStatus: "サービス状況",
    analytics: "月次指標",
    analyticsDescription: "登録済みデータから作成したグラフです。",
    noRevenue: "売上データはまだありません。",
    noClientTotals: "登録すると取引先別合計が表示されます。",
    noExpenses: "今月の経費はありません。",
    noHours: "今月の作業時間はありません。",
    noServices: "サービス登録はまだありません。",
    emptyChart: "この期間のデータはありません。",
    retry: "再試行",
    pending: "保留",
    inProgress: "進行中",
    completed: "完了",
    cancelled: "取消"
  },
  en: {
    totalBilled: "Total billed",
    fixedServices: "Fixed services",
    clientExpenses: "Client expenses",
    businessExpenses: "Business expenses",
    estimatedProfit: "Estimated profit",
    addEntry: "Add entry",
    monthlyRevenue: "Monthly revenue",
    monthlyRevenueDescription: "Revenue and estimated profit by month this year.",
    clientTotals: "Total by client",
    expensesByCategory: "Expenses by category",
    hoursWorked: "Hours worked",
    serviceStatus: "Service status",
    analytics: "Monthly indicators",
    analyticsDescription: "Charts generated from existing entries.",
    noRevenue: "No revenue data registered yet.",
    noClientTotals: "Add entries to see totals by client.",
    noExpenses: "No expenses registered this month.",
    noHours: "No hours registered this month.",
    noServices: "No services registered yet.",
    emptyChart: "No data registered in this period.",
    retry: "Try again",
    pending: "Pending",
    inProgress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled"
  }
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortLatest(entries: EntryWithSource[]) {
  return [...entries].sort((a, b) => workEntryDate(b).localeCompare(workEntryDate(a))).slice(0, 8);
}

function entryMonth(entry: WorkEntryLike) {
  const date = workEntryDate(entry);
  if (!date) return -1;
  return Number(date.slice(5, 7)) - 1;
}

function isDateBetween(value: string | null | undefined, start: string, end: string) {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= start && date <= end;
}

function isBusinessExpense(entry: WorkEntryLike) {
  const type = normalizeWorkEntryType(entry.entry_type);
  return type === "business_expense" || entry.is_business_expense || entry.is_billable === false;
}

function buildMonthlyRevenueData(entries: WorkEntryLike[], language: Language): MonthlyRevenueDatum[] {
  const labels = monthLabels[language];
  const buckets = labels.map((label) => ({ label, revenue: 0, profit: 0, businessExpense: 0 }));

  for (const entry of entries) {
    const monthIndex = entryMonth(entry);
    if (monthIndex < 0 || monthIndex > 11) continue;

    const amount = calculateWorkEntryAmount(entry);
    if (isBusinessExpense(entry)) {
      buckets[monthIndex].businessExpense += Math.abs(amount);
    } else {
      buckets[monthIndex].revenue += amount;
    }
  }

  return buckets.map((item) => ({
    label: item.label,
    revenue: Number(item.revenue.toFixed(2)),
    profit: Number((item.revenue - item.businessExpense).toFixed(2))
  }));
}

function buildClientRevenueData(entries: WorkEntryLike[], fallbackClient: string): ChartDatum[] {
  const grouped = new Map<string, ChartDatum>();

  for (const entry of entries) {
    if (isBusinessExpense(entry)) continue;
    const key = entry.client_id ?? "no-client";
    const name = entry.clients?.client_name ?? (entry.client_id ? fallbackClient : "Sem cliente");
    const current = grouped.get(key) ?? { label: name, value: 0 };
    current.value += calculateWorkEntryAmount(entry);
    grouped.set(key, current);
  }

  const sorted = Array.from(grouped.values())
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if (sorted.length <= 5) return sorted;

  const main = sorted.slice(0, 4);
  const other = sorted.slice(4).reduce((sum, item) => sum + item.value, 0);
  return [...main, { label: "Outros", value: Number(other.toFixed(2)) }];
}

function addExpense(grouped: Map<string, ChartDatum>, label: string, amount: number) {
  if (amount <= 0) return;
  const current = grouped.get(label) ?? { label, value: 0 };
  current.value += amount;
  grouped.set(label, current);
}

function buildExpenseCategoryData(entries: WorkEntryLike[]): ChartDatum[] {
  const grouped = new Map<string, ChartDatum>();

  for (const entry of entries) {
    const type = normalizeWorkEntryType(entry.entry_type);
    const title = workEntryTitle(entry) || "Outros";

    if (type === "client_expense" || type === "business_expense") {
      addExpense(grouped, title, Math.abs(calculateWorkEntryAmount(entry)));
    }

    if (type === "material") {
      addExpense(grouped, "Material de trabalho", Math.abs(calculateWorkEntryAmount(entry)));
    }

    if (type === "hourly_work") {
      addExpense(grouped, "Gasolina", numberValue(entry.fuel_amount));
      addExpense(grouped, "Pedagio", numberValue(entry.toll_amount));
      addExpense(grouped, "Outros", numberValue(entry.expense_amount));
    }
  }

  return Array.from(grouped.values())
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function buildHoursData(entries: WorkEntryLike[], year: number, month: number): HoursDatum[] {
  const days = new Date(year, month, 0).getDate();
  const buckets = Array.from({ length: days }, (_, index) => ({ label: String(index + 1).padStart(2, "0"), hours: 0 }));

  for (const entry of entries) {
    const date = workEntryDate(entry);
    if (!date) continue;
    const day = Number(date.slice(8, 10));
    if (day >= 1 && day <= days) buckets[day - 1].hours += calculateWorkEntryHours(entry);
  }

  return buckets.map((item) => ({ ...item, hours: Number(item.hours.toFixed(2)) }));
}

function serviceStatusKey(entry: WorkEntryLike): ServiceStatusDatum["key"] {
  if (entry.status === "cancelled") return "cancelled";
  if (entry.status === "paid" || entry.status === "invoiced") return "completed";
  if (entry.status === "billable") return "in_progress";
  return "pending";
}

function buildServiceStatusData(entries: WorkEntryLike[], text: (typeof dashboardText)[Language]): ServiceStatusDatum[] {
  const status: ServiceStatusDatum[] = [
    { key: "pending", label: text.pending, value: 0 },
    { key: "in_progress", label: text.inProgress, value: 0 },
    { key: "completed", label: text.completed, value: 0 },
    { key: "cancelled", label: text.cancelled, value: 0 }
  ];

  for (const entry of entries) {
    const key = serviceStatusKey(entry);
    const item = status.find((statusItem) => statusItem.key === key);
    if (item) item.value += 1;
  }

  return status;
}

function buildClientOverview(clients: DashboardClient[], entries: WorkEntryLike[], totalBilled: number, start: string, end: string): ClientOverview {
  const activeClientIds = new Set(entries.map((entry) => entry.client_id).filter(Boolean));
  const activeClients = activeClientIds.size;
  const newClients = clients.filter((client) => isDateBetween(client.created_at, start, end)).length;

  return {
    totalClients: clients.length,
    newClients,
    activeClients,
    inactiveClients: Math.max(clients.length - activeClients, 0),
    averageTicket: activeClients ? Number((totalBilled / activeClients).toFixed(2)) : 0
  };
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="h-36 animate-pulse rounded-lg bg-white shadow-soft" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="h-32 animate-pulse rounded-lg bg-white shadow-soft" key={index} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-white shadow-soft" />
        <div className="h-80 animate-pulse rounded-lg bg-white shadow-soft" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const text = dashboardText[language];
  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [yearEntries, setYearEntries] = useState<EntryWithSource[]>([]);
  const [latestEntries, setLatestEntries] = useState<EntryWithSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

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

        const yearStart = `${year}-01-01`;
        const yearEnd = `${year}-12-31`;
        const [profileResult, clientsResult, yearLegacyResult, latestLegacyResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("clients").select("id, client_name, client_name_jp, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase
            .from("time_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .gte("work_date", yearStart)
            .lte("work_date", yearEnd)
            .order("work_date", { ascending: false }),
          supabase
            .from("time_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .order("work_date", { ascending: false })
            .limit(8)
        ]);

        if (profileResult.error) throw profileResult.error;
        if (clientsResult.error) throw clientsResult.error;
        if (yearLegacyResult.error) throw yearLegacyResult.error;
        if (latestLegacyResult.error) throw latestLegacyResult.error;

        const [yearWorkResult, latestWorkResult] = await Promise.all([
          supabase
            .from("work_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .gte("date", yearStart)
            .lte("date", yearEnd)
            .order("date", { ascending: false }),
          supabase
            .from("work_entries")
            .select("*, clients(client_name, client_name_jp, hourly_rate)")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(8)
        ]);

        if (yearWorkResult.error && !isWorkEntryMissingTableError(yearWorkResult.error)) throw yearWorkResult.error;
        if (latestWorkResult.error && !isWorkEntryMissingTableError(latestWorkResult.error)) throw latestWorkResult.error;

        const workYearEntries = yearWorkResult.error
          ? []
          : ((yearWorkResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
              ...entry,
              source_table: "work_entries" as const
            }));
        const workLatestEntries = latestWorkResult.error
          ? []
          : ((latestWorkResult.data ?? []) as WorkEntryWithClient[]).map((entry) => ({
              ...entry,
              source_table: "work_entries" as const
            }));
        const legacyYearEntries = ((yearLegacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map((entry) => ({
          ...legacyTimeEntryToWorkEntry(entry),
          source_table: "time_entries" as const
        }));
        const legacyLatestEntries = ((latestLegacyResult.data ?? []) as Array<TimeEntry & { clients?: EntryWithSource["clients"] }>).map((entry) => ({
          ...legacyTimeEntryToWorkEntry(entry),
          source_table: "time_entries" as const
        }));

        setProfile(profileResult.data as Profile | null);
        setClients((clientsResult.data ?? []) as DashboardClient[]);
        setYearEntries([...workYearEntries, ...legacyYearEntries]);
        setLatestEntries(sortLatest([...workLatestEntries, ...legacyLatestEntries]));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : t("errorDashboardLoad"));
        setClients([]);
        setYearEntries([]);
        setLatestEntries([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [reloadKey, t, year]);

  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthRange(year, month), [month, year]);
  const monthEntries = useMemo(() => yearEntries.filter((entry) => isDateBetween(workEntryDate(entry), monthStart, monthEnd)), [monthEnd, monthStart, yearEntries]);
  const totals = useMemo(() => summarizeWorkEntries(monthEntries), [monthEntries]);
  const currency = profile?.default_currency ?? profile?.currency ?? "JPY";
  const monthlyRevenueData = useMemo(() => buildMonthlyRevenueData(yearEntries, language), [language, yearEntries]);
  const clientRevenueData = useMemo(() => buildClientRevenueData(monthEntries, t("removedClient")), [monthEntries, t]);
  const expenseCategoryData = useMemo(() => buildExpenseCategoryData(monthEntries), [monthEntries]);
  const hoursWorkedData = useMemo(() => buildHoursData(monthEntries, year, month), [month, monthEntries, year]);
  const serviceStatusData = useMemo(() => buildServiceStatusData(monthEntries, text), [monthEntries, text]);
  const clientOverview = useMemo(() => buildClientOverview(clients, monthEntries, totals.totalBilled, monthStart, monthEnd), [clients, monthEnd, monthEntries, monthStart, totals.totalBilled]);
  const hasRevenueData = monthlyRevenueData.some((item) => item.revenue > 0 || item.profit > 0);
  const hasHoursData = hoursWorkedData.some((item) => item.hours > 0);
  const hasStatusData = serviceStatusData.some((item) => item.value > 0);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#DDE3EA] bg-white p-4 shadow-soft sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#FF6A00]">{formatMonthYear(language, month, year)}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-[#0B132B] sm:text-3xl">{t("dashboardTitle")}</h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600">{t("dashboardDescription")}</p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#FF6A00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E55F00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00] focus-visible:ring-offset-2"
              href="/timecard"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              {text.addEntry}
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#C9D2DE] bg-white px-4 py-2 text-sm font-semibold text-[#0B132B] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] focus-visible:ring-offset-2"
              href="/reports"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              {t("generateMonthlyReport")}
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <div className="grid gap-3">
          <ErrorMessage message={error} />
          <Button className="w-fit bg-[#1E3A8A] hover:bg-[#172F70]" type="button" onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {text.retry}
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="orange" detail={t("currentMonthSum")} icon={<Banknote className="h-5 w-5" />} label={text.totalBilled} value={formatWorkCurrency(totals.totalBilled, currency)} />
        <StatCard accent="blue" detail={t("currentMonthSum")} icon={<Clock className="h-5 w-5" />} label={t("totalHours")} value={formatHours(totals.totalHours)} />
        <StatCard accent="blue" detail={t("uniqueDaysWithEntries")} icon={<CalendarDays className="h-5 w-5" />} label={t("workedDays")} value={String(totals.workedDays)} />
        <StatCard accent="green" detail={t("activeClientsThisMonth")} icon={<BriefcaseBusiness className="h-5 w-5" />} label={t("activeClients")} value={String(totals.activeClients)} />
        <StatCard accent="blue" icon={<ReceiptText className="h-5 w-5" />} label={text.fixedServices} value={formatWorkCurrency(totals.fixedServices, currency)} />
        <StatCard accent="orange" icon={<Package className="h-5 w-5" />} label={text.clientExpenses} value={formatWorkCurrency(totals.clientExpenses, currency)} />
        <StatCard accent="gray" icon={<Package className="h-5 w-5" />} label={text.businessExpenses} value={formatWorkCurrency(totals.businessExpenses, currency)} />
        <StatCard accent="green" icon={<TrendingUp className="h-5 w-5" />} label={text.estimatedProfit} value={formatWorkCurrency(totals.estimatedProfit, currency)} />
      </section>

      <DashboardSection description={text.analyticsDescription} title={text.analytics}>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard className="xl:col-span-2" description={text.monthlyRevenueDescription} emptyDescription={text.noRevenue} emptyTitle={text.emptyChart} isEmpty={!hasRevenueData} title={text.monthlyRevenue}>
            <MonthlyRevenueChart currency={currency} data={monthlyRevenueData} />
          </ChartCard>

          <ChartCard emptyDescription={text.noClientTotals} emptyTitle={t("noDataThisMonth")} isEmpty={clientRevenueData.length === 0} title={text.clientTotals}>
            <ClientRevenueDonutChart currency={currency} data={clientRevenueData} />
          </ChartCard>

          <ChartCard emptyDescription={text.noExpenses} emptyTitle={text.emptyChart} isEmpty={expenseCategoryData.length === 0} title={text.expensesByCategory}>
            <ExpensesByCategoryChart currency={currency} data={expenseCategoryData} />
          </ChartCard>

          <ChartCard emptyDescription={text.noHours} emptyTitle={text.emptyChart} isEmpty={!hasHoursData} title={text.hoursWorked}>
            <HoursWorkedChart data={hoursWorkedData} />
          </ChartCard>

          <ChartCard emptyDescription={text.noServices} emptyTitle={text.emptyChart} isEmpty={!hasStatusData} title={text.serviceStatus}>
            <ServiceStatusChart data={serviceStatusData} />
          </ChartCard>
        </div>
      </DashboardSection>

      <ClientOverviewCard currency={currency} data={clientOverview} />

      <RecentEntriesCard currency={currency} emptyDescription={t("useAddTimeEntryFirst")} emptyTitle={t("noEntries")} entries={latestEntries} language={language} />
    </div>
  );
}
