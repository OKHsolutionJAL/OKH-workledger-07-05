export const yenFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

export const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "-";
  return dateTimeFormatter.format(new Date(value));
}

export function formatYen(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return yenFormatter.format(value);
}

export function toDateInputValue(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function toDateTimeInputValue(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}
