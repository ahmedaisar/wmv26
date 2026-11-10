import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const publicRoutes = [
  "/",
  "/news",
  "/hotels",
  "/destinations",
  "/guides",
  "/industry",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  return publicRoutes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
