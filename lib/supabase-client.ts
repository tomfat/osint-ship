import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

type AllowedSupabaseKey = string & { __brand: "SupabaseKey" };

function resolveSupabaseKey(): AllowedSupabaseKey {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  const key = serviceRoleKey ?? anonKey;
  if (!key) {
    throw new Error("Supabase key is not configured. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY.");
  }

  return key as AllowedSupabaseKey;
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  const key = resolveSupabaseKey();

  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "osint-ship/0.1.0",
      },
    },
  });

  return cachedClient;
}
