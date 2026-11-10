"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_EXPIRY_COOKIE,
  AUTH_REFRESH_COOKIE,
  authCookieOptions,
} from "@/lib/auth-session";
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
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session) {
    redirect("/admin/sign-in?error=invalid&next=" + encodeURIComponent(destination));
  }

  const expiresAt =
    data.session.expires_at ?? Math.floor(Date.now() / 1000) + data.session.expires_in;
  const cookieStore = await cookies();
  cookieStore.set(
    AUTH_ACCESS_COOKIE,
    data.session.access_token,
    authCookieOptions(data.session.expires_in),
  );
  cookieStore.set(
    AUTH_REFRESH_COOKIE,
    data.session.refresh_token,
    authCookieOptions(60 * 60 * 24 * 30),
  );
  cookieStore.set(
    AUTH_EXPIRY_COOKIE,
    String(expiresAt),
    authCookieOptions(data.session.expires_in),
  );

  redirect(destination);
}
