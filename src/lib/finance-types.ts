export type BillStatus = "paid" | "pending" | "overdue";

export type BillFrequency = "monthly" | "biweekly";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // day of month 1-31 (used for monthly)
  status: BillStatus;
  category?: string;
  frequency?: BillFrequency; // defaults to monthly
  anchorDate?: string; // YYYY-MM-DD, one known occurrence (biweekly)
}


export interface VariableExpense {
  id: string;
  name: string;
  amount: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  analyze: boolean; // if true, treat as "would cancel"
  note?: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0,
  );

export const currencyPrecise = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number.isFinite(n) ? n : 0);

export function billStatusFromDueDay(dueDay: number, currentStatus: BillStatus): BillStatus {
  if (currentStatus === "paid") return "paid";
  const today = new Date();
  const dom = today.getDate();
  if (dom > dueDay) return "overdue";
  return "pending";
}

// Monthly cost equivalent for totals
export function monthlyCost(b: Bill): number {
  if (b.frequency === "biweekly") return (b.amount * 26) / 12;
  return b.amount;
}

// Actual amount charged for this bill in a given month
export function amountInMonth(b: Bill, year: number, month: number): number {
  return occurrencesInMonth(b, year, month).length * b.amount;
}


function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// Return day-of-month numbers within a given month/year when this bill is due.
export function occurrencesInMonth(b: Bill, year: number, month: number): number[] {
  if (b.frequency === "biweekly" && b.anchorDate) {
    const anchor = parseISODate(b.anchorDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    // Step from anchor by 14 days towards month window
    const msDay = 86400000;
    let d = new Date(anchor);
    // Fast-forward or rewind
    const diffDays = Math.round((monthStart.getTime() - d.getTime()) / msDay);
    const steps = Math.floor(diffDays / 14);
    d = new Date(d.getTime() + steps * 14 * msDay);
    while (d < monthStart) d = new Date(d.getTime() + 14 * msDay);
    const days: number[] = [];
    while (d <= monthEnd) {
      days.push(d.getDate());
      d = new Date(d.getTime() + 14 * msDay);
    }
    return days;
  }
  // monthly: clamp dueDay to days in month
  const dim = new Date(year, month + 1, 0).getDate();
  return [Math.min(b.dueDay, dim)];
}

// Next occurrence date >= from (inclusive)
export function nextOccurrence(b: Bill, from: Date): Date {
  if (b.frequency === "biweekly" && b.anchorDate) {
    const msDay = 86400000;
    const anchor = parseISODate(b.anchorDate);
    const diffDays = Math.round((from.getTime() - anchor.getTime()) / msDay);
    const steps = Math.max(0, Math.ceil(diffDays / 14));
    return new Date(anchor.getTime() + steps * 14 * msDay);
  }
  const y = from.getFullYear();
  const m = from.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const day = Math.min(b.dueDay, dim);
  const thisMonth = new Date(y, m, day);
  if (thisMonth >= new Date(y, m, from.getDate())) return thisMonth;
  const dim2 = new Date(y, m + 2, 0).getDate();
  return new Date(y, m + 1, Math.min(b.dueDay, dim2));
}

