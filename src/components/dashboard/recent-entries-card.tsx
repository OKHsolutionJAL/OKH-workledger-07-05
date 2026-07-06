import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import type { Language } from "@/lib/i18n/translations";
import {
  calculateWorkEntryAmount,
  formatWorkCurrency,
  normalizeWorkEntryType,
  workEntryDate,
  workEntryTitle,
  workEntryTypeLabels,
  type WorkEntryLike
} from "@/lib/work-entries";

type RecentEntry = WorkEntryLike & {
  source_table: "work_entries" | "time_entries";
};

type RecentEntriesCardProps = {
  entries: RecentEntry[];
  currency: string;
  language: Language;
  emptyTitle: string;
  emptyDescription: string;
};

function statusClass(status?: string | null) {
  if (status === "paid" || status === "invoiced") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "cancelled") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "draft" || status === "non_billable") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

export function RecentEntriesCard({ entries, currency, language, emptyTitle, emptyDescription }: RecentEntriesCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[#0B132B]">Ultimos lancamentos</h3>
          <p className="mt-1 text-sm text-zinc-500">Registros recentes de servicos, horas e despesas.</p>
        </div>
        <Link className="hidden text-sm font-semibold text-[#1E3A8A] hover:text-[#FF6A00] sm:inline-flex" href="/timecard">
          Ver todos
        </Link>
      </div>
      {entries.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Status</th>
                <th className="text-right">Valor</th>
                <th className="text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((entry) => {
                const type = normalizeWorkEntryType(entry.entry_type);
                return (
                  <tr key={`${entry.source_table}-${entry.id}`}>
                    <td>{formatDate(workEntryDate(entry))}</td>
                    <td>{entry.clients?.client_name ?? "-"}</td>
                    <td>
                      <span className="font-medium text-[#0B132B]">{workEntryTypeLabels[language][type]}</span>
                      <span className="block max-w-56 truncate text-xs text-zinc-500">{workEntryTitle(entry) || "-"}</span>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${statusClass(entry.status)}`}>{entry.status ?? "billable"}</span>
                    </td>
                    <td className="text-right font-semibold text-[#0B132B]">{formatWorkCurrency(calculateWorkEntryAmount(entry), entry.currency ?? currency)}</td>
                    <td className="text-right">
                      <Link className="inline-flex items-center justify-end gap-1 font-semibold text-[#1E3A8A] hover:text-[#FF6A00]" href="/timecard" aria-label="Ver detalhes">
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
