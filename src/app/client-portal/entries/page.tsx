import { updateWorkEntryReview } from "@/lib/client-portal/actions";
import { requireClientCompany } from "@/lib/client-portal/auth";
import { profileDisplayName } from "@/lib/client-portal/utils";
import type { Client, Profile, WorkEntry } from "@/lib/database.types";
import { formatDate } from "@/lib/format";
import {
  calculateWorkEntryAmount,
  calculateWorkEntryHours,
  documentEntryDescription,
  formatWorkCurrency,
  normalizeWorkEntryType,
  workEntryLocation,
  workEntryNotes,
  workEntryTypeLabels
} from "@/lib/work-entries";

const reviewLabels: Record<string, string> = {
  draft: "Nao enviado",
  sent: "Enviado",
  received: "Recebido",
  approved: "Aprovado",
  rejected: "Rejeitado",
  paid: "Pago"
};

export default async function ClientPortalEntriesPage() {
  const { supabase, user } = await requireClientCompany();
  const { data: entries } = await supabase
    .from("work_entries")
    .select("*")
    .eq("client_company_id", user.id)
    .eq("visibility_to_client", true)
    .order("date", { ascending: false })
    .limit(100);

  const rows = (entries ?? []) as WorkEntry[];
  const workerIds = [...new Set(rows.map((entry) => entry.user_id))];
  const clientIds = [...new Set(rows.map((entry) => entry.client_id).filter(Boolean))] as string[];

  const [{ data: workers }, { data: clients }] = await Promise.all([
    workerIds.length ? supabase.from("profiles").select("*").in("id", workerIds) : Promise.resolve({ data: [] as Profile[] }),
    clientIds.length ? supabase.from("clients").select("*").in("id", clientIds) : Promise.resolve({ data: [] as Client[] })
  ]);

  const clientMap = new Map(((clients ?? []) as Client[]).map((client) => [client.id, client]));
  const workerMap = new Map(((workers ?? []) as Profile[]).map((worker) => [worker.id, worker]));

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-jade-700">Area do Cliente / Contratante</p>
        <h2 className="page-title">Lancamentos recebidos</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Veja os lancamentos enviados pelos prestadores. Voce pode aprovar, rejeitar, comentar ou marcar como pago sem alterar o original.
        </p>
      </div>

      <section className="section-panel">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum lancamento enviado para esta empresa ainda.</p>
        ) : (
          <div className="grid gap-4">
            {rows.map((entry) => {
              const client = entry.client_id ? clientMap.get(entry.client_id) : null;
              const worker = workerMap.get(entry.user_id);
              const market = entry.market === "AU" ? "AU" : "JP";
              const type = normalizeWorkEntryType(entry.entry_type);

              return (
                <article className="rounded-lg border border-line bg-white p-4" key={entry.id}>
                  <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-jade-50 px-3 py-1 text-xs font-semibold text-jade-700">
                          {reviewLabels[entry.client_review_status] || entry.client_review_status}
                        </span>
                        <span className="text-sm text-zinc-500">Enviado em: {entry.sent_to_client_at ? formatDate(entry.sent_to_client_at) : "-"}</span>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Prestador</p>
                          <p className="font-semibold text-ink">{profileDisplayName(worker)}</p>
                          <p className="text-sm text-zinc-500">{worker?.email || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Cliente / Contratante</p>
                          <p className="font-semibold text-ink">{client?.company_name || client?.client_name || "-"}</p>
                          <p className="text-sm text-zinc-500">{client?.email || client?.phone || ""}</p>
                        </div>
                      </div>
                      <div className="mt-4 overflow-hidden rounded-md border border-line">
                        <div className="grid gap-0 md:grid-cols-5">
                          <div className="border-b border-line p-3 md:border-b-0 md:border-r">
                            <p className="text-xs text-zinc-500">Data</p>
                            <p className="font-semibold text-ink">{formatDate(entry.date)}</p>
                          </div>
                          <div className="border-b border-line p-3 md:border-b-0 md:border-r">
                            <p className="text-xs text-zinc-500">Tipo</p>
                            <p className="font-semibold text-ink">{workEntryTypeLabels.pt[type]}</p>
                          </div>
                          <div className="border-b border-line p-3 md:border-b-0 md:border-r">
                            <p className="text-xs text-zinc-500">Horas</p>
                            <p className="font-semibold text-ink">{calculateWorkEntryHours(entry).toFixed(2)} h</p>
                          </div>
                          <div className="border-b border-line p-3 md:border-b-0 md:border-r">
                            <p className="text-xs text-zinc-500">Adicionais</p>
                            <p className="font-semibold text-ink">{formatWorkCurrency(Number(entry.premium_total_amount || 0), entry.currency)}</p>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-zinc-500">Total</p>
                            <p className="font-semibold text-jade-700">{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-md bg-paper p-3">
                        <p className="font-semibold text-ink">{documentEntryDescription(entry, market) || "-"}</p>
                        <p className="mt-1 text-sm text-zinc-600">{workEntryLocation(entry) || workEntryNotes(entry) || "-"}</p>
                      </div>
                    </div>

                    <form action={updateWorkEntryReview} className="grid gap-3 rounded-lg border border-line bg-paper p-3">
                      <input name="entry_id" type="hidden" value={entry.id} />
                      <label className="grid gap-1.5 text-sm font-medium text-zinc-800">
                        Comentario do contratante
                        <textarea
                          className="min-h-24 rounded-md border border-line bg-white px-3 py-2 text-ink outline-none"
                          defaultValue={entry.client_review_comment ?? ""}
                          name="comment"
                          placeholder="Opcional"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink" name="status" type="submit" value="received">
                          Recebido
                        </button>
                        <button className="rounded-md bg-jade-600 px-3 py-2 text-sm font-semibold text-white" name="status" type="submit" value="approved">
                          Aprovar
                        </button>
                        <button className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700" name="status" type="submit" value="rejected">
                          Rejeitar
                        </button>
                        <button className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink" name="status" type="submit" value="paid">
                          Pago
                        </button>
                      </div>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
