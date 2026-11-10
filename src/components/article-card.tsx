import Image from "next/image";
import Link from "next/link";
import type { PublishedArticle } from "@/lib/editorial";

function formatDate(value: string | null) {
  if (!value) return "Recently published";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function ArticleCard({ article, featured = false }: { article: PublishedArticle; featured?: boolean }) {
  return (
    <article className={featured ? "group" : "group border-t border-sand pt-6"}>
      <Link className="block" href={`/news/${article.slug}`}>
        {article.hero_image_url ? (
          <div className={`relative mb-5 overflow-hidden bg-[#e2e9e4] ${featured ? "aspect-[16/10]" : "aspect-[5/3]"}`}>
            <Image
              alt={article.hero_image_alt ?? ""}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              fill
              unoptimized
              sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
              src={article.hero_image_url}
            />
          </div>
        ) : (
          <div aria-hidden="true" className={`mb-5 flex items-end bg-[#e2e9e4] p-5 text-[10px] uppercase tracking-[0.2em] text-ocean/70 ${featured ? "aspect-[16/10]" : "aspect-[5/3]"}`}>
            Maldives · Editorial
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-lagoon">
          <span>{article.category?.name ?? article.article_type.replace("_", " ")}</span>
          <span aria-hidden="true" className="text-sand">/</span>
          <time dateTime={article.published_at ?? undefined}>{formatDate(article.published_at)}</time>
        </div>
        <h2 className={`mt-3 font-medium leading-[1.08] tracking-[-0.04em] text-ocean transition-colors group-hover:text-lagoon ${featured ? "text-3xl md:text-5xl" : "text-2xl"}`}>
          {article.title}
        </h2>
        {article.excerpt ? <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{article.excerpt}</p> : null}
        <div className="mt-5 flex items-center gap-3 text-[11px] text-muted">
          <span>{article.author?.display_name ?? "WheresMaldives Editorial"}</span>
          {article.reading_time_minutes ? <><span aria-hidden="true">·</span><span>{article.reading_time_minutes} min read</span></> : null}
        </div>
      </Link>
    </article>
  );
}
