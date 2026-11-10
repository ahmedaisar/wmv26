import type { PropertyType } from "@/types/database";

export type PropertyDirectoryInput = {
  page?: number | string;
  pageSize?: number | string;
  search?: string;
  atollSlug?: string;
  islandSlug?: string;
  propertyType?: string;
  facilitySlug?: string;
  slug?: string;
};

export type NormalizedPropertyDirectoryFilters = {
  page: number;
  pageSize: number;
  search: string;
  atollSlug: string | null;
  islandSlug: string | null;
  propertyType: PropertyType | null;
  facilitySlug: string | null;
  slug: string | null;
};

const PROPERTY_TYPES: readonly PropertyType[] = ["resort", "hotel", "guesthouse"];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizePage(value: number | string | undefined, fallback: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

function normalizeSlug(value: string | undefined): string | null {
  const slug = value?.trim().toLowerCase() ?? "";
  return SLUG_PATTERN.test(slug) ? slug : null;
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function normalizePropertyDirectoryFilters(
  input: PropertyDirectoryInput = {},
): NormalizedPropertyDirectoryFilters {
  const propertyType = PROPERTY_TYPES.includes(input.propertyType as PropertyType)
    ? (input.propertyType as PropertyType)
    : null;

  return {
    page: normalizePage(input.page, 1, 1000),
    pageSize: normalizePage(input.pageSize, 12, 48),
    search: escapeLikePattern(input.search?.trim().slice(0, 80) ?? ""),
    atollSlug: normalizeSlug(input.atollSlug),
    islandSlug: normalizeSlug(input.islandSlug),
    propertyType,
    facilitySlug: normalizeSlug(input.facilitySlug),
    slug: normalizeSlug(input.slug),
  };
}
