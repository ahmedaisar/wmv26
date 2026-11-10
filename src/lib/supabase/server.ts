import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const REQUEST_TIMEOUT_MS = 10_000;

export function createSupabaseServerClient() {
  const { url, secretKey } = getSupabaseServerEnv();

  return createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) => {
        const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
        const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
        return fetch(input, { ...init, cache: "no-store", signal });
      },
    },
  });
}
