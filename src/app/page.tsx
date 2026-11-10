import Link from "next/link";

const discoveryLinks = [
  {
    number: "01",
    title: "The latest",
    description: "Independent reporting and stories from across Maldives travel and hospitality.",
    href: "/news",
    label: "Read the stories",
  },
  {
    number: "02",
    title: "Places to stay",
    description: "A considered guide to resorts, hotels and guesthouses across the atolls.",
    href: "/hotels",
    label: "Explore properties",
  },
  {
    number: "03",
    title: "Know the islands",
    description: "Destination guides, local perspectives and practical travel intelligence.",
    href: "/destinations",
    label: "Discover the islands",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 md:px-12">
        <Link
          aria-label="WheresMaldives home"
          className="text-[11px] font-bold tracking-[0.24em] text-ocean"
          href="/"
        >
          WHERESMALDIVES
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-sm md:flex">
          <Link className="transition-colors hover:text-lagoon" href="/news">News</Link>
          <Link className="transition-colors hover:text-lagoon" href="/hotels">Hotels & Resorts</Link>
          <Link className="transition-colors hover:text-lagoon" href="/destinations">Destinations</Link>
          <Link className="transition-colors hover:text-lagoon" href="/guides">Travel Guides</Link>
          <Link className="transition-colors hover:text-lagoon" href="/industry">Industry</Link>
        </nav>
        <Link className="text-sm underline underline-offset-4 hover:text-lagoon" href="/about">
          About us
        </Link>
      </header>

      <section className="mx-auto grid min-h-[650px] max-w-[1440px] grid-cols-1 gap-12 px-6 pb-24 pt-16 md:grid-cols-[0.92fr_1.08fr] md:items-center md:px-12 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="mb-7 text-[10px] font-semibold uppercase tracking-[0.28em] text-lagoon">
            The Maldives. Beyond the Ordinary.
          </p>
          <h1 className="max-w-[660px] text-[clamp(3.4rem,7vw,6.8rem)] font-medium leading-[0.91] tracking-[-0.065em] text-ocean">
            A closer look at the islands.
          </h1>
          <p className="mt-8 max-w-[470px] text-base leading-8 text-muted md:text-lg">
            Independent travel stories, hospitality news and thoughtful discovery
            from across the Maldives.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            <Link
              className="border-b border-ocean pb-2 font-medium text-ocean transition-colors hover:border-lagoon hover:text-lagoon"
              href="/news"
            >
              Explore the latest stories <span aria-hidden="true">↗</span>
            </Link>
            <Link
              className="border-b border-ocean/30 pb-2 transition-colors hover:border-lagoon hover:text-lagoon"
              href="/hotels"
            >
              Discover places to stay
            </Link>
          </div>
        </div>

        <div
          aria-label="Abstract topographic composition inspired by the Maldives atolls"
          className="relative isolate min-h-[390px] overflow-hidden bg-[#d9e7e2] md:min-h-[550px]"
          role="img"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_46%,#f5f0df_0%,#e4e9d8_19%,#a9c9bd_20%,#7daea7_39%,#477f83_60%,#17495b_100%)]" />
          <div className="absolute -left-[15%] top-[12%] h-[78%] w-[130%] rotate-[-19deg] rounded-[48%] border border-white/45" />
          <div className="absolute -left-[7%] top-[22%] h-[62%] w-[116%] rotate-[-19deg] rounded-[48%] border border-white/40" />
          <div className="absolute left-[12%] top-[34%] h-[42%] w-[75%] rotate-[-19deg] rounded-[48%] border border-white/35" />
          <div className="absolute bottom-7 left-7 text-[10px] font-medium uppercase tracking-[0.24em] text-white">
            Indian Ocean · Maldives
          </div>
        </div>
      </section>

      <section aria-label="Explore WheresMaldives" className="border-t border-sand">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 md:grid-cols-3">
          {discoveryLinks.map((item) => (
            <Link
              key={item.number}
              className="group border-b border-sand p-8 transition-colors hover:bg-white md:border-b-0 md:border-r md:p-12 last:md:border-r-0"
              href={item.href}
            >
              <span className="text-[11px] tracking-[0.12em] text-lagoon">{item.number}</span>
              <h2 className="mt-14 text-[27px] font-medium tracking-[-0.035em] text-ocean">
                {item.title}
              </h2>
              <p className="mt-4 max-w-[300px] text-sm leading-7 text-muted">
                {item.description}
              </p>
              <span className="mt-9 inline-block text-xs font-semibold tracking-wide text-ocean transition-colors group-hover:text-lagoon">
                {item.label} <span aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-10 text-[11px] text-muted md:flex-row md:items-center md:justify-between md:px-12">
        <span>© {new Date().getFullYear()} WheresMaldives.com</span>
        <span>Independent Maldives travel and hospitality media.</span>
      </footer>
    </main>
  );
}
