import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { updateUserAdmin } from "@/lib/admin/actions";
import type { Plan, Profile } from "@/lib/database.types";

const roles: Profile["role"][] = ["admin", "client", "support", "accountant"];
const accountStatuses: Profile["account_status"][] = ["active", "blocked", "suspended", "trial"];
const subscriptionStatuses: Profile["subscription_status"][] = ["free", "trial", "active", "past_due", "cancelled", "manual"];

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: users }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("plans").select("*").order("price_jpy", { ascending: true })
  ]);

  const planList = (plans ?? []) as Plan[];
  const planMap = new Map(planList.map((plan) => [plan.id, plan.name]));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Usuarios</h2>
        <p className="mt-2 text-sm text-zinc-600">Liste usuarios, altere role, bloqueie/desbloqueie contas e mude planos manualmente.</p>
      </div>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Plano</th>
                <th>Status da conta</th>
                <th>Status assinatura</th>
                <th>Mercado</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((users ?? []) as Profile[]).map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="font-semibold text-ink">{user.full_name || user.owner_name || user.business_name || "-"}</span>
                    <span className="block max-w-48 truncate text-xs text-zinc-500">{user.id}</span>
                  </td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role}</td>
                  <td>{user.plan_id ? planMap.get(user.plan_id) ?? user.plan_id : "Sem plano"}</td>
                  <td>{user.account_status}</td>
                  <td>{user.subscription_status}</td>
                  <td>
                    {user.market || user.country} / {user.currency || user.default_currency}
                  </td>
                  <td>
                    <form action={updateUserAdmin} className="grid min-w-[560px] gap-2">
                      <input name="user_id" type="hidden" value={user.id} />
                      <div className="grid gap-2 md:grid-cols-4">
                        <select className="rounded-md border border-line bg-white px-2 py-2 text-sm" defaultValue={user.role} name="role">
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <select className="rounded-md border border-line bg-white px-2 py-2 text-sm" defaultValue={user.plan_id ?? ""} name="plan_id">
                          <option value="">Sem plano</option>
                          {planList.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <select className="rounded-md border border-line bg-white px-2 py-2 text-sm" defaultValue={user.account_status} name="account_status">
                          {accountStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <select className="rounded-md border border-line bg-white px-2 py-2 text-sm" defaultValue={user.subscription_status} name="subscription_status">
                          {subscriptionStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" variant="secondary">
                          Salvar
                        </Button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
