import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicAtolls, getPublicIslands, getPublicProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const atoll = (await getPublicAtolls()).find((item) => item.slug === slug);
  if (!atoll) return { title: "Atoll not found" };
  return {
    title: `${atoll.name} Atoll`,
    description: atoll.description || `Explore islands and verified places to stay in ${atoll.name} Atoll, Maldives.`,
    alternates: { canonical: `/atolls/${atoll.slug}` },
  };
}

export default async function AtollPage({ params }: Props) {
  const { slug } = await params;
  const [atolls, islands, result] = await Promise.all([
    getPublicAtolls(),
    getPublicIslands(slug),
    getPublicProperties({ atollSlug: slug, pageSize: 6 }),
  ]);
  const atoll = atolls.find((item) => item.slug === slug);
  if (!atoll) notFound();

  return (
    <main>
      <SiteHeader />
      <div className="wm-shell py-8"><nav aria-label="Breadcrumb" className="wm-breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/destinations">Destinations</Link><span>/</span><span aria-current="page">{atoll.name}</span></nav></div>
      <section className="bg-ocean text-white">
        <div className="wm-shell py-16 md:py-20">
          <p className="wm-eyebrow wm-eyebrow--inverse">Atoll Atlas · Maldives</p>
          <h1 className="wm-home-title !text-white">{atoll.name} Atoll.</h1>
          <p className="wm-home-intro !text-white/75">{atoll.description || `Explore the islands and verified places to stay listed in ${atoll.name} Atoll.`}</p>
        </div>
      </section>
      <section className="wm-shell py-12 md:py-16">
        <div className="wm-filter-heading mb-8"><div><p className="wm-eyebrow">Geography</p><h2 className="wm-title mt-3 text-3xl">Islands in {atoll.name}</h2></div><span className="text-sm text-muted">{islands.length} listed</span></div>
        {islands.length ? <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{islands.map((island) => <article className="wm-atoll-card" key={island.id}><h3 className="wm-title text-xl"><Link href={`/islands/${island.slug}`}>{island.name}</Link></h3>{island.classification ? <p className="wm-copy mt-2 text-sm">{island.classification}</p> : null}<Link className="wm-link mt-4 inline-block text-sm font-semibold" href={`/islands/${island.slug}`}>Explore island ↗</Link></article>)}</div> : <div className="wm-empty mb-14"><p className="wm-copy">Island records for this atoll are being reviewed.</p></div>}
        <div className="wm-filter-heading mb-7"><div><p className="wm-eyebrow">Verified stays</p><h2 className="wm-title mt-3 text-3xl">Places to stay</h2></div><span className="text-sm text-muted">{result.total} listed</span></div>
        {result.properties.length ? <><div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{result.properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>{result.total > result.properties.length ? <div className="mt-8"><Link className="wm-button" href={`/hotels?atoll=${atoll.slug}`}>View all {result.total} stays in {atoll.name}</Link></div> : null}</> : <div className="wm-empty"><p className="wm-copy">No verified properties are published for this atoll yet.</p><Link className="wm-button mt-5" href="/hotels">Browse all stays</Link></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
