"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRoles } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authorSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  slug: z.string().trim().max(100).optional(),
  bio: z.string().trim().max(600).optional(),
  profileId: z.union([z.string().uuid(), z.literal("")]).optional(),
});

export async function createAuthor(formData: FormData) {
  await requireRoles(["admin", "editor"]);

  const parsed = authorSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    profileId: String(formData.get("profileId") ?? ""),
  });

  if (!parsed.success) redirect("/admin/authors/new?error=invalid");

  const slug = parsed.data.slug || slugify(parsed.data.displayName);
  if (!slug) redirect("/admin/authors/new?error=invalid");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("authors").insert({
    display_name: parsed.data.displayName,
    slug,
    bio: parsed.data.bio || null,
    profile_id: parsed.data.profileId || null,
    is_active: true,
  });

  if (error) redirect("/admin/authors/new?error=save");

  revalidatePath("/admin/authors");
  revalidatePath("/admin/articles/new");
  redirect("/admin/authors?created=1");
}
