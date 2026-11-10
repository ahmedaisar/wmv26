import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedArticleBySlug } from "@/lib/editorial";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";

type ArticlePageProps = { params: Promise<{ slug: string }> };

function textFromJson(value: Json): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFromJson).join(" ");
  if (value && typeof value === "object") return Object.values(value).map((part) => part ? textFromJson(part) : "").join(" ");
  return "";
}

function renderBody(body: Json) {
  if (Array.isArray(body)) {
    return body.map((node, index) => {
      if (!node || typeof node !== "object" || Array.isArray(node)) return null;
      const block = node as Record<string, Json | undefined>;
      const content = textFromJson(block.text ?? block.content ?? "");
      const key = `block-${index}`;
      if (!content.trim()) return null;
      if (block.type === "heading" || block.type === "h2") return <h2 className="mb-5 mt-12 text-3xl font-medium leading-tight tracking-[-0.04em] text-ocean" key={key}>{content}</h2>;
      if (block.type === "quote") return <blockquote className="my-10 border-l-2 border-lagoon pl-6 font-serif text-2xl leading-relaxed text-ocean" key={key}>{content}</blockquote>;
      if (block.type === "list-item") return <li className="ml-5 list-disc pl-2 text-[17px] leading-8 text-ink/90" key={key}>{content}</li>;
      return <p className="mb-6 text-[17px] leading-[1.9] text-ink/90" key={key}>{content}</p>;
    });
  }
  const content = textFromJson(body);
  return content ? <p className="mb-6 text-[17px] leading-[1.9] text-ink/90">{content}</p> : null;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Story not found" };
  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
    alternates: article.canonical_url ? { canonical: article.canonical_url } : undefined,
    openGraph: {
      type: "article",
      title: article.seo_title ?? article.title,
      description: article.seo_description ?? article.excerpt ?? undefined,
      publishedTime: article.published_at ?? undefined,
      images: article.hero_image_url ? [{ url: article.hero_image_url, alt: article.hero_image_alt ?? article.title }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const date = article.published_at
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(article.published_at))
    : "";

  return (
    <main>
      <SiteHeader />
      <article className="mx-auto max-w-[1120px] px-6 pb-24 pt-10 md:px-12 md:pt-16">
        <Link className="text-xs font-semibold text-lagoon underline decoration-sand underline-offset-4" href="/news">← Back to all stories</Link>
        <header className="mx-auto mt-12 max-w-[820px] text-center">
          <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-lagoon">
            <span>{article.category?.name ?? article.article_type.replace("_", " ")}</span>
            {date ? <><span aria-hidden="true">/</span><time dateTime={article.published_at ?? undefined}>{date}</time></> : null}
            {article.reading_time_minutes ? <><span aria-hidden="true">/</span><span>{article.reading_time_minutes} min read</span></> : null}
          </div>
          <h1 className="mt-7 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.045em] text-ocean md:text-6xl">{article.title}</h1>
          {article.excerpt ? <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted">{article.excerpt}</p> : null}
          <p className="mt-7 text-xs text-muted">By <span className="font-semibold text-ocean">{article.author?.display_name ?? "WheresMaldives Editorial"}</span></p>
          {article.disclosure !== "none" ? <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted">{article.disclosure === "sponsored" ? "Sponsored content" : "Affiliate disclosure"}</p> : null}
        </header>
        {article.hero_image_url ? (
          <figure className="mt-12">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#e2e9e4]">
              <Image alt={article.hero_image_alt ?? ""} className="object-cover" fill priority sizes="(max-width: 1120px) 100vw, 1120px" unoptimized src={article.hero_image_url} />
            </div>
            {article.hero_image_credit ? <figcaption className="mt-3 text-right text-[10px] text-muted">{article.hero_image_credit}</figcaption> : null}
          </figure>
        ) : null}
        <div className="mx-auto mt-14 max-w-[680px]">
          {renderBody(article.body)}
        </div>
        <div className="mx-auto mt-16 max-w-[680px] border-t border-sand pt-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lagoon">Continue exploring</p>
          <Link className="mt-4 inline-block text-xl font-medium text-ocean underline decoration-sand underline-offset-4 hover:text-lagoon" href="/news">More from WheresMaldives</Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
