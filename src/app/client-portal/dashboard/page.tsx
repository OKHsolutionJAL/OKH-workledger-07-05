import { StatCard } from "@/components/ui/stat-card";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { currentPeriod, sumAdjustments } from "@/lib/client-portal/utils";
import type { ClientAdjustment, DocumentReview, IssuedDocument, WorkEntry } from "@/lib/database.types";
import { calculateWorkEntryAmount, formatWorkCurrency } from "@/lib/work-entries";

export default async function ClientPortalDashboardPage() {
  const { supabase, user, profile } = await requireClientCompany();
  const period = currentPeriod();

  const [{ data: documents }, { data: reviews }, { data: adjustments }, { data: relationships }, { data: entries }] = await Promise.all([
    supabase.from("issued_documents").select("*").eq("client_company_id", user.id).order("created_at", { ascending: false }),
    supabase.from("document_reviews").select("*").eq("client_company_id", user.id),
    supabase.from("client_adjustments").select("*").eq("client_company_id", user.id),
    supabase.from("contractor_relationships").select("*").eq("client_company_id", user.id),
    supabase.from("work_entries").select("*").eq("client_company_id", user.id).eq("visibility_to_client", true)
  ]);

  const docs = (documents ?? []) as IssuedDocument[];
  const reviewRows = (reviews ?? []) as DocumentReview[];
  const adjustmentRows = (adjustments ?? []) as ClientAdjustment[];
  const entryRows = (entries ?? []) as WorkEntry[];
  const reviewByDoc = new Map(reviewRows.map((review) => [review.document_id, review.status]));
  const monthDocs = docs.filter((doc) => doc.period_year === period.year && doc.period_month === period.month);
  const monthAdjustments = adjustmentRows.filter((item) => item.period_year === period.year && item.period_month === period.month);
  const monthEntries = entryRows.filter((entry) => {
    const date = new Date(entry.date);
    return date.getFullYear() === period.year && date.getMonth() + 1 === period.month;
  });
  const gross = monthDocs.reduce((total, doc) => total + Number(doc.gross_amount || 0), 0) + monthEntries.reduce((total, entry) => total + calculateWorkEntryAmount(entry), 0);
  const adjustmentTotal = sumAdjustments(monthAdjustments);
  const currency = profile.default_currency || profile.currency || "JPY";

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Area do Cliente / Contratante</p>
        <h2 className="page-title">Dashboard</h2>
        <p className="mt-2 text-sm text-zinc-600">Resumo dos documentos recebidos, prestadores, ajustes e pagamentos.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Documentos recebidos" value={String(docs.length)} />
        <StatCard label="Documentos pendentes" value={String(docs.filter((doc) => !["approved", "rejected", "paid"].includes(reviewByDoc.get(doc.id) ?? "")).length)} />
        <StatCard label="Documentos aprovados" value={String(reviewRows.filter((review) => review.status === "approved").length)} />
        <StatCard label="Documentos pagos" value={String(reviewRows.filter((review) => review.status === "paid").length)} />
        <StatCard label="Lancamentos recebidos" value={String(entryRows.length)} />
        <StatCard label="Lancamentos aprovados" value={String(entryRows.filter((entry) => entry.client_review_status === "approved").length)} />
        <StatCard label="Lancamentos rejeitados" value={String(entryRows.filter((entry) => entry.client_review_status === "rejected").length)} />
        <StatCard label="Lancamentos pagos" value={String(entryRows.filter((entry) => entry.client_review_status === "paid").length)} />
        <StatCard label="Valor bruto do mes" value={formatWorkCurrency(gross, currency)} />
        <StatCard label="Ajustes/descontos" value={formatWorkCurrency(adjustmentTotal, currency)} />
        <StatCard label="Valor liquido estimado" value={formatWorkCurrency(gross - adjustmentTotal, currency)} />
        <StatCard label="Prestadores ativos" value={String((relationships ?? []).filter((item) => item.status === "active").length)} />
      </section>

      <section className="section-panel">
        <h3 className="text-lg font-semibold text-ink">Ultimas atividades</h3>
        <div className="mt-4 grid gap-3">
          {docs.slice(0, 5).map((doc) => (
            <div className="rounded-md border border-line bg-white p-3" key={doc.id}>
              <p className="font-semibold text-ink">{doc.title} {doc.document_number}</p>
              <p className="text-sm text-zinc-500">Status: {reviewByDoc.get(doc.id) || doc.status}</p>
            </div>
          ))}
          {docs.length === 0 ? <p className="text-sm text-zinc-500">Nenhum documento recebido ainda.</p> : null}
        </div>
      </section>
    </div>
  );
}
