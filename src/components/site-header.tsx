import Link from "next/link";

const links = [
  { href: "/news", label: "News" },
  { href: "/hotels", label: "Atoll Atlas" },
  { href: "/destinations", label: "Destinations" },
  { href: "/guides", label: "Travel Guides" },
  { href: "/industry", label: "Industry" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-sand/80">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-6 md:px-12">
        <Link aria-label="WheresMaldives home" className="shrink-0 text-[11px] font-bold tracking-[0.24em] text-ocean" href="/">
          WHERESMALDIVES
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[13px] text-ocean/80 lg:flex">
          {links.map((link) => (
            <Link className="transition-colors hover:text-lagoon" href={link.href} key={link.href}>{link.label}</Link>
          ))}
        </nav>
        <Link className="text-xs font-semibold text-ocean underline decoration-sand underline-offset-4 transition-colors hover:text-lagoon" href="/about">
          About
        </Link>
      </div>
      <nav aria-label="Mobile navigation" className="flex gap-6 overflow-x-auto border-t border-sand/60 px-6 py-3 text-xs text-ocean/80 lg:hidden">
        {links.map((link) => (
          <Link className="shrink-0" href={link.href} key={link.href}>{link.label}</Link>
        ))}
      </nav>
    </header>
  );
}
