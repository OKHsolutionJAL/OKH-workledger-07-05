import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/auth";
import { updateAdminSettings } from "@/lib/admin/actions";
import type { AdminSettings } from "@/lib/database.types";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("admin_settings").select("*").limit(1).maybeSingle();
  const settings = data as AdminSettings | null;

  if (!settings) {
    return <div className="section-panel text-sm text-zinc-600">Execute o schema.sql para criar admin_settings.</div>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Admin</p>
        <h2 className="page-title">Configuracoes gerais</h2>
        <p className="mt-2 text-sm text-zinc-600">Defina configuracoes comerciais do SaaS.</p>
      </div>

      <form action={updateAdminSettings} className="section-panel grid gap-4">
        <input name="settings_id" type="hidden" value={settings.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            Nome do sistema
            <input className="rounded-md border border-line px-3 py-2" defaultValue={settings.system_name} name="system_name" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            E-mail de suporte
            <input className="rounded-md border border-line px-3 py-2" defaultValue={settings.support_email ?? ""} name="support_email" type="email" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Pais padrao
            <select className="rounded-md border border-line px-3 py-2" defaultValue={settings.default_market} name="default_market">
              <option value="JP">Japan</option>
              <option value="AU">Australia</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Moeda padrao
            <select className="rounded-md border border-line px-3 py-2" defaultValue={settings.default_currency} name="default_currency">
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Limite gratuito
            <input className="rounded-md border border-line px-3 py-2" defaultValue={settings.free_trial_days} name="free_trial_days" type="number" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Dias de teste
            <input className="rounded-md border border-line px-3 py-2" defaultValue={settings.trial_days} name="trial_days" type="number" />
          </label>
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Mensagem de bloqueio por pagamento
          <textarea className="min-h-28 rounded-md border border-line px-3 py-2" defaultValue={settings.payment_block_message} name="payment_block_message" />
        </label>
        <div className="flex justify-end">
          <Button type="submit">Salvar configuracoes</Button>
        </div>
      </form>
    </div>
  );
}
