import { CopyCompanyCode } from "@/components/client-portal/copy-company-code";
import { updateCompanyProfile } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";

export default async function ClientPortalCompanyProfilePage() {
  const { profile } = await requireClientCompany();
  const companyCode = profile.client_company_code || "Gerando ID...";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Dados da empresa cliente</p>
        <h2 className="page-title">Perfil do cliente/contratante</h2>
        <p className="mt-2 text-sm text-zinc-600">Mantenha os dados usados para busca, vinculo e identificacao da empresa.</p>
      </div>

      <section className="section-panel flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-zinc-500">Seu ID de cliente/contratante</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{companyCode}</p>
          <p className="mt-2 text-xs text-zinc-500">Compartilhe esse ID com o prestador para ele solicitar o vinculo com seguranca.</p>
        </div>
        {profile.client_company_code ? <CopyCompanyCode code={profile.client_company_code} /> : null}
      </section>

      <form action={updateCompanyProfile} className="section-panel grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Nome da empresa
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.company_name || profile.business_name || ""} name="company_name" required />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Responsavel
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.owner_name || profile.full_name || ""} name="owner_name" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            E-mail
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.email || ""} name="email" type="email" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Telefone
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.phone || ""} name="phone" placeholder="080-1234-5678" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700 md:col-span-2">
            Endereco
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.address || profile.business_address || ""} name="address" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Pais
            <select className="rounded-md border border-line px-3 py-2" defaultValue={profile.company_country || profile.country || "JP"} name="company_country">
              <option value="JP">Japao</option>
              <option value="AU">Australia</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Moeda
            <select className="rounded-md border border-line px-3 py-2" defaultValue={profile.default_currency || profile.currency || "JPY"} name="default_currency">
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            Registro fiscal Japao
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.invoice_registration_number || profile.japan_invoice_registration_number || ""} name="registration_number" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700">
            ABN Australia
            <input className="rounded-md border border-line px-3 py-2" defaultValue={profile.australia_abn || profile.abn || ""} name="abn" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-700 md:col-span-2">
            Observacoes internas
            <textarea className="min-h-28 rounded-md border border-line px-3 py-2" defaultValue={profile.notes || ""} name="notes" />
          </label>
        </div>

        <div className="flex justify-end">
          <button className="rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white hover:bg-jade-700" type="submit">
            Salvar dados da empresa
          </button>
        </div>
      </form>
    </div>
  );
}
