import { updateDocumentReview } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { netDocumentAmount, profileDisplayName, reviewStatusLabels } from "@/lib/client-portal/utils";
import type { ClientAdjustment, DocumentReview, IssuedDocument, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

export default async function ClientPortalPaymentsPage() {
  const { supabase, user } = await requireClientCompany();
  const [{ data: documents }, { data: reviews }, { data: adjustments }] = await Promise.all([
    supabase.from("issued_documents").select("*").eq("client_company_id", user.id).order("issued_at", { ascending: false }),
    supabase.from("document_reviews").select("*").eq("client_company_id", user.id),
    supabase.from("client_adjustments").select("*").eq("client_company_id", user.id)
  ]);

  const docs = (documents ?? []) as IssuedDocument[];
  const reviewRows = (reviews ?? []) as DocumentReview[];
  const adjustmentRows = (adjustments ?? []) as ClientAdjustment[];
  const workerIds = [...new Set(docs.map((doc) => doc.worker_user_id))];
  const { data: workers } = workerIds.length ? await supabase.from("profiles").select("*").in("id", workerIds) : { data: [] as Profile[] };
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));
  const reviewMap = new Map(reviewRows.map((review) => [review.document_id, review]));

  const grossTotal = docs.reduce((total, doc) => total + Number(doc.gross_amount || 0), 0);
  const adjustmentTotal = adjustmentRows.reduce((total, item) => total + Number(item.amount || 0), 0);
  const paidTotal = docs
    .filter((doc) => reviewMap.get(doc.id)?.status === "paid")
    .reduce((total, doc) => total + netDocumentAmount(doc, adjustmentRows.filter((item) => item.document_id === doc.id)), 0);
  const currency = docs[0]?.currency || "JPY";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Pagamentos</p>
        <h2 className="page-title">Controle de pagamento dos documentos</h2>
        <p className="mt-2 text-sm text-zinc-600">Marque documentos como recebido, aprovado ou pago sem editar o documento original.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="section-panel">
          <p className="text-sm text-zinc-500">Valor bruto</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatWorkCurrency(grossTotal, currency)}</p>
        </div>
        <div className="section-panel">
          <p className="text-sm text-zinc-500">Ajustes/descontos</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatWorkCurrency(adjustmentTotal, currency)}</p>
        </div>
        <div className="section-panel">
          <p className="text-sm text-zinc-500">Pago liquido estimado</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{formatWorkCurrency(paidTotal, currency)}</p>
        </div>
      </section>

      <section className="section-panel">
        {docs.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum documento recebido ainda.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Prestador</th>
                  <th>Periodo</th>
                  <th>Bruto</th>
                  <th>Ajustes</th>
                  <th>Liquido estimado</th>
                  <th>Status</th>
                  <th>Atualizar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((doc) => {
                  const docAdjustments = adjustmentRows.filter((item) => item.document_id === doc.id);
                  const review = reviewMap.get(doc.id);
                  const currentStatus = review?.status || "received";
                  return (
                    <tr key={doc.id}>
                      <td>
                        <span className="font-semibold text-ink">{doc.title}</span>
                        <span className="block text-xs text-zinc-500">{doc.document_number}</span>
                      </td>
                      <td>{profileDisplayName(workerMap.get(doc.worker_user_id))}</td>
                      <td>{String(doc.period_month).padStart(2, "0")}/{doc.period_year}</td>
                      <td>{formatWorkCurrency(doc.gross_amount, doc.currency)}</td>
                      <td>{formatWorkCurrency(docAdjustments.reduce((total, item) => total + Number(item.amount || 0), 0), doc.currency)}</td>
                      <td>{formatWorkCurrency(netDocumentAmount(doc, docAdjustments), doc.currency)}</td>
                      <td>{reviewStatusLabels[currentStatus] || currentStatus}</td>
                      <td>
                        <form action={updateDocumentReview} className="flex min-w-56 gap-2">
                          <input name="document_id" type="hidden" value={doc.id} />
                          <input name="comment" type="hidden" value={review?.comment ?? ""} />
                          <select className="min-h-10 rounded-md border border-line px-2 text-sm" defaultValue={currentStatus} name="status">
                            <option value="received">Recebido</option>
                            <option value="reviewing">Em revisao</option>
                            <option value="approved">Aprovado</option>
                            <option value="rejected">Rejeitado</option>
                            <option value="paid">Pago</option>
                          </select>
                          <button className="rounded-md bg-jade-600 px-3 py-2 text-xs font-semibold text-white" type="submit">
                            Salvar
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
