import "server-only";

import { parseSupabaseServerEnv } from "@/lib/env-schema";

export { parseSupabaseServerEnv } from "@/lib/env-schema";
export type { SupabaseServerEnv } from "@/lib/env-schema";

export function getSupabaseServerEnv() {
  return parseSupabaseServerEnv({
    // The URL-only legacy fallback is safe to retain during environment migration.
    url: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}
