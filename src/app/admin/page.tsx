import { StatCard } from "@/components/ui/stat-card";
import { requireAdmin } from "@/lib/admin/auth";

async function countRows(query: PromiseLike<{ count: number | null }>) {
  const result = await query;
  return result.count ?? 0;
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [totalUsers, activeUsers, blockedUsers, freePlans, paidPlans, pendingPayments, openTickets, totalExports] = await Promise.all([
    countRows(supabase.from("profiles").select("*", { count: "exact", head: true })),
    countRows(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("account_status", "active")),
    countRows(supabase.from("profiles").select("*", { count: "exact", head: true }).in("account_status", ["blocked", "suspended"])),
    countRows(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "free")),
    countRows(supabase.from("profiles").select("*", { count: "exact", head: true }).in("subscription_status", ["active", "manual"])),
    countRows(supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending")),
    countRows(supabase.from("support_tickets").select("*", { count: "exact", head: true }).in("status", ["open", "in_review"])),
    countRows(supabase.from("external_exports").select("*", { count: "exact", head: true }))
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">OKH WorkLedger Admin</p>
        <h2 className="page-title">Visao geral</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          Controle administrativo de usuarios, planos, mensalidades, pagamentos, suporte, modulos e exportacoes para declaracao.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de usuarios" value={String(totalUsers)} />
        <StatCard label="Usuarios ativos" value={String(activeUsers)} />
        <StatCard label="Usuarios bloqueados" value={String(blockedUsers)} />
        <StatCard label="Planos gratis" value={String(freePlans)} />
        <StatCard label="Planos pagos" value={String(paidPlans)} />
        <StatCard label="Pagamentos pendentes" value={String(pendingPayments)} />
        <StatCard label="Tickets abertos" value={String(openTickets)} />
        <StatCard label="Exportacoes para declaracao" value={String(totalExports)} />
      </section>
    </div>
  );
}
