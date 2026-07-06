import { okhChartColors } from "@/lib/theme";
import { formatCompactCurrency, formatPercent, type ChartDatum } from "./chart-utils";

type ExpensesByCategoryChartProps = {
  data: ChartDatum[];
  currency: string;
};

export function ExpensesByCategoryChart({ data, currency }: ExpensesByCategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="grid gap-3">
      {data.map((item, index) => (
        <div className="grid gap-1" key={item.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-[#0B132B]">{item.label}</span>
            <span className="shrink-0 font-semibold text-zinc-700">
              {formatCompactCurrency(item.value, currency)} <span className="font-normal text-zinc-400">({formatPercent(item.value, total)})</span>
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: okhChartColors[index % okhChartColors.length],
                width: `${Math.max(4, (item.value / max) * 100)}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
