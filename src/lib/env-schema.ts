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
