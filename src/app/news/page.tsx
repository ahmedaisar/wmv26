import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedArticles } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maldives Travel & Hospitality News",
  description: "Independent reporting, hotel openings, hospitality intelligence and island stories from across the Maldives.",
};

export default async function NewsPage() {
  const articles = await getPublishedArticles(24);
  const [lead, ...more] = articles;

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-14 md:px-12 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-sand pb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-lagoon">The WheresMaldives Journal</p>
            <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] text-ocean md:text-7xl">The latest.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted">News, perspectives and considered stories from across the Maldivian travel and hospitality landscape.</p>
          </div>
          <Link className="pb-1 text-xs font-semibold text-ocean underline decoration-sand underline-offset-4 hover:text-lagoon" href="/">Back to the journal home</Link>
        </div>

        {lead ? (
          <>
            <section aria-label="Lead story" className="grid gap-10 py-10 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-14">
              <ArticleCard article={lead} featured />
              <div className="border-t border-sand pt-6 md:border-t-0 md:border-l md:pl-9">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lagoon">From the newsroom</p>
                <h2 className="mt-5 text-3xl font-medium leading-tight tracking-[-0.04em] text-ocean">A clearer view of the islands.</h2>
                <p className="mt-4 text-sm leading-7 text-muted">Independent reporting and useful travel intelligence, with the people and places of the Maldives at the centre.</p>
              </div>
            </section>
            {more.length ? (
              <section className="border-t border-sand pt-9">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-medium tracking-tight text-ocean">More stories</h2>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted">{more.length} stories</span>
                </div>
                <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                  {more.map((article) => <ArticleCard article={article} key={article.id} />)}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="my-16 border-y border-sand py-20 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lagoon">The newsroom is preparing</p>
            <h2 className="mx-auto mt-5 max-w-xl text-3xl font-medium tracking-[-0.04em] text-ocean md:text-4xl">Good stories take a little groundwork.</h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted">There are no published stories yet. Our first reporting will appear here as soon as it is ready.</p>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
