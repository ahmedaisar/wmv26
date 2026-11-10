import { z } from "zod";

const supabaseServerEnvSchema = z.object({
  url: z.string().url("SUPABASE_URL must be a valid URL"),
  secretKey: z.string().min(1, "SUPABASE_SECRET_KEY is required"),
});

export type SupabaseServerEnv = z.infer<typeof supabaseServerEnvSchema>;

export function parseSupabaseServerEnv(input: {
  url?: string;
  secretKey?: string;
}): SupabaseServerEnv {
  return supabaseServerEnvSchema.parse(input);
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  return parseSupabaseServerEnv({
    // Keep the URL-only legacy fallback during the environment transition.
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
