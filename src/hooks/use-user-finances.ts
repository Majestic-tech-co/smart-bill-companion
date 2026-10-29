import { useCallback, useEffect, useRef, useState } from "react";
import type { Bill, Subscription, VariableExpense } from "@/lib/finance-types";
import { getSupabase } from "@/lib/supabase";

export interface FinanceData {
  bills: Bill[];
  income: number;
  variables: VariableExpense[];
  subs: Subscription[];
  savingsRate: number;
}

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Row {
  bills: Bill[];
  income: number;
  variables: VariableExpense[];
  subs: Subscription[];
  savings_rate: number;
}

const toData = (r: Row): FinanceData => ({
  bills: r.bills,
  income: Number(r.income),
  variables: r.variables,
  subs: r.subs,
  savingsRate: Number(r.savings_rate),
});

const toRow = (userId: string, d: FinanceData) => ({
  user_id: userId,
  bills: d.bills,
  income: d.income,
  variables: d.variables,
  subs: d.subs,
  savings_rate: d.savingsRate,
});

// Keys the app used before accounts existed, when everything lived in localStorage.
const LEGACY_KEYS = {
  bills: "sbs.bills",
  income: "sbs.income",
  variables: "sbs.variables",
  subs: "sbs.subs",
  savingsRate: "sbs.rate",
} as const;

function readLegacy(defaults: FinanceData): FinanceData | null {
  try {
    let found = false;
    const out = { ...defaults } as Record<keyof FinanceData, unknown>;
    for (const [field, key] of Object.entries(LEGACY_KEYS)) {
      const raw = window.localStorage.getItem(key);
      if (raw == null) continue;
      out[field as keyof FinanceData] = JSON.parse(raw);
      found = true;
    }
    return found ? (out as unknown as FinanceData) : null;
  } catch {
    return null;
  }
}

function clearLegacy() {
  try {
    for (const key of Object.values(LEGACY_KEYS)) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

const SAVE_DELAY_MS = 600;

// Loads the signed-in user's data from Supabase and saves changes back (debounced).
// A first-time user starts from whatever this browser had in localStorage, else from defaults.
export function useUserFinances(userId: string, defaults: FinanceData) {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const dirty = useRef(false);
  const defaultsRef = useRef(defaults);

  useEffect(() => {
    let cancelled = false;
    dirty.current = false;
    setData(null);
    setLoadError(null);

    (async () => {
      const supabase = getSupabase();
      const { data: row, error } = await supabase
        .from("user_finances")
        .select("bills, income, variables, subs, savings_rate")
        .eq("user_id", userId)
        .maybeSingle<Row>();
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        return;
      }
      if (row) {
        setData(toData(row));
        return;
      }

      const legacy = readLegacy(defaultsRef.current);
      const initial = legacy ?? defaultsRef.current;
      const { error: insertError } = await supabase
        .from("user_finances")
        .insert(toRow(userId, initial));
      if (cancelled) return;
      if (insertError) {
        setLoadError(insertError.message);
        return;
      }
      // Only the first account to sign in on this browser inherits its local data.
      if (legacy) clearLegacy();
      setData(initial);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!data || !dirty.current) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      const { error } = await getSupabase().from("user_finances").upsert(toRow(userId, data));
      setSaveState(error ? "error" : "saved");
      if (error) console.error("Failed to save finances", error);
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [data, userId]);

  const update = useCallback((patch: Partial<FinanceData>) => {
    dirty.current = true;
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return { data, loadError, saveState, update };
}
