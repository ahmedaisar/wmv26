import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicAuthor } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getPublicAuthor(slug);
  if (!author) return { title: "Author not found" };
  return {
    title: author.display_name,
    description: author.bio ?? `Stories and reporting by ${author.display_name} for WheresMaldives.`,
    alternates: { canonical: `/authors/${author.slug}` },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getPublicAuthor(slug);
  if (!author) notFound();
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-14 md:px-12 md:pt-20">
        <Link className="text-xs font-semibold text-lagoon underline decoration-sand underline-offset-4" href="/news">← The journal</Link>
        <header className="flex max-w-4xl flex-col gap-7 border-b border-sand pb-10 pt-12 sm:flex-row sm:items-center">
          {author.avatar_url ? (
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-[#e2e9e4]">
              <Image alt="" className="object-cover" fill sizes="112px" unoptimized src={author.avatar_url} />
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">Contributors & newsroom</p>
            <h1 className="mt-3 text-5xl font-medium tracking-[-0.06em] text-ocean md:text-7xl">{author.display_name}</h1>
            {author.bio ? <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{author.bio}</p> : null}
          </div>
        </header>
        <section className="pt-10" aria-label={`Stories by ${author.display_name}`}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-ocean">Stories by {author.display_name}</h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{author.articles.length} recent stories</span>
          </div>
          {author.articles.length ? (
            <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {author.articles.map((article) => <ArticleCard article={article} key={article.id} />)}
            </div>
          ) : (
            <div className="border-y border-sand py-16">
              <h3 className="text-3xl font-medium tracking-[-0.04em] text-ocean">No published stories yet.</h3>
              <p className="mt-4 text-sm text-muted">New work from this contributor will appear here.</p>
            </div>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
