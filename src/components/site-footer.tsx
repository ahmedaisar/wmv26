import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 py-10 text-[11px] text-muted md:flex-row md:items-center md:justify-between md:px-12">
        <Link className="font-bold tracking-[0.2em] text-ocean" href="/">WHERESMALDIVES</Link>
        <span>Independent Maldives travel and hospitality media.</span>
        <span>© {new Date().getFullYear()} WheresMaldives.com</span>
      </div>
    </footer>
  );
}
