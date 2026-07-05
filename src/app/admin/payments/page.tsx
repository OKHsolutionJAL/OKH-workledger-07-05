import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { createManualPayment, updatePaymentStatus } from "@/lib/admin/actions";
import type { Payment, Plan, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

const paymentStatuses: Payment["status"][] = ["pending", "paid", "failed", "refunded", "cancelled", "manual"];

export default async function AdminPaymentsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: payments }, { data: users }, { data: plans }] = await Promise.all([
    supabase.from("payments").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, email, full_name, owner_name, business_name").order("created_at", { ascending: false }),
    supabase.from("plans").select("*").order("price_jpy", { ascending: true })
  ]);

  const userList = (users ?? []) as Pick<Profile, "id" | "email" | "full_name" | "owner_name" | "business_name">[];
  const planList = (plans ?? []) as Plan[];
  const userMap = new Map(userList.map((user) => [user.id, user]));
  const planMap = new Map(planList.map((plan) => [plan.id, plan]));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Pagamentos</h2>
        <p className="mt-2 text-sm text-zinc-600">Liste pagamentos e marque manualmente como pago, pendente ou cancelado.</p>
      </div>

      <form action={createManualPayment} className="section-panel grid gap-4">
        <h3 className="text-lg font-semibold text-ink">Adicionar pagamento manual</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <select className="rounded-md border border-line px-3 py-2" name="user_id" required>
            <option value="">Usuario</option>
            {userList.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.owner_name || user.email || user.id}
              </option>
            ))}
          </select>
          <select className="rounded-md border border-line px-3 py-2" name="plan_id">
            <option value="">Plano</option>
            {planList.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <input className="rounded-md border border-line px-3 py-2" name="amount" placeholder="Valor" required type="number" />
          <select className="rounded-md border border-line px-3 py-2" name="currency" defaultValue="JPY">
            <option value="JPY">JPY</option>
            <option value="AUD">AUD</option>
          </select>
          <select className="rounded-md border border-line px-3 py-2" name="status" defaultValue="pending">
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input className="rounded-md border border-line px-3 py-2" name="due_date" type="date" />
          <input className="rounded-md border border-line px-3 py-2" name="payment_method" placeholder="Metodo" />
          <input className="rounded-md border border-line px-3 py-2" name="notes" placeholder="Observacao" />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Adicionar</Button>
        </div>
      </form>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Vencimento</th>
                <th>Pago em</th>
                <th>Metodo</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((payments ?? []) as Payment[]).map((payment) => {
                const user = userMap.get(payment.user_id);
                const plan = payment.plan_id ? planMap.get(payment.plan_id) : null;
                return (
                  <tr key={payment.id}>
                    <td>{user?.full_name || user?.owner_name || user?.email || payment.user_id}</td>
                    <td>{plan?.name || "-"}</td>
                    <td>{formatWorkCurrency(payment.amount, payment.currency)}</td>
                    <td>{payment.status}</td>
                    <td>{payment.due_date || "-"}</td>
                    <td>{payment.paid_at?.slice(0, 10) || "-"}</td>
                    <td>{payment.payment_method || payment.billing_provider}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {(["paid", "pending", "cancelled"] as Payment["status"][]).map((status) => (
                          <form action={updatePaymentStatus} key={status}>
                            <input name="payment_id" type="hidden" value={payment.id} />
                            <input name="user_id" type="hidden" value={payment.user_id} />
                            <input name="status" type="hidden" value={status} />
                            <Button type="submit" variant="secondary">
                              {status}
                            </Button>
                          </form>
                        ))}
                      </div>
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
