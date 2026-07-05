import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { updatePlan } from "@/lib/admin/actions";
import type { Plan } from "@/lib/database.types";

const planFlags: Array<keyof Pick<
  Plan,
  | "can_use_japan_documents"
  | "can_use_australia_documents"
  | "can_use_expenses"
  | "can_use_materials"
  | "can_use_tax_export"
  | "can_use_support"
  | "can_use_courses"
  | "is_active"
>> = [
  "can_use_japan_documents",
  "can_use_australia_documents",
  "can_use_expenses",
  "can_use_materials",
  "can_use_tax_export",
  "can_use_support",
  "can_use_courses",
  "is_active"
];

export default async function AdminPlansPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("plans").select("*").order("price_jpy", { ascending: true });
  const plans = (data ?? []) as Plan[];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Planos</h2>
        <p className="mt-2 text-sm text-zinc-600">Planos Free, Starter, Pro e Business com precos, limites e modulos liberados.</p>
      </div>

      <section className="grid gap-4">
        {plans.map((plan) => (
          <form action={updatePlan} className="section-panel grid gap-4" key={plan.id}>
            <input name="plan_id" type="hidden" value={plan.id} />
            <div className="grid gap-4 md:grid-cols-4">
              <label className="grid gap-1 text-sm font-medium">
                Nome
                <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.name} name="name" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Preco JPY
                <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.price_jpy} name="price_jpy" type="number" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Preco AUD
                <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.price_aud} name="price_aud" type="number" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Ciclo
                <select className="rounded-md border border-line px-3 py-2" defaultValue={plan.billing_cycle} name="billing_cycle">
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="manual">manual</option>
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm font-medium">
              Descricao
              <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.description ?? ""} name="description" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">
                Maximo de clientes
                <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.max_clients} name="max_clients" type="number" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Maximo de lancamentos por mes
                <input className="rounded-md border border-line px-3 py-2" defaultValue={plan.max_entries_per_month} name="max_entries_per_month" type="number" />
              </label>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              {planFlags.map((flag) => (
                <label className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm" key={flag}>
                  <input defaultChecked={Boolean(plan[flag])} name={flag} type="checkbox" />
                  {flag}
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <Button type="submit">Salvar plano</Button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
