import type { PropertyDirectoryInput } from "@/lib/property-filters";

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.username || url.password) return null;
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function buildPropertyDirectoryHref(
  input: PropertyDirectoryInput,
  page: number,
): string {
  const params = new URLSearchParams();
  if (input.search?.trim()) params.set("q", input.search.trim());
  if (input.atollSlug) params.set("atoll", input.atollSlug);
  if (input.islandSlug) params.set("island", input.islandSlug);
  if (input.propertyType) params.set("type", input.propertyType);
  if (input.facilitySlug) params.set("facility", input.facilitySlug);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/hotels?${query}` : "/hotels";
}
