import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublishedArticle } from "@/lib/editorial";
import type { Database } from "@/types/database";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
const articleFields = "id,slug,title,excerpt,body,article_type,disclosure,author_id,category_id,seo_title,seo_description,canonical_url,published_at,is_featured,hero_image_url,hero_image_alt,hero_image_credit,reading_time_minutes,created_at,updated_at";

async function hydrate(rows: ArticleRow[]): Promise<PublishedArticle[]> {
  if (!rows.length) return [];
  const supabase = await createSupabaseServerClient();
  const authorIds = [...new Set(rows.map((row) => row.author_id))];
  const categoryIds = [...new Set(rows.flatMap((row) => row.category_id ? [row.category_id] : []))];
  const [authorResult, categoryResult] = await Promise.all([
    supabase.from("authors").select("id,slug,display_name,bio,avatar_url").in("id", authorIds),
    categoryIds.length
      ? supabase.from("categories").select("id,slug,name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const authors = new Map((authorResult.data ?? []).map((item) => [item.id, item]));
  const categories = new Map((categoryResult.data ?? []).map((item) => [item.id, item]));
  return rows.map((row) => ({
    ...row,
    author: authors.get(row.author_id) ?? null,
    category: row.category_id ? categories.get(row.category_id) ?? null : null,
  }));
}

async function publishedBy(column: "category_id" | "author_id", id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select(articleFields)
    .eq(column, id)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(24);
  if (error || !data) return [];
  return hydrate(data as ArticleRow[]);
}

export async function getPublicCategory(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("categories")
    .select("id,slug,name,description")
    .eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data) return null;
  return { ...data, articles: await publishedBy("category_id", data.id) };
}

export async function getPublicTag(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data: tag } = await supabase.from("tags")
    .select("id,slug,name,description")
    .eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!tag) return null;
  const { data: links, error } = await supabase.from("article_tags")
    .select("article_id").eq("tag_id", tag.id);
  if (error || !links?.length) return { ...tag, articles: [] as PublishedArticle[] };
  const articleIds = [...new Set(links.map((link) => link.article_id))];
  const { data: rows, error: articleError } = await supabase.from("articles")
    .select(articleFields).in("id", articleIds)
    .eq("status", "published").lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false }).limit(24);
  return { ...tag, articles: articleError || !rows ? [] : await hydrate(rows as ArticleRow[]) };
}

export async function getPublicAuthor(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("authors")
    .select("id,slug,display_name,bio,avatar_url")
    .eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!data) return null;
  return { ...data, articles: await publishedBy("author_id", data.id) };
}
