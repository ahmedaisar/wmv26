import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicAtolls, getPublicFacilities, getPublicIslands, getPublicProperties } from "@/lib/properties";
import { buildPropertyDirectoryHref } from "@/lib/public-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maldives Hotels & Resorts",
  description: "Explore verified resorts, hotels and guesthouses across the Maldives by atoll, island and facilities.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function HotelsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = {
    search: first(params.q) ?? "",
    atollSlug: first(params.atoll) ?? "",
    islandSlug: first(params.island) ?? "",
    propertyType: first(params.type) ?? "",
    facilitySlug: first(params.facility) ?? "",
    page: first(params.page) ?? "1",
  };

  const [atolls, facilities, islands, result] = await Promise.all([
    getPublicAtolls(),
    getPublicFacilities(),
    getPublicIslands(filters.atollSlug || undefined),
    getPublicProperties(filters),
  ]);

  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
  if (result.page > pageCount) redirect(buildPropertyDirectoryHref(filters, pageCount));
  const currentPage = result.page;

  return (
    <main>
      <SiteHeader />
      <section className="bg-ocean text-white">
        <div className="wm-shell wm-atlas-intro py-16 md:py-20">
          <div>
            <p className="wm-eyebrow text-sand">The Atoll Atlas · Where to stay</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.055em] md:text-7xl">Find your place in the islands.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/75">A considered guide to verified resorts, hotels and guesthouses across the Maldives, one atoll at a time.</p>
          </div>
          <div className="border-l border-white/20 pl-6 text-sm leading-7 text-white/75">
            <p className="font-semibold text-white">Start with a place.</p>
            <p>Search a property, island or atoll, then narrow your discovery by the details that matter.</p>
          </div>
        </div>
      </section>

      <section className="wm-shell py-10 md:py-14">
        <form action="/hotels" className="wm-panel wm-filter-grid p-5 md:p-6" method="get">
          <label className="wm-field lg:col-span-1">Search
            <input className="wm-input" name="q" defaultValue={filters.search} placeholder="Search property name" type="search" />
          </label>
          <label className="wm-field">Atoll
            <select className="wm-select" name="atoll" defaultValue={filters.atollSlug}>
              <option value="">All atolls</option>
              {atolls.map((atoll) => <option key={atoll.id} value={atoll.slug}>{atoll.name}</option>)}
            </select>
          </label>
          <label className="wm-field">Island
            <select className="wm-select" name="island" defaultValue={filters.islandSlug}>
              <option value="">All islands</option>
              {islands.map((island) => <option key={island.id} value={island.slug}>{island.name}</option>)}
            </select>
          </label>
          <label className="wm-field">Property type
            <select className="wm-select" name="type" defaultValue={filters.propertyType}>
              <option value="">All stays</option><option value="resort">Resorts</option><option value="hotel">Hotels</option><option value="guesthouse">Guesthouses</option>
            </select>
          </label>
          <label className="wm-field">Facility
            <select className="wm-select" name="facility" defaultValue={filters.facilitySlug}>
              <option value="">Any facility</option>
              {facilities.map((facility) => <option key={facility.id} value={facility.slug}>{facility.name}</option>)}
            </select>
          </label>
          <div className="wm-filter-actions">
            <button className="wm-button" type="submit">Explore stays <span aria-hidden="true">↗</span></button>
            <Link className="wm-button wm-button--quiet" href="/hotels">Clear filters</Link>
          </div>
        </form>

        <div className="mb-7 mt-12 flex flex-wrap items-end justify-between gap-4">
          <div><p className="wm-eyebrow">Across the atolls</p><h2 className="wm-title mt-3 text-3xl">Places to stay</h2></div>
          <p className="text-sm text-muted">{result.total} verified {result.total === 1 ? "property" : "properties"}</p>
        </div>

        {result.properties.length ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {result.properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="wm-empty">
            <p className="wm-eyebrow">No matching stays yet</p>
            <h2 className="wm-title mt-3 text-2xl">The atlas is being carefully mapped.</h2>
            <p className="wm-copy mx-auto mt-3 max-w-xl">There are no verified properties matching these filters at the moment. Try another atoll or clear your filters. We only publish properties after their details have been checked.</p>
            <Link className="wm-button mt-6" href="/hotels">View all stays</Link>
          </div>
        )}

        {pageCount > 1 ? (
          <nav aria-label="Property directory pages" className="mt-10 flex items-center justify-between border-t border-sand pt-6">
            <span className="text-sm text-muted">Page {currentPage} of {pageCount}</span>
            <div className="flex gap-3">
              {currentPage > 1 ? <Link className="wm-button wm-button--quiet" href={buildPropertyDirectoryHref(filters, currentPage - 1)}>Previous</Link> : null}
              {currentPage < pageCount ? <Link className="wm-button" href={buildPropertyDirectoryHref(filters, currentPage + 1)}>Next</Link> : null}
            </div>
          </nav>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
