import { updateRelationshipStatus } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { profileDisplayName, sumAdjustments } from "@/lib/client-portal/utils";
import type { ClientAdjustment, ContractorRelationship, IssuedDocument, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

export default async function ClientPortalWorkersPage() {
  const { supabase, user } = await requireClientCompany();
  const [{ data: relationships }, { data: documents }, { data: adjustments }] = await Promise.all([
    supabase.from("contractor_relationships").select("*").eq("client_company_id", user.id).order("created_at", { ascending: false }),
    supabase.from("issued_documents").select("*").eq("client_company_id", user.id),
    supabase.from("client_adjustments").select("*").eq("client_company_id", user.id)
  ]);

  const rows = (relationships ?? []) as ContractorRelationship[];
  const workerIds = [...new Set(rows.map((item) => item.worker_user_id))];
  const { data: workers } = workerIds.length ? await supabase.from("profiles").select("*").in("id", workerIds) : { data: [] as Profile[] };
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));
  const docs = (documents ?? []) as IssuedDocument[];
  const adjustmentRows = (adjustments ?? []) as ClientAdjustment[];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Prestadores</p>
        <h2 className="page-title">Workers vinculados</h2>
        <p className="mt-2 text-sm text-zinc-600">Acompanhe vinculos, documentos e valores por prestador.</p>
      </div>

      <section className="section-panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Status</th>
                <th>Documentos</th>
                <th>Total bruto</th>
                <th>Ajustes</th>
                <th>Liquido estimado</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((relationship) => {
                const worker = workerMap.get(relationship.worker_user_id);
                const workerDocs = docs.filter((doc) => doc.worker_user_id === relationship.worker_user_id);
                const gross = workerDocs.reduce((total, doc) => total + Number(doc.gross_amount || 0), 0);
                const workerAdjustments = adjustmentRows.filter((item) => item.worker_user_id === relationship.worker_user_id);
                const adjustmentTotal = sumAdjustments(workerAdjustments);
                const currency = workerDocs[0]?.currency || "JPY";
                return (
                  <tr key={relationship.id}>
                    <td>
                      <span className="font-semibold text-ink">{profileDisplayName(worker)}</span>
                      <span className="block text-xs text-zinc-500">{worker?.email || "-"}</span>
                    </td>
                    <td>{relationship.status}</td>
                    <td>{workerDocs.length}</td>
                    <td>{formatWorkCurrency(gross, currency)}</td>
                    <td>{formatWorkCurrency(adjustmentTotal, currency)}</td>
                    <td>{formatWorkCurrency(gross - adjustmentTotal, currency)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <form action={updateRelationshipStatus}>
                          <input name="relationship_id" type="hidden" value={relationship.id} />
                          <input name="status" type="hidden" value="suspended" />
                          <button className="rounded-md border border-line px-3 py-2 text-xs font-semibold" type="submit">
                            Suspender
                          </button>
                        </form>
                        <form action={updateRelationshipStatus}>
                          <input name="relationship_id" type="hidden" value={relationship.id} />
                          <input name="status" type="hidden" value="ended" />
                          <button className="rounded-md border border-line px-3 py-2 text-xs font-semibold" type="submit">
                            Encerrar
                          </button>
                        </form>
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
