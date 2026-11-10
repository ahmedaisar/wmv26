"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeInternalRedirect } from "@/lib/auth-redirect";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next")?.toString() || undefined,
  });

  if (!parsed.success) redirect("/admin/sign-in?error=invalid");

  const destination = safeInternalRedirect(parsed.data.next);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect("/admin/sign-in?error=invalid&next=" + encodeURIComponent(destination));
  }

  redirect(destination);
}
