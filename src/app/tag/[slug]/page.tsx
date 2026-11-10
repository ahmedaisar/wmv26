import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicTag } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getPublicTag(slug);
  if (!tag) return { title: "Topic not found" };
  return {
    title: tag.name,
    description: tag.description ?? `Reporting and stories tagged ${tag.name} from across the Maldives.`,
    alternates: { canonical: `/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getPublicTag(slug);
  if (!tag) notFound();
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-14 md:px-12 md:pt-20">
        <Link className="text-xs font-semibold text-lagoon underline decoration-sand underline-offset-4" href="/news">← The journal</Link>
        <header className="max-w-3xl border-b border-sand pb-9 pt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">Topic</p>
          <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] text-ocean md:text-7xl">{tag.name}</h1>
          {tag.description ? <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{tag.description}</p> : null}
        </header>
        {tag.articles.length ? (
          <section className="grid gap-x-7 gap-y-12 pt-10 md:grid-cols-2 lg:grid-cols-3" aria-label={`Stories tagged ${tag.name}`}>
            {tag.articles.map((article) => <ArticleCard article={article} key={article.id} />)}
          </section>
        ) : (
          <section className="my-16 border-y border-sand py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lagoon">No stories yet</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-ocean">This topic has no published stories.</h2>
            <Link className="mt-6 inline-block text-sm font-semibold text-ocean underline decoration-sand underline-offset-4" href="/news">Browse all stories ↗</Link>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
