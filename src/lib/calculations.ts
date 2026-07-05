import type { TimeEntry } from "@/lib/database.types";

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateNetHours(
  startTime: string,
  endTime: string,
  breakMinutes = 0
) {
  if (!startTime || !endTime) return 0;

  const start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);

  if (end < start) {
    end += 24 * 60;
  }

  const netMinutes = Math.max(end - start - breakMinutes, 0);
  return Number((netMinutes / 60).toFixed(2));
}

export function calculateExpenses(entry: Pick<TimeEntry, "expense_amount" | "toll_amount" | "fuel_amount">) {
  return Number(entry.expense_amount || 0) + Number(entry.toll_amount || 0) + Number(entry.fuel_amount || 0);
}

export function calculateEntryTotal(
  entry: Pick<
    TimeEntry,
    | "start_time"
    | "end_time"
    | "break_minutes"
    | "hourly_rate"
    | "expense_amount"
    | "toll_amount"
    | "fuel_amount"
  >
) {
  const netHours = calculateNetHours(entry.start_time, entry.end_time, entry.break_minutes);
  return Number((netHours * Number(entry.hourly_rate || 0) + calculateExpenses(entry)).toFixed(0));
}

export function summarizeEntries<T extends TimeEntry>(entries: T[]) {
  const dates = new Set(entries.map((entry) => entry.work_date));
  const totalHours = entries.reduce(
    (sum, entry) => sum + calculateNetHours(entry.start_time, entry.end_time, entry.break_minutes),
    0
  );
  const totalExpenses = entries.reduce((sum, entry) => sum + calculateExpenses(entry), 0);
  const totalAmount = entries.reduce((sum, entry) => sum + calculateEntryTotal(entry), 0);

  return {
    totalDays: dates.size,
    totalHours: Number(totalHours.toFixed(2)),
    totalExpenses,
    totalAmount
  };
}
