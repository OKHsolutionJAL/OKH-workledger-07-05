import { requestContractorRelationship } from "@/lib/client-portal/actions";
import { requireWorker } from "@/lib/client-portal/auth";
import { maskEmail, maskPhone, profileDisplayName } from "@/lib/client-portal/utils";
import type { ContractorRelationship, Profile } from "@/lib/database.types";

type SearchParams = Promise<{ q?: string }>;

export default async function WorkerContractorsPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = (await searchParams) ?? {};
  const query = String(params.q ?? "").trim();
  const { supabase, user } = await requireWorker();

  const [{ data: relationships }, searchResult] = await Promise.all([
    supabase.from("contractor_relationships").select("*").eq("worker_user_id", user.id).order("created_at", { ascending: false }),
    query ? supabase.rpc("search_client_companies", { search_term: query }) : Promise.resolve({ data: [], error: null })
  ]);

  const relationshipRows = (relationships ?? []) as ContractorRelationship[];
  const companyIds = [...new Set(relationshipRows.map((item) => item.client_company_id))];
  const { data: companies } = companyIds.length
    ? await supabase.from("profiles").select("*").in("id", companyIds)
    : { data: [] as Profile[] };
  const companyMap = new Map(((companies ?? []) as Profile[]).map((company) => [company.id, company]));

  const activeRelationships = relationshipRows.filter((item) => item.status === "active");
  const pendingRelationships = relationshipRows.filter((item) => item.status === "pending");
  const results = searchResult.data ?? [];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">OKH WorkLedger</p>
        <h2 className="page-title">Clientes / Contratantes</h2>
        <p className="mt-2 text-sm text-zinc-600">Busque a empresa cliente por ID, nome, telefone ou e-mail e solicite um vinculo seguro.</p>
      </div>

      <section className="section-panel grid gap-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/contractors">
          <input
            className="min-h-11 rounded-md border border-line px-3 py-2"
            defaultValue={query}
            name="q"
            placeholder="Buscar por ID, nome, telefone ou e-mail"
          />
          <button className="rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white hover:bg-jade-700" type="submit">
            Buscar cliente/contratante
          </button>
        </form>

        {query ? (
          <div className="grid gap-3">
            <h3 className="text-sm font-semibold text-ink">Resultados da busca</h3>
            {results.length === 0 ? <p className="text-sm text-zinc-500">Nenhum cliente/contratante encontrado.</p> : null}
            {results.map((company) => {
              const status = company.relationship_status;
              const isBlocked = status === "pending" || status === "active";
              return (
                <div className="rounded-lg border border-line bg-white p-4" key={company.id}>
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="font-semibold text-ink">{company.company_name || "Empresa sem nome"}</p>
                      <p className="text-xs text-zinc-500">ID: {company.client_company_code || "-"}</p>
                      <p className="text-xs text-zinc-500">Pais: {company.country || "-"}</p>
                      <p className="text-xs text-zinc-500">Telefone: {company.masked_phone || "-"}</p>
                      <p className="text-xs text-zinc-500">E-mail: {company.masked_email || "-"}</p>
                    </div>
                    <form action={requestContractorRelationship}>
                      <input name="client_company_id" type="hidden" value={company.id} />
                      <button
                        className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                        disabled={isBlocked}
                        type="submit"
                      >
                        {status === "pending" ? "Solicitacao ja enviada" : status === "active" ? "Cliente ja vinculado" : "Solicitar vinculo"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="section-panel">
          <h3 className="text-lg font-semibold text-ink">Solicitacoes enviadas</h3>
          <div className="mt-4 grid gap-3">
            {pendingRelationships.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma solicitacao pendente.</p> : null}
            {pendingRelationships.map((relationship) => {
              const company = companyMap.get(relationship.client_company_id);
              return (
                <div className="rounded-md border border-line bg-white p-3" key={relationship.id}>
                  <p className="font-semibold text-ink">{profileDisplayName(company)}</p>
                  <p className="text-xs text-zinc-500">Status: {relationship.status}</p>
                  <p className="text-xs text-zinc-500">Enviada em: {relationship.requested_at.slice(0, 10)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="section-panel">
          <h3 className="text-lg font-semibold text-ink">Clientes vinculados</h3>
          <div className="mt-4 grid gap-3">
            {activeRelationships.length === 0 ? <p className="text-sm text-zinc-500">Nenhum cliente/contratante ativo ainda.</p> : null}
            {activeRelationships.map((relationship) => {
              const company = companyMap.get(relationship.client_company_id);
              return (
                <div className="rounded-md border border-line bg-white p-3" key={relationship.id}>
                  <p className="font-semibold text-ink">{profileDisplayName(company)}</p>
                  <p className="text-xs text-zinc-500">ID: {company?.client_company_code || "-"}</p>
                  <p className="text-xs text-zinc-500">Telefone: {maskPhone(company?.phone)}</p>
                  <p className="text-xs text-zinc-500">E-mail: {maskEmail(company?.email)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
