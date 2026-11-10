import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicCategory } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategory(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description ?? `The latest Maldives reporting and stories in ${category.name}.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getPublicCategory(slug);
  if (!category) notFound();
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-14 md:px-12 md:pt-20">
        <Link className="text-xs font-semibold text-lagoon underline decoration-sand underline-offset-4" href="/news">← The journal</Link>
        <header className="max-w-3xl border-b border-sand pb-9 pt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">Explore a subject</p>
          <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] text-ocean md:text-7xl">{category.name}</h1>
          {category.description ? <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{category.description}</p> : null}
        </header>
        {category.articles.length ? (
          <section className="grid gap-x-7 gap-y-12 pt-10 md:grid-cols-2 lg:grid-cols-3" aria-label={`${category.name} stories`}>
            {category.articles.map((article) => <ArticleCard article={article} key={article.id} />)}
          </section>
        ) : (
          <section className="my-16 border-y border-sand py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lagoon">A story is taking shape</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-ocean">No published stories in this subject yet.</h2>
            <p className="mt-4 text-sm text-muted">Explore the latest reporting while our newsroom prepares its next stories.</p>
            <Link className="mt-6 inline-block text-sm font-semibold text-ocean underline decoration-sand underline-offset-4" href="/news">Browse all stories ↗</Link>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
