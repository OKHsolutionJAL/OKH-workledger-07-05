export type ChartDatum = {
  label: string;
  value: number;
};

export type MonthlyRevenueDatum = {
  label: string;
  revenue: number;
  profit: number;
};

export type HoursDatum = {
  label: string;
  hours: number;
};

export function formatCompactCurrency(value: number, currency: string) {
  const amount = Number(value || 0);

  if (currency === "AUD") {
    return `A$${amount.toLocaleString("en-AU", {
      maximumFractionDigits: 0
    })}`;
  }

  return `\u00a5${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0
  })}`;
}

export function formatPercent(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}
