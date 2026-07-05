import type { ReactNode } from "react";

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        {icon ? <div className="rounded-md bg-jade-50 p-2 text-jade-700">{icon}</div> : null}
      </div>
      {detail ? <p className="mt-3 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}
