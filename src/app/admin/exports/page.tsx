import { requireAdmin } from "@/lib/admin/auth";
import type { ExternalExport, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

export default async function AdminExportsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: exports }, { data: users }] = await Promise.all([
    supabase.from("external_exports").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, full_name, owner_name, business_name")
  ]);

  const userMap = new Map(
    ((users ?? []) as Pick<Profile, "id" | "email" | "full_name" | "owner_name" | "business_name">[]).map((user) => [user.id, user])
  );

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Exportacoes para declaracao</h2>
        <p className="mt-2 text-sm text-zinc-600">Lista os dados enviados para declaracao por usuario, cliente, mes e ano.</p>
      </div>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Cliente</th>
                <th>Mes/Ano</th>
                <th>Mercado</th>
                <th>Moeda</th>
                <th>Bruto</th>
                <th>Imposto</th>
                <th>Liquido</th>
                <th>Status</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((exports ?? []) as ExternalExport[]).map((item) => {
                const user = userMap.get(item.user_id);
                return (
                  <tr key={item.id}>
                    <td>{user?.full_name || user?.owner_name || user?.email || item.user_id}</td>
                    <td>{item.client_company_name || item.client_name || "-"}</td>
                    <td>
                      {String(item.period_month).padStart(2, "0")}/{item.period_year}
                    </td>
                    <td>{item.market}</td>
                    <td>{item.currency}</td>
                    <td>{formatWorkCurrency(item.gross_amount, item.currency)}</td>
                    <td>{formatWorkCurrency(item.tax_amount, item.currency)}</td>
                    <td>{formatWorkCurrency(item.net_amount, item.currency)}</td>
                    <td>{item.status}</td>
                    <td>
                      <details>
                        <summary className="cursor-pointer font-semibold text-jade-700">Ver JSON</summary>
                        <pre className="mt-2 max-h-64 max-w-xl overflow-auto rounded-md bg-ink p-3 text-xs text-white">
                          {JSON.stringify(item.payload, null, 2)}
                        </pre>
                      </details>
                    </td>
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
