import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);

// Created lazily and only in the browser: the session lives in localStorage,
// so server-side rendering never touches auth.
let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
