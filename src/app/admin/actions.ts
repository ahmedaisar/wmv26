"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_EXPIRY_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/lib/auth-session";

export async function signOut() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (accessToken) {
    try {
      const supabase = createSupabaseServerClient();
      await supabase.auth.admin.signOut(accessToken, "global");
    } catch {
      // Always clear the local browser session, even if remote revocation is unavailable.
    }
  }

  cookieStore.delete(AUTH_ACCESS_COOKIE);
  cookieStore.delete(AUTH_REFRESH_COOKIE);
  cookieStore.delete(AUTH_EXPIRY_COOKIE);
  redirect("/admin/sign-in");
}
