import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getPublicAtolls, getPublicIslands, getPublicProperties } from "@/lib/properties";

const publicRoutes = [
  "/",
  "/news",
  "/hotels",
  "/destinations",
  "/guides",
  "/industry",
  "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  const entries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  const [atolls, islands] = await Promise.all([getPublicAtolls(), getPublicIslands()]);
  for (const atoll of atolls) {
    entries.push({ url: new URL(`/atolls/${atoll.slug}`, siteUrl).toString(), changeFrequency: "monthly", priority: 0.6 });
  }
  for (const island of islands) {
    entries.push({ url: new URL(`/islands/${island.slug}`, siteUrl).toString(), changeFrequency: "monthly", priority: 0.5 });
  }

  const firstPage = await getPublicProperties({ page: 1, pageSize: 48 });
  for (const property of firstPage.properties) {
    entries.push({ url: new URL(`/hotels/${property.slug}`, siteUrl).toString(), changeFrequency: "monthly", priority: 0.6, lastModified: property.published_at ?? undefined });
  }
  const pageCount = Math.ceil(firstPage.total / firstPage.pageSize);
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await getPublicProperties({ page, pageSize: 48 });
    for (const property of result.properties) {
      entries.push({ url: new URL(`/hotels/${property.slug}`, siteUrl).toString(), changeFrequency: "monthly", priority: 0.6, lastModified: property.published_at ?? undefined });
    }
  }
  return entries;
}
