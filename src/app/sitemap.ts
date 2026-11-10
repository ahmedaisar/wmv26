import type { MetadataRoute } from "next";

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return publicRoutes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
