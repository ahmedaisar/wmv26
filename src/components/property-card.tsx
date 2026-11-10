import Link from "next/link";
import type { PublicProperty } from "@/lib/properties";

function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function PropertyCard({ property }: { property: PublicProperty }) {
  const image = property.media[0];
  const imageUrl = safeImageUrl(image?.media_url);

  return (
    <article className="wm-property-card">
      <Link className="wm-property-media" href={`/hotels/${property.slug}`} aria-label={`View ${property.name}`}>
        {imageUrl ? (
          <span aria-label={image?.alt_text || property.name} className="wm-property-media wm-property-media--image" role="img" style={{ "--property-image": `url("${imageUrl}")` } as React.CSSProperties} />
        ) : (
          <span aria-label="Property image not yet available" className="wm-property-media wm-property-media--empty" role="img" />
        )}
      </Link>
      <div className="grid gap-3 p-5">
        <p className="wm-eyebrow">{property.property_type} <span aria-hidden="true">·</span> {property.atoll.name}</p>
        <h2 className="wm-title text-xl">
          <Link href={`/hotels/${property.slug}`} className="hover:text-lagoon">{property.name}</Link>
        </h2>
        <p className="wm-copy text-sm">{property.summary || `Explore this ${property.property_type} in ${property.island.name}, ${property.atoll.name}.`}</p>
        <div className="flex flex-wrap gap-2">
          <span className="wm-chip">{property.island.name}</span>
          {property.facilities.slice(0, 2).map((facility) => <span className="wm-chip" key={facility.id}>{facility.name}</span>)}
        </div>
        <Link className="wm-link w-fit text-sm font-semibold" href={`/hotels/${property.slug}`}>Explore property <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
