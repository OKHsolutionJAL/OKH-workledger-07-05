export const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Mar\u00e7o",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export function formatCurrency(value: number | null | undefined) {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(Number(value || 0));

  return `\u00a5${amount}`;
}

export function formatDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

export function formatHours(value: number) {
  return `${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} h`;
}

export function getMonthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function createReportNumber(year: number, month: number, sequence: number) {
  return `REP-${year}-${String(month).padStart(2, "0")}-${String(sequence).padStart(4, "0")}`;
}
