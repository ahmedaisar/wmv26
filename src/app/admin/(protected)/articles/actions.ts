"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRoles } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleDisclosure, ArticleType, Json } from "@/types/database";

const articleSchema = z.object({
  title: z.string().trim().min(5).max(180),
  slug: z.string().trim().max(180).optional(),
  excerpt: z.string().trim().max(280).optional(),
  body: z.string().max(60000).optional(),
  articleType: z.enum(["news", "feature", "interview", "guide", "press_release"]),
  disclosure: z.enum(["none", "sponsored", "affiliate"]).optional(),
  authorId: z.string().uuid(),
  categoryId: z.string().optional(),
  seoTitle: z.string().trim().max(100).optional(),
  seoDescription: z.string().trim().max(200).optional(),
});

const formValue = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

export async function createArticleDraft(formData: FormData) {
  const profile = await requireRoles(["admin", "editor", "journalist", "contributor"]);

  const parsed = articleSchema.safeParse({
    title: formValue(formData, "title"),
    slug: formValue(formData, "slug"),
    excerpt: formValue(formData, "excerpt"),
    body: String(formData.get("body") ?? ""),
    articleType: formValue(formData, "articleType") || "news",
    disclosure: formValue(formData, "disclosure") || "none",
    authorId: formValue(formData, "authorId"),
    categoryId: formValue(formData, "categoryId"),
    seoTitle: formValue(formData, "seoTitle"),
    seoDescription: formValue(formData, "seoDescription"),
  });

  if (!parsed.success) {
    redirect("/admin/articles/new?error=invalid");
  }

  const slug = parsed.data.slug || slugify(parsed.data.title);
  if (!slug) redirect("/admin/articles/new?error=invalid");

  const paragraphs = (parsed.data.body ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const body: Json = {
    type: "doc",
    content: paragraphs.map((paragraph) => ({
      type: "paragraph",
      content: [{ type: "text", text: paragraph }],
    })),
  };

  const disclosure: ArticleDisclosure =
    profile.role === "admin" || profile.role === "editor"
      ? (parsed.data.disclosure ?? "none")
      : "none";

  const supabase = await createSupabaseServerClient();
  const { data: articleId, error } = await supabase.rpc("create_article_draft", {
    p_title: parsed.data.title,
    p_slug: slug,
    p_author_id: parsed.data.authorId,
    p_excerpt: parsed.data.excerpt || null,
    p_body: body,
    p_article_type: parsed.data.articleType as ArticleType,
    p_disclosure: disclosure,
    p_category_id: parsed.data.categoryId || null,
    p_seo_title: parsed.data.seoTitle || null,
    p_seo_description: parsed.data.seoDescription || null,
  });

  if (error || !articleId) {
    redirect("/admin/articles/new?error=save");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?created=1");
}

export async function transitionArticle(formData: FormData) {
  const profile = await requireRoles(["admin", "editor", "journalist", "contributor"]);
  const articleId = String(formData.get("articleId") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 1000);

  const parsed = z.object({
    articleId: z.string().uuid(),
    toStatus: z.enum(["draft", "in_review", "approved", "published", "archived"]),
  }).safeParse({ articleId, toStatus });

  if (!parsed.success) redirect("/admin/articles?error=transition");

  if (parsed.data.toStatus === "in_review") {
    if (profile.role !== "journalist" && profile.role !== "contributor") {
      redirect("/admin/articles?error=transition");
    }
  } else if (profile.role !== "admin" && profile.role !== "editor") {
    redirect("/admin/articles?error=transition");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("transition_article", {
    p_article_id: parsed.data.articleId,
    p_to_status: parsed.data.toStatus,
    p_scheduled_at: null,
    p_note: note || null,
  });

  if (error) redirect("/admin/articles?error=transition");

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}
