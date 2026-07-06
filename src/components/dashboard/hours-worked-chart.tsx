import { okhTheme } from "@/lib/theme";
import type { HoursDatum } from "./chart-utils";

type HoursWorkedChartProps = {
  data: HoursDatum[];
};

export function HoursWorkedChart({ data }: HoursWorkedChartProps) {
  const width = 720;
  const height = 230;
  const top = 18;
  const bottom = 190;
  const left = 28;
  const right = 700;
  const max = Math.max(1, ...data.map((item) => item.hours));
  const maxHours = Math.max(...data.map((item) => item.hours));
  const step = (right - left) / data.length;
  const barWidth = Math.max(6, Math.min(18, step * 0.55));
  const yFor = (hours: number) => bottom - (Math.max(hours, 0) / max) * (bottom - top);

  return (
    <div className="min-w-0 overflow-hidden">
      <svg className="h-60 w-full" role="img" aria-label="Horas trabalhadas" viewBox={`0 0 ${width} ${height}`}>
        {[0, 0.5, 1].map((ratio) => {
          const y = bottom - ratio * (bottom - top);
          return (
            <g key={ratio}>
              <line stroke="#E5E7EB" strokeWidth="1" x1={left} x2={right} y1={y} y2={y} />
              <text fill="#6B7280" fontSize="10" x="0" y={y + 4}>
                {(max * ratio).toFixed(0)}h
              </text>
            </g>
          );
        })}
        {data.map((item, index) => {
          const x = left + step * index + (step - barWidth) / 2;
          const y = yFor(item.hours);
          const h = Math.max(2, bottom - y);
          const isPeak = item.hours > 0 && item.hours === maxHours;
          return (
            <g key={item.label}>
              <rect fill={isPeak ? okhTheme.colors.orange : okhTheme.colors.blue} height={h} rx="4" width={barWidth} x={x} y={y}>
                <title>{`${item.label}: ${item.hours.toFixed(2)} h`}</title>
              </rect>
              {index % 2 === 0 ? (
                <text fill="#6B7280" fontSize="9" textAnchor="middle" x={left + step * index + step / 2} y="215">
                  {item.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
