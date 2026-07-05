import { updateDocumentReview } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { netDocumentAmount, profileDisplayName } from "@/lib/client-portal/utils";
import type { ClientAdjustment, DocumentReview, IssuedDocument, Profile } from "@/lib/database.types";
import { formatWorkCurrency } from "@/lib/work-entries";

const reviewStatuses: DocumentReview["status"][] = ["received", "reviewing", "approved", "rejected", "paid"];

export default async function ClientPortalDocumentsPage() {
  const { supabase, user } = await requireClientCompany();
  const [{ data: documents }, { data: reviews }, { data: adjustments }] = await Promise.all([
    supabase.from("issued_documents").select("*").eq("client_company_id", user.id).order("created_at", { ascending: false }),
    supabase.from("document_reviews").select("*").eq("client_company_id", user.id),
    supabase.from("client_adjustments").select("*").eq("client_company_id", user.id)
  ]);

  const docs = (documents ?? []) as IssuedDocument[];
  const workerIds = [...new Set(docs.map((doc) => doc.worker_user_id))];
  const { data: workers } = workerIds.length ? await supabase.from("profiles").select("*").in("id", workerIds) : { data: [] as Profile[] };
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));
  const reviewMap = new Map(((reviews ?? []) as DocumentReview[]).map((review) => [review.document_id, review]));
  const adjustmentRows = (adjustments ?? []) as ClientAdjustment[];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Documentos recebidos</p>
        <h2 className="page-title">Revisao de documentos</h2>
        <p className="mt-2 text-sm text-zinc-600">Visualize e aprove documentos sem alterar o documento original emitido pelo worker.</p>
      </div>

      <section className="grid gap-4">
        {docs.length === 0 ? <div className="section-panel text-sm text-zinc-600">Nenhum documento recebido ainda.</div> : null}
        {docs.map((doc) => {
          const review = reviewMap.get(doc.id);
          const docAdjustments = adjustmentRows.filter((item) => item.document_id === doc.id);
          const worker = workerMap.get(doc.worker_user_id);
          return (
            <div className="section-panel grid gap-4" key={doc.id}>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-jade-700">{doc.document_market === "JP" ? "Japan" : "Australia"}</p>
                  <h3 className="text-xl font-semibold text-ink">{doc.title} {doc.document_number}</h3>
                  <p className="text-sm text-zinc-500">Worker: {profileDisplayName(worker)}</p>
                  <p className="text-sm text-zinc-500">Periodo: {String(doc.period_month).padStart(2, "0")}/{doc.period_year}</p>
                  <p className="text-sm text-zinc-500">Status: {review?.status || doc.status}</p>
                </div>
                <div className="rounded-md border border-line bg-white p-3 text-sm">
                  <p>Valor bruto: <strong>{formatWorkCurrency(doc.gross_amount, doc.currency)}</strong></p>
                  <p>Ajustes do cliente/contratante: <strong>{formatWorkCurrency(docAdjustments.reduce((total, item) => total + Number(item.amount || 0), 0), doc.currency)}</strong></p>
                  <p>Valor liquido estimado: <strong>{formatWorkCurrency(netDocumentAmount(doc, docAdjustments), doc.currency)}</strong></p>
                </div>
              </div>

              <form action={updateDocumentReview} className="grid gap-3">
                <input name="document_id" type="hidden" value={doc.id} />
                <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
                  <select className="rounded-md border border-line px-3 py-2" defaultValue={review?.status || "received"} name="status">
                    {reviewStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <input className="rounded-md border border-line px-3 py-2" defaultValue={review?.comment ?? ""} name="comment" placeholder="Comentario para o worker" />
                  <button className="rounded-md bg-jade-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
                    Salvar revisao
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </section>
    </div>
  );
}
