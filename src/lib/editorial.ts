import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type PublishedArticle = Pick<
  ArticleRow,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "body"
  | "article_type"
  | "disclosure"
  | "author_id"
  | "category_id"
  | "seo_title"
  | "seo_description"
  | "canonical_url"
  | "published_at"
  | "is_featured"
  | "hero_image_url"
  | "hero_image_alt"
  | "hero_image_credit"
  | "reading_time_minutes"
  | "created_at"
  | "updated_at"
> & {
  author: Pick<AuthorRow, "slug" | "display_name" | "bio" | "avatar_url"> | null;
  category: Pick<CategoryRow, "slug" | "name"> | null;
};

export function isEditorialConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function hydrateArticles(rows: ArticleRow[]): Promise<PublishedArticle[]> {
  if (rows.length === 0) return [];

  const supabase = await createSupabaseServerClient();
  const authorIds = [...new Set(rows.map((article) => article.author_id))];
  const categoryIds = [...new Set(rows.flatMap((article) => article.category_id ? [article.category_id] : []))];

  const [authorsResult, categoriesResult] = await Promise.all([
    supabase.from("authors").select("id,slug,display_name,bio,avatar_url").in("id", authorIds),
    categoryIds.length
      ? supabase.from("categories").select("id,slug,name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const authors = new Map((authorsResult.data ?? []).map((author) => [author.id, author]));
  const categories = new Map((categoriesResult.data ?? []).map((category) => [category.id, category]));

  return rows.map((article) => ({
    ...article,
    author: authors.get(article.author_id) ?? null,
    category: article.category_id ? categories.get(article.category_id) ?? null : null,
  }));
}

export async function getPublishedArticles(limit = 12): Promise<PublishedArticle[]> {
  if (!isEditorialConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,body,article_type,disclosure,author_id,category_id,seo_title,seo_description,canonical_url,published_at,is_featured,hero_image_url,hero_image_alt,hero_image_credit,reading_time_minutes,created_at,updated_at")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return hydrateArticles(data as ArticleRow[]);
}

export async function getPublishedArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  if (!isEditorialConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,body,article_type,disclosure,author_id,category_id,seo_title,seo_description,canonical_url,published_at,is_featured,hero_image_url,hero_image_alt,hero_image_credit,reading_time_minutes,created_at,updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  const [article] = await hydrateArticles([data as ArticleRow]);
  return article ?? null;
}
