import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicAtolls, getPublicIslands, getPublicProperties } from "@/lib/properties";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getIslandContext(slug: string) {
  const [atolls, islands] = await Promise.all([getPublicAtolls(), getPublicIslands()]);
  const island = islands.find((item) => item.slug === slug);
  if (!island) return null;
  const atoll = atolls.find((item) => item.id === island.atoll_id);
  return atoll ? { island, atoll } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const context = await getIslandContext(slug);
  if (!context) return { title: "Island not found" };
  return {
    title: `${context.island.name}, Maldives`,
    description: context.island.description || `Explore verified places to stay on ${context.island.name}, in ${context.atoll.name} Atoll, Maldives.`,
    alternates: { canonical: `/islands/${context.island.slug}` },
  };
}

export default async function IslandPage({ params }: Props) {
  const { slug } = await params;
  const context = await getIslandContext(slug);
  if (!context) notFound();
  const { island, atoll } = context;
  const result = await getPublicProperties({ atollSlug: atoll.slug, islandSlug: island.slug, pageSize: 48 });

  return (
    <main>
      <SiteHeader />
      <div className="wm-shell py-8"><nav aria-label="Breadcrumb" className="wm-breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/destinations">Destinations</Link><span>/</span><Link href={`/atolls/${atoll.slug}`}>{atoll.name}</Link><span>/</span><span aria-current="page">{island.name}</span></nav></div>
      <section className="bg-ocean text-white">
        <div className="wm-shell py-16 md:py-20">
          <p className="wm-eyebrow wm-eyebrow--inverse">{atoll.name} Atoll · Island guide</p>
          <h1 className="wm-home-title !text-white">{island.name}.</h1>
          <p className="wm-home-intro !text-white/75">{island.description || `Explore verified stays and published information for ${island.name}, Maldives.`}</p>
        </div>
      </section>
      <section className="wm-shell py-12 md:py-16">
        <div className="wm-filter-heading mb-7"><div><p className="wm-eyebrow">Places to stay</p><h2 className="wm-title mt-3 text-3xl">Verified properties</h2></div><span className="text-sm text-muted">{result.total} listed</span></div>
        {result.properties.length ? <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{result.properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <div className="wm-empty"><p className="wm-copy">No verified properties are published for this island yet.</p><Link className="wm-button mt-5" href="/hotels">Browse all stays</Link></div>}
      </section>
      <SiteFooter />
    </main>
  );
}
