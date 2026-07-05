import { updateRelationshipStatus } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { profileDisplayName } from "@/lib/client-portal/utils";
import type { ContractorRelationship, Profile } from "@/lib/database.types";

export default async function ClientPortalRequestsPage() {
  const { supabase, user } = await requireClientCompany();
  const { data: relationships } = await supabase
    .from("contractor_relationships")
    .select("*")
    .eq("client_company_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (relationships ?? []) as ContractorRelationship[];
  const workerIds = [...new Set(rows.map((item) => item.worker_user_id))];
  const { data: workers } = workerIds.length ? await supabase.from("profiles").select("*").in("id", workerIds) : { data: [] as Profile[] };
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));
  const pendingRows = rows.filter((relationship) => relationship.status === "pending");
  const historyRows = rows.filter((relationship) => relationship.status !== "pending");

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Client / Contractor Portal</p>
        <h2 className="page-title">Solicitacoes recebidas</h2>
        <p className="mt-2 text-sm text-zinc-600">Aceite ou recuse vinculos solicitados por workers.</p>
      </div>

      <section className="section-panel">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-semibold text-ink">Pendentes para aceitar</h3>
            <p className="text-sm text-zinc-500">Quando aceitar, o worker passa a conseguir gerar documentos e lancamentos para esta empresa.</p>
          </div>
          <span className="rounded-full bg-jade-50 px-3 py-1 text-xs font-semibold text-jade-700">{pendingRows.length} pendente(s)</span>
        </div>
        <div className="grid gap-3">
          {pendingRows.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma solicitacao pendente para aceitar.</p> : null}
          {pendingRows.map((relationship) => {
            const worker = workerMap.get(relationship.worker_user_id);
            return (
              <div className="rounded-lg border border-line bg-white p-4" key={relationship.id}>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-ink">{profileDisplayName(worker)}</p>
                    <p className="text-sm text-zinc-500">E-mail: {worker?.email || "-"}</p>
                    <p className="text-sm text-zinc-500">Pais: {worker?.country || worker?.market || "-"}</p>
                    <p className="text-sm text-zinc-500">Data: {relationship.requested_at.slice(0, 10)}</p>
                    <p className="text-sm font-semibold text-jade-700">Status: {relationship.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={updateRelationshipStatus}>
                      <input name="relationship_id" type="hidden" value={relationship.id} />
                      <input name="status" type="hidden" value="active" />
                      <button className="rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
                        Aceitar vinculo
                      </button>
                    </form>
                    <form action={updateRelationshipStatus}>
                      <input name="relationship_id" type="hidden" value={relationship.id} />
                      <input name="status" type="hidden" value="rejected" />
                      <button className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink" type="submit">
                        Recusar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-panel">
        <h3 className="text-lg font-semibold text-ink">Historico de solicitacoes</h3>
        <div className="mt-4 grid gap-3">
          {rows.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma solicitacao recebida.</p> : null}
          {historyRows.map((relationship) => {
            const worker = workerMap.get(relationship.worker_user_id);
            return (
              <div className="rounded-lg border border-line bg-white p-4" key={relationship.id}>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold text-ink">{profileDisplayName(worker)}</p>
                    <p className="text-sm text-zinc-500">E-mail: {worker?.email || "-"}</p>
                    <p className="text-sm text-zinc-500">Pais: {worker?.country || worker?.market || "-"}</p>
                    <p className="text-sm text-zinc-500">Data: {relationship.requested_at.slice(0, 10)}</p>
                  </div>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-zinc-700">Status: {relationship.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
