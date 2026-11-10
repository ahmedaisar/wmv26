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
  valid: boolean;
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
  const requestedType = input.propertyType?.trim().toLowerCase();
  const propertyType = PROPERTY_TYPES.includes(requestedType as PropertyType)
    ? (requestedType as PropertyType)
    : null;
  const hasValue = (value: string | undefined) => Boolean(value?.trim());
  const valid =
    (!hasValue(input.atollSlug) || normalizeSlug(input.atollSlug) !== null) &&
    (!hasValue(input.islandSlug) || normalizeSlug(input.islandSlug) !== null) &&
    (!hasValue(input.facilitySlug) || normalizeSlug(input.facilitySlug) !== null) &&
    (!hasValue(input.slug) || normalizeSlug(input.slug) !== null) &&
    (!hasValue(input.propertyType) || propertyType !== null);

  return {
    page: normalizePage(input.page, 1, 1000),
    pageSize: normalizePage(input.pageSize, 12, 48),
    search: escapeLikePattern(input.search?.trim().slice(0, 80) ?? ""),
    atollSlug: normalizeSlug(input.atollSlug),
    islandSlug: normalizeSlug(input.islandSlug),
    propertyType,
    facilitySlug: normalizeSlug(input.facilitySlug),
    slug: normalizeSlug(input.slug),
    valid,
  };
}
