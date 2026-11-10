import { z } from "zod";

const supabaseEnvSchema = z.object({
  url: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  anonKey: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

export type SupabasePublicEnv = z.infer<typeof supabaseEnvSchema>;

export function parseSupabasePublicEnv(input: {
  url?: string;
  anonKey?: string;
}): SupabasePublicEnv {
  return supabaseEnvSchema.parse(input);
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return parseSupabasePublicEnv({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
