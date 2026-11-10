import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicPropertyBySlug } from "@/lib/properties";
import { safeExternalUrl } from "@/lib/public-links";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };
  return {
    title: property.name,
    description: property.summary || `Explore ${property.name} in ${property.island.name}, ${property.atoll.name}, Maldives.`,
    alternates: { canonical: `/hotels/${property.slug}` },
    openGraph: { title: property.name, description: property.summary || undefined, images: safeExternalUrl(property.media[0]?.media_url) ? [safeExternalUrl(property.media[0]?.media_url)!] : [] },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);
  if (!property) notFound();

  const officialUrl = safeExternalUrl(property.official_website_url);
  const bookingUrl = safeExternalUrl(property.booking_url);
  const hero = property.media[0];
  const heroUrl = safeExternalUrl(hero?.media_url);
  const images = property.media.slice(1).filter((image) => safeExternalUrl(image.media_url));

  return (
    <main>
      <SiteHeader />
      <div className="wm-shell py-8">
        <nav aria-label="Breadcrumb" className="wm-breadcrumbs">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/hotels">Hotels</Link><span aria-hidden="true">/</span><span aria-current="page">{property.name}</span>
        </nav>
      </div>
      <section className="wm-shell pb-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="wm-eyebrow">{property.property_type} · {property.atoll.name}</p>
            <h1 className="wm-display mt-4">{property.name}</h1>
            {property.summary ? <p className="wm-copy mt-6 max-w-2xl text-lg">{property.summary}</p> : null}
            <p className="mt-5 text-sm text-muted"><Link className="wm-link" href={`/atolls/${property.atoll.slug}`}>{property.atoll.name}</Link> <span aria-hidden="true">·</span> <Link className="wm-link" href={`/islands/${property.island.slug}`}>{property.island.name}</Link></p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {officialUrl ? <a className="wm-button" href={officialUrl} rel="noopener noreferrer nofollow" target="_blank">Official website <span aria-hidden="true">↗</span></a> : null}
            {bookingUrl ? <a className="wm-button wm-button--quiet" href={bookingUrl} rel="noopener noreferrer nofollow" target="_blank">Booking information <span aria-hidden="true">↗</span></a> : null}
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-[1.35fr_0.65fr]">
          {hero && heroUrl ? (
            <div aria-label={hero.alt_text || property.name} className="wm-gallery-main" role="img" style={{ "--property-image": `url("${heroUrl}")` } as React.CSSProperties}>
              {hero.credit ? <span className="wm-gallery-credit">{hero.credit}</span> : null}
            </div>
          ) : (
            <div aria-label="Property photography will appear after approval" className="wm-gallery-main wm-property-media--empty" role="img" />
          )}
          <div className="grid gap-4">
            {images.length ? images.slice(0, 2).map((image) => (
              <div aria-label={image.alt_text || property.name} className="wm-gallery-small" key={image.id} role="img" style={{ "--property-image": `url("${safeExternalUrl(image.media_url)}")` } as React.CSSProperties}>
                {image.credit ? <span className="wm-gallery-credit">{image.credit}</span> : null}
              </div>
            )) : <div className="wm-panel grid place-content-center p-8"><p className="wm-eyebrow">Property gallery</p><p className="wm-copy mt-3 text-sm">Approved photography will appear here when it is available.</p></div>}
          </div>
        </div>
      </section>

      <section className="border-y border-sand bg-white">
        <div className="wm-shell grid gap-12 py-12 md:grid-cols-[1fr_0.65fr] md:py-16">
          <div>
            <p className="wm-eyebrow">About this place</p>
            <h2 className="wm-title mt-3 text-3xl">A stay in {property.island.name}.</h2>
            {property.description ? <p className="wm-copy mt-5 whitespace-pre-line">{property.description}</p> : <p className="wm-copy mt-5">A verified profile for {property.name}. Further property details will be added as they are confirmed by reliable sources.</p>}
            {property.facilities.length ? <><h3 className="mt-9 text-lg font-semibold text-ocean">Verified facilities</h3><ul className="mt-4 flex flex-wrap gap-2">{property.facilities.map((facility) => <li className="wm-chip" key={facility.id}>{facility.name}</li>)}</ul></> : null}
          </div>
          <aside className="wm-panel h-fit p-6">
            <p className="wm-eyebrow">At a glance</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div><dt className="text-muted">Property type</dt><dd className="mt-1 font-medium capitalize text-ocean">{property.property_type}</dd></div>
              <div><dt className="text-muted">Island</dt><dd className="mt-1 font-medium text-ocean"><Link className="wm-link" href={`/islands/${property.island.slug}`}>{property.island.name}</Link></dd></div>
              <div><dt className="text-muted">Atoll</dt><dd className="mt-1 font-medium text-ocean"><Link className="wm-link" href={`/atolls/${property.atoll.slug}`}>{property.atoll.name}</Link></dd></div>
              {property.address ? <div><dt className="text-muted">Address</dt><dd className="mt-1 font-medium text-ocean">{property.address}</dd></div> : null}
            </dl>
          </aside>
        </div>
      </section>
      <section className="wm-shell py-12 text-xs leading-6 text-muted">
        <p>Property details are published from verified information and approved media. This profile does not show live room rates or availability.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
