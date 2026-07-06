import { CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";
import { okhTheme } from "@/lib/theme";

export type ServiceStatusDatum = {
  key: "pending" | "in_progress" | "completed" | "cancelled";
  label: string;
  value: number;
};

const statusMeta: Record<ServiceStatusDatum["key"], { color: string; icon: typeof CircleDashed }> = {
  pending: { color: okhTheme.colors.orange, icon: CircleDashed },
  in_progress: { color: okhTheme.colors.blue, icon: Clock3 },
  completed: { color: okhTheme.colors.success, icon: CheckCircle2 },
  cancelled: { color: okhTheme.colors.danger, icon: XCircle }
};

export function ServiceStatusChart({ data }: { data: ServiceStatusDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {data.map((item) => {
        const meta = statusMeta[item.key];
        const Icon = meta.icon;
        const percent = total ? Math.round((item.value / total) * 100) : 0;

        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4" key={item.key}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B132B]">
                <Icon className="h-4 w-4" style={{ color: meta.color }} aria-hidden="true" />
                {item.label}
              </span>
              <span className="text-lg font-bold text-[#0B132B]">{item.value}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full" style={{ backgroundColor: meta.color, width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">{percent}% do total</p>
          </div>
        );
      })}
    </div>
  );
}
