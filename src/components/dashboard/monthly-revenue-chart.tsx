import { okhTheme } from "@/lib/theme";
import { formatCompactCurrency, type MonthlyRevenueDatum } from "./chart-utils";

type MonthlyRevenueChartProps = {
  data: MonthlyRevenueDatum[];
  currency: string;
};

export function MonthlyRevenueChart({ data, currency }: MonthlyRevenueChartProps) {
  const width = 720;
  const height = 260;
  const chartTop = 20;
  const chartBottom = 220;
  const chartLeft = 34;
  const chartRight = 700;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.revenue, item.profit]));
  const step = (chartRight - chartLeft) / data.length;
  const barWidth = Math.max(12, step * 0.46);
  const yFor = (value: number) => chartBottom - (Math.max(value, 0) / maxValue) * (chartBottom - chartTop);
  const profitPoints = data.map((item, index) => `${chartLeft + step * index + step / 2},${yFor(item.profit)}`).join(" ");

  return (
    <div className="min-w-0 overflow-hidden">
      <svg className="h-72 w-full" role="img" aria-label="Faturamento mensal" viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartBottom - ratio * (chartBottom - chartTop);
          return (
            <g key={ratio}>
              <line stroke="#E5E7EB" strokeWidth="1" x1={chartLeft} x2={chartRight} y1={y} y2={y} />
              <text fill="#6B7280" fontSize="10" x="0" y={y + 4}>
                {formatCompactCurrency(maxValue * ratio, currency)}
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const x = chartLeft + step * index + (step - barWidth) / 2;
          const y = yFor(item.revenue);
          const h = Math.max(2, chartBottom - y);
          return (
            <g key={item.label}>
              <rect fill={okhTheme.colors.blue} height={h} rx="5" width={barWidth} x={x} y={y}>
                <title>{`${item.label}: ${formatCompactCurrency(item.revenue, currency)}`}</title>
              </rect>
              <text fill="#6B7280" fontSize="10" textAnchor="middle" x={chartLeft + step * index + step / 2} y="246">
                {item.label}
              </text>
            </g>
          );
        })}
        <polyline fill="none" points={profitPoints} stroke={okhTheme.colors.orange} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {data.map((item, index) => (
          <circle cx={chartLeft + step * index + step / 2} cy={yFor(item.profit)} fill={okhTheme.colors.orange} key={`${item.label}-profit`} r="4">
            <title>{`${item.label} lucro: ${formatCompactCurrency(item.profit, currency)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1E3A8A]" />
          Faturamento
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6A00]" />
          Lucro estimado
        </span>
      </div>
    </div>
  );
}
