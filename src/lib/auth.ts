import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AUTH_ACCESS_COOKIE,
} from "@/lib/auth-session";
import type { AppRole } from "@/types/database";

async function getVerifiedUser() {
  const accessToken = (await cookies()).get(AUTH_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getVerifiedUser();
  if (!user) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function requireRoles(allowedRoles: readonly AppRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/admin/sign-in");
  if (!allowedRoles.includes(profile.role)) redirect("/admin/access-denied");

  return profile;
}
