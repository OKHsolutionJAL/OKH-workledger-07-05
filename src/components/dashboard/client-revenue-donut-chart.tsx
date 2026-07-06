import { okhChartColors } from "@/lib/theme";
import { formatCompactCurrency, formatPercent, type ChartDatum } from "./chart-utils";

type DonutProps = {
  data: ChartDatum[];
  currency: string;
};

function polarToCartesian(center: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians)
  };
}

function arcPath(center: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

export function ClientRevenueDonutChart({ data, currency }: DonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
      <svg className="mx-auto h-44 w-44" role="img" aria-label="Total por cliente" viewBox="0 0 180 180">
        <circle cx="90" cy="90" fill="none" r="62" stroke="#F3F4F6" strokeWidth="24" />
        {data.map((item, index) => {
          const angle = total ? (item.value / total) * 360 : 0;
          const path = arcPath(90, 62, currentAngle, currentAngle + angle);
          currentAngle += angle;
          return (
            <path d={path} fill="none" key={item.label} stroke={okhChartColors[index % okhChartColors.length]} strokeLinecap="round" strokeWidth="24">
              <title>{`${item.label}: ${formatCompactCurrency(item.value, currency)} (${formatPercent(item.value, total)})`}</title>
            </path>
          );
        })}
        <text fill="#0B132B" fontSize="20" fontWeight="700" textAnchor="middle" x="90" y="86">
          {data.length}
        </text>
        <text fill="#6B7280" fontSize="11" textAnchor="middle" x="90" y="104">
          clientes
        </text>
      </svg>
      <div className="grid gap-2">
        {data.map((item, index) => (
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-[#F8FAFC] px-3 py-2" key={item.label}>
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: okhChartColors[index % okhChartColors.length] }} />
              <span className="truncate text-sm font-medium text-[#0B132B]">{item.label}</span>
            </span>
            <span className="shrink-0 text-right text-sm font-semibold text-[#1E3A8A]">{formatCompactCurrency(item.value, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
