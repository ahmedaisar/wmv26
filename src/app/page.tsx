import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedArticles } from "@/lib/editorial";

export const dynamic = "force-dynamic";

const discoveryLinks = [
  { number: "01", title: "The latest", description: "Independent reporting and stories from across Maldives travel and hospitality.", href: "/news", label: "Read the stories" },
  { number: "02", title: "Places to stay", description: "A considered guide to resorts, hotels and guesthouses across the atolls.", href: "/hotels", label: "Explore properties" },
  { number: "03", title: "Know the islands", description: "Destination guides, local perspectives and practical travel intelligence.", href: "/destinations", label: "Discover the islands" },
];

export default async function HomePage() {
  const articles = await getPublishedArticles(4);
  const [lead, ...more] = articles;

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto grid min-h-[620px] max-w-[1440px] grid-cols-1 gap-12 px-6 pb-20 pt-16 md:grid-cols-[0.92fr_1.08fr] md:items-center md:px-12 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="mb-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-lagoon">THE MALDIVES · THE ATOLL ATLAS</p>
          <h1 className="max-w-[660px] text-[clamp(3.4rem,7vw,6.8rem)] font-medium leading-[0.91] tracking-[-0.065em] text-ocean">Find your place in the islands.</h1>
          <p className="mt-8 max-w-[470px] text-base leading-8 text-muted md:text-lg">A considered guide to verified resorts, hotels and guesthouses across the Maldives, one atoll at a time.</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            <form action="/hotels" className="mt-2 flex w-full max-w-xl flex-col gap-3 sm:flex-row" method="get"><label className="sr-only" htmlFor="atlas-search">Search a property, island or atoll</label><input className="wm-input min-w-0 flex-1" id="atlas-search" name="q" placeholder="Search a property name" type="search" /><button className="wm-button" type="submit">Explore stays <span aria-hidden="true">↗</span></button></form>
            <Link className="mt-4 w-fit border-b border-ocean/30 pb-2 text-sm transition-colors hover:border-lagoon hover:text-lagoon" href="/news">Read the latest stories</Link>
          </div>
        </div>
        <div aria-label="Abstract topographic composition inspired by the Maldives atolls" className="wm-atlas-illustration relative isolate min-h-[390px] overflow-hidden md:min-h-[550px]" role="img">
          <div className="wm-atlas-water absolute inset-0" />
          <div className="wm-atlas-ring wm-atlas-ring--one absolute" />
          <div className="wm-atlas-ring wm-atlas-ring--two absolute" />
          <div className="wm-atlas-ring wm-atlas-ring--three absolute" />
          <div className="absolute bottom-7 left-7 text-[10px] font-medium uppercase tracking-[0.24em] text-white">Indian Ocean · Maldives</div>
        </div>
      </section>

      {lead ? (
        <section className="border-y border-sand bg-white/50">
          <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-12">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lagoon">From the newsroom</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] text-ocean">The stories shaping the islands.</h2></div>
              <Link className="shrink-0 text-xs font-semibold text-ocean underline decoration-sand underline-offset-4 hover:text-lagoon" href="/news">All stories ↗</Link>
            </div>
            <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
              <ArticleCard article={lead} featured />
              <div className="grid content-start gap-8">{more.map((article) => <ArticleCard article={article} key={article.id} />)}</div>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label="Explore WheresMaldives" className="border-t border-sand">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-3">
          {discoveryLinks.map((item) => (
            <Link className="group border-b border-sand p-8 transition-colors hover:bg-white md:border-b-0 md:border-r md:p-12 last:md:border-r-0" href={item.href} key={item.number}>
              <span className="text-[11px] tracking-[0.12em] text-lagoon">{item.number}</span>
              <h2 className="mt-14 text-[27px] font-medium tracking-[-0.035em] text-ocean">{item.title}</h2>
              <p className="mt-4 max-w-[300px] text-sm leading-7 text-muted">{item.description}</p>
              <span className="mt-9 inline-block text-xs font-semibold tracking-wide text-ocean transition-colors group-hover:text-lagoon">{item.label} <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
