import { requireAdmin } from "@/lib/admin/auth";
import type { Client, Profile, TimeEntry, WorkEntry } from "@/lib/database.types";
import { calculateEntryTotal } from "@/lib/calculations";
import { formatWorkCurrency } from "@/lib/work-entries";

export default async function AdminClientsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: clients }, { data: profiles }, { data: workEntries }, { data: timeEntries }] = await Promise.all([
    supabase.from("clients").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, full_name, owner_name, business_name"),
    supabase.from("work_entries").select("client_id, total_amount, date"),
    supabase.from("time_entries").select("*")
  ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as Pick<Profile, "id" | "email" | "full_name" | "owner_name" | "business_name">]));
  const stats = new Map<string, { count: number; total: number; lastActivity: string }>();

  for (const entry of (workEntries ?? []) as Pick<WorkEntry, "client_id" | "total_amount" | "date">[]) {
    if (!entry.client_id) continue;
    const current = stats.get(entry.client_id) ?? { count: 0, total: 0, lastActivity: "" };
    current.count += 1;
    current.total += Number(entry.total_amount || 0);
    current.lastActivity = current.lastActivity > entry.date ? current.lastActivity : entry.date;
    stats.set(entry.client_id, current);
  }

  for (const entry of (timeEntries ?? []) as TimeEntry[]) {
    if (!entry.client_id) continue;
    const current = stats.get(entry.client_id) ?? { count: 0, total: 0, lastActivity: "" };
    current.count += 1;
    current.total += calculateEntryTotal(entry);
    current.lastActivity = current.lastActivity > entry.work_date ? current.lastActivity : entry.work_date;
    stats.set(entry.client_id, current);
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Clientes das contas</h2>
        <p className="mt-2 text-sm text-zinc-600">Visao administrativa dos clientes cadastrados nas contas dos usuarios.</p>
      </div>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Dono da conta</th>
                <th>Pais</th>
                <th>Moeda</th>
                <th>Lancamentos</th>
                <th>Total faturado</th>
                <th>Ultima atividade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((clients ?? []) as Client[]).map((client) => {
                const owner = profileMap.get(client.user_id);
                const clientStats = stats.get(client.id) ?? { count: 0, total: 0, lastActivity: "" };
                return (
                  <tr key={client.id}>
                    <td>{client.client_name}</td>
                    <td>{client.company_name || "-"}</td>
                    <td>{owner?.full_name || owner?.owner_name || owner?.business_name || owner?.email || "-"}</td>
                    <td>{client.client_country}</td>
                    <td>{client.currency}</td>
                    <td>{clientStats.count}</td>
                    <td>{formatWorkCurrency(clientStats.total, client.currency)}</td>
                    <td>{clientStats.lastActivity || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
