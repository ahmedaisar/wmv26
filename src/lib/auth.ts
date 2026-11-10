import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/database";

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function requireRoles(allowedRoles: readonly AppRole[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/sign-in");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !allowedRoles.includes(profile.role)) {
    redirect("/admin/access-denied");
  }

  return profile;
}
