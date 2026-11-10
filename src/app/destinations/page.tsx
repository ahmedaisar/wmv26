import type { Metadata } from "next";
import { AtollCard } from "@/components/atoll-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicAtolls } from "@/lib/properties";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maldives Destinations & Atolls",
  description: "Explore the Maldives by atoll, then discover its islands and verified places to stay.",
};

export default async function DestinationsPage() {
  const atolls = await getPublicAtolls();

  return (
    <main>
      <SiteHeader />
      <section className="bg-ocean text-white">
        <div className="wm-shell py-16 md:py-20">
          <p className="wm-eyebrow wm-eyebrow--inverse">The Atoll Atlas · Geography</p>
          <h1 className="wm-home-title !text-white">Explore the Maldives, atoll by atoll.</h1>
          <p className="wm-home-intro !text-white/75">Start with the geography. Follow an atoll to its islands, then discover the verified places to stay.</p>
        </div>
      </section>
      <section className="wm-shell py-12 md:py-16">
        <div className="wm-filter-heading mb-8">
          <div><p className="wm-eyebrow">The island chain</p><h2 className="wm-title mt-3 text-3xl">Explore by atoll</h2></div>
          <p className="text-sm text-muted">{atolls.length} {atolls.length === 1 ? "atoll" : "atolls"} listed</p>
        </div>
        {atolls.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {atolls.map((atoll, index) => <AtollCard atoll={atoll} index={index} key={atoll.id} />)}
          </div>
        ) : (
          <div className="wm-empty">
            <p className="wm-eyebrow">Geography records are being prepared</p>
            <h2 className="wm-title mt-3 text-2xl">The atlas is being carefully mapped.</h2>
            <p className="wm-copy mx-auto mt-3 max-w-xl">Destination records will appear here after their names and source information have been reviewed. We do not publish guessed geography.</p>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
