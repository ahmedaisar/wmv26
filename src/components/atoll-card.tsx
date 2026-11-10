import Link from "next/link";
import type { PublicAtoll } from "@/lib/properties";

export function AtollCard({ atoll, index }: { atoll: PublicAtoll; index: number }) {
  return (
    <article className="wm-atoll-card">
      <span className="wm-atoll-index">{String(index + 1).padStart(2, "0")}</span>
      <div className="grid gap-3">
        <h2 className="wm-title text-2xl"><Link href={`/atolls/${atoll.slug}`}>{atoll.name}</Link></h2>
        <p className="wm-copy text-sm">{atoll.description || "Explore islands and verified stays in this atoll."}</p>
        <Link className="wm-link w-fit text-sm font-semibold" href={`/atolls/${atoll.slug}`}>Explore atoll <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  );
}
