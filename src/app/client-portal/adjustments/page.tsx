import { createClientAdjustment } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { adjustmentLabels, profileDisplayName } from "@/lib/client-portal/utils";
import type { ClientAdjustment, ContractorRelationship, IssuedDocument, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

const adjustmentTypes = Object.entries(adjustmentLabels);

export default async function ClientPortalAdjustmentsPage() {
  const { supabase, user, profile } = await requireClientCompany();
  const [{ data: relationships }, { data: documents }, { data: adjustments }] = await Promise.all([
    supabase.from("contractor_relationships").select("*").eq("client_company_id", user.id).eq("status", "active"),
    supabase.from("issued_documents").select("*").eq("client_company_id", user.id).order("created_at", { ascending: false }),
    supabase.from("client_adjustments").select("*").eq("client_company_id", user.id).order("created_at", { ascending: false })
  ]);

  const relationshipRows = (relationships ?? []) as ContractorRelationship[];
  const docs = (documents ?? []) as IssuedDocument[];
  const adjustmentRows = (adjustments ?? []) as ClientAdjustment[];
  const workerIds = [...new Set([...relationshipRows.map((item) => item.worker_user_id), ...docs.map((doc) => doc.worker_user_id)])];
  const { data: workers } = workerIds.length ? await supabase.from("profiles").select("*").in("id", workerIds) : { data: [] as Profile[] };
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));
  const fallbackCurrency = profile.default_currency || profile.currency || "JPY";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Ajustes do cliente/contratante</p>
        <h2 className="page-title">Descontos e ajustes separados</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Registre descontos internos sem alterar o valor original da nota, recibo ou invoice emitido pelo prestador.
        </p>
      </div>

      <section className="section-panel grid gap-4">
        <h3 className="text-lg font-semibold text-ink">Criar ajuste para documento recebido</h3>
        {docs.length === 0 ? <p className="text-sm text-zinc-500">Nenhum documento recebido para ajustar.</p> : null}
        <div className="grid gap-4">
          {docs.slice(0, 12).map((doc) => (
            <form action={createClientAdjustment} className="grid gap-3 rounded-lg border border-line bg-white p-4" key={doc.id}>
              <input name="document_id" type="hidden" value={doc.id} />
              <input name="worker_user_id" type="hidden" value={doc.worker_user_id} />
              <input name="period_year" type="hidden" value={doc.period_year} />
              <input name="period_month" type="hidden" value={doc.period_month} />
              <input name="currency" type="hidden" value={doc.currency} />

              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                <div>
                  <p className="font-semibold text-ink">{doc.title} {doc.document_number}</p>
                  <p className="text-sm text-zinc-500">Prestador: {profileDisplayName(workerMap.get(doc.worker_user_id))}</p>
                  <p className="text-sm text-zinc-500">Valor bruto: {formatWorkCurrency(doc.gross_amount, doc.currency)}</p>
                </div>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-zinc-700">
                  {String(doc.period_month).padStart(2, "0")}/{doc.period_year}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-[180px_1fr_140px_auto]">
                <select className="rounded-md border border-line px-3 py-2" name="adjustment_type" required>
                  {adjustmentTypes.map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <input className="rounded-md border border-line px-3 py-2" name="title" placeholder="Titulo do ajuste" required />
                <input className="rounded-md border border-line px-3 py-2" min="0" name="amount" placeholder="Valor" step="0.01" type="number" required />
                <button className="rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
                  Criar ajuste
                </button>
              </div>
              <textarea className="min-h-20 rounded-md border border-line px-3 py-2" name="description" placeholder="Descricao ou observacao interna" />
            </form>
          ))}
        </div>
      </section>

      <section className="section-panel">
        <h3 className="text-lg font-semibold text-ink">Ajustes cadastrados</h3>
        {adjustmentRows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nenhum ajuste registrado.</p>
        ) : (
          <div className="mt-4 table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Titulo</th>
                  <th>Prestador</th>
                  <th>Periodo</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adjustmentRows.map((adjustment) => (
                  <tr key={adjustment.id}>
                    <td>{adjustmentLabels[adjustment.adjustment_type]}</td>
                    <td>
                      <span className="font-semibold text-ink">{adjustment.title}</span>
                      <span className="block max-w-sm whitespace-normal text-xs text-zinc-500">{adjustment.description || "-"}</span>
                    </td>
                    <td>{profileDisplayName(workerMap.get(adjustment.worker_user_id))}</td>
                    <td>{String(adjustment.period_month || "").padStart(2, "0")}/{adjustment.period_year || "-"}</td>
                    <td>{formatWorkCurrency(adjustment.amount, adjustment.currency || fallbackCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
