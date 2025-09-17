import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cachedClient: SupabaseClient<Database> | undefined;

function resolveSupabaseKey(): string {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (serviceKey) {
    return serviceKey;
  }

  if (anonKey) {
    return anonKey;
  }

  throw new Error("Missing Supabase credentials. Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
}

export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (typeof window !== "undefined") {
    throw new Error("Supabase server client must not be instantiated in the browser.");
  }

  if (!cachedClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
    }

    const key = resolveSupabaseKey();
    cachedClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}
