export type BillStatus = "paid" | "pending" | "overdue";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // day of month 1-31
  status: BillStatus;
  category?: string;
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
