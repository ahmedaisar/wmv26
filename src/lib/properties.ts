import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseServerConfigured } from "@/lib/env";
import type { Database, PropertyType } from "@/types/database";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type AtollRow = Database["public"]["Tables"]["atolls"]["Row"];
type IslandRow = Database["public"]["Tables"]["islands"]["Row"];
type FacilityRow = Database["public"]["Tables"]["facilities"]["Row"];

type PublicPropertyRow = Pick<
  PropertyRow,
  | "id"
  | "name"
  | "slug"
  | "property_type"
  | "summary"
  | "description"
  | "atoll_id"
  | "island_id"
  | "address"
  | "latitude"
  | "longitude"
  | "official_website_url"
  | "booking_url"
  | "public_email"
  | "public_phone"
  | "is_featured"
  | "published_at"
>;

export type PublicAtoll = Pick<AtollRow, "id" | "name" | "slug" | "description">;
export type PublicIsland = Pick<IslandRow, "id" | "atoll_id" | "name" | "slug" | "description" | "classification">;
export type PublicFacility = Pick<FacilityRow, "id" | "name" | "slug" | "description">;

export type PublicPropertyMedia = {
  id: string;
  media_url: string;
  alt_text: string;
  credit: string | null;
  sort_order: number;
  focal_x: number;
  focal_y: number;
};

export type PublicProperty = PublicPropertyRow & {
  atoll: PublicAtoll;
  island: PublicIsland;
  facilities: PublicFacility[];
  media: PublicPropertyMedia[];
};

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
const PROPERTY_FIELDS =
  "id,name,slug,property_type,summary,description,atoll_id,island_id,address,latitude,longitude,official_website_url,booking_url,public_email,public_phone,is_featured,published_at";

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
    atollSlug: normalizeSlug(input.atollSlug ?? undefined),
    islandSlug: normalizeSlug(input.islandSlug ?? undefined),
    propertyType,
    facilitySlug: normalizeSlug(input.facilitySlug ?? undefined),
    slug: normalizeSlug(input.slug ?? undefined),
  };
}

function emptyResult(page: number, pageSize: number) {
  return { properties: [] as PublicProperty[], total: 0, page, pageSize };
}

export async function getPublicAtolls(): Promise<PublicAtoll[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("atolls")
    .select("id,name,slug,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return error || !data ? [] : data;
}

export async function getPublicIslands(atollSlug?: string): Promise<PublicIsland[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseServerClient();

  const atollsQuery = supabase
    .from("atolls")
    .select("id,slug")
    .eq("is_active", true);

  const { data: atolls, error: atollsError } = await atollsQuery;
  if (atollsError || !atolls?.length) return [];

  const activeAtolls = atollSlug
    ? atolls.filter((atoll) => atoll.slug === normalizeSlug(atollSlug))
    : atolls;
  const atollIds = activeAtolls.map((atoll) => atoll.id);
  if (!atollIds.length) return [];

  const { data, error } = await supabase
    .from("islands")
    .select("id,atoll_id,name,slug,description,classification")
    .eq("is_active", true)
    .in("atoll_id", atollIds)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return error || !data ? [] : data;
}

export async function getPublicFacilities(): Promise<PublicFacility[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("facilities")
    .select("id,name,slug,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return error || !data ? [] : data;
}

export async function getPublicProperties(input: PropertyDirectoryInput = {}) {
  const filters = normalizePropertyDirectoryFilters(input);
  if (!isSupabaseServerConfigured()) return emptyResult(filters.page, filters.pageSize);

  const supabase = createSupabaseServerClient();
  const [atollsResult, islandsResult] = await Promise.all([
    supabase.from("atolls").select("id,name,slug,description").eq("is_active", true),
    supabase.from("islands").select("id,atoll_id,name,slug,description,classification").eq("is_active", true),
  ]);

  if (atollsResult.error || islandsResult.error || !atollsResult.data || !islandsResult.data) {
    return emptyResult(filters.page, filters.pageSize);
  }

  const activeAtolls = filters.atollSlug
    ? atollsResult.data.filter((atoll) => atoll.slug === filters.atollSlug)
    : atollsResult.data;
  const activeAtollIds = activeAtolls.map((atoll) => atoll.id);
  if (!activeAtollIds.length) return emptyResult(filters.page, filters.pageSize);

  let activeIslands = islandsResult.data.filter((island) => activeAtollIds.includes(island.atoll_id));
  if (filters.islandSlug) {
    activeIslands = activeIslands.filter((island) => island.slug === filters.islandSlug);
  }
  const activeIslandIds = activeIslands.map((island) => island.id);
  if (!activeIslandIds.length) return emptyResult(filters.page, filters.pageSize);

  let facilityPropertyIds: string[] | null = null;
  if (filters.facilitySlug) {
    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .select("id")
      .eq("slug", filters.facilitySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (facilityError || !facility) return emptyResult(filters.page, filters.pageSize);

    const { data: associations, error: associationError } = await supabase
      .from("property_facilities")
      .select("property_id")
      .eq("facility_id", facility.id)
      .eq("is_verified", true);

    if (associationError || !associations?.length) return emptyResult(filters.page, filters.pageSize);
    facilityPropertyIds = [...new Set(associations.map((association) => association.property_id))];
    if (!facilityPropertyIds.length) return emptyResult(filters.page, filters.pageSize);
  }

  const offset = (filters.page - 1) * filters.pageSize;
  let query = supabase
    .from("properties")
    .select(PROPERTY_FIELDS, { count: "exact" })
    .eq("status", "published")
    .eq("is_active", true)
    .not("verified_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .in("atoll_id", activeAtollIds)
    .in("island_id", activeIslandIds)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .range(offset, offset + filters.pageSize - 1);

  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.slug) query = query.eq("slug", filters.slug);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  if (facilityPropertyIds) query = query.in("id", facilityPropertyIds);

  const { data, error, count } = await query;
  if (error || !data?.length) {
    return { ...emptyResult(filters.page, filters.pageSize), total: count ?? 0 };
  }

  const propertyIds = data.map((property) => property.id);
  const { data: associations } = await supabase
    .from("property_facilities")
    .select("property_id,facility_id")
    .eq("is_verified", true)
    .in("property_id", propertyIds);

  const facilityIds = [...new Set((associations ?? []).map((item) => item.facility_id))];
  const [facilitiesResult, mediaResult] = await Promise.all([
    facilityIds.length
      ? supabase.from("facilities").select("id,name,slug,description").eq("is_active", true).in("id", facilityIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("property_media")
      .select("id,property_id,media_url,alt_text,credit,sort_order,focal_x,focal_y")
      .eq("review_status", "approved")
      .not("media_url", "is", null)
      .in("property_id", propertyIds)
      .order("sort_order", { ascending: true }),
  ]);

  const atollMap = new Map(activeAtolls.map((atoll) => [atoll.id, atoll]));
  const islandMap = new Map(activeIslands.map((island) => [island.id, island]));
  const facilityMap = new Map((facilitiesResult.data ?? []).map((facility) => [facility.id, facility]));
  const facilitiesByProperty = new Map<string, PublicFacility[]>();
  for (const association of associations ?? []) {
    const facility = facilityMap.get(association.facility_id);
    if (!facility) continue;
    const current = facilitiesByProperty.get(association.property_id) ?? [];
    current.push(facility);
    facilitiesByProperty.set(association.property_id, current);
  }

  const mediaByProperty = new Map<string, PublicPropertyMedia[]>();
  for (const media of mediaResult.data ?? []) {
    if (!media.media_url) continue;
    const current = mediaByProperty.get(media.property_id) ?? [];
    current.push({
      id: media.id,
      media_url: media.media_url,
      alt_text: media.alt_text,
      credit: media.credit,
      sort_order: media.sort_order,
      focal_x: media.focal_x,
      focal_y: media.focal_y,
    });
    mediaByProperty.set(media.property_id, current);
  }

  const properties: PublicProperty[] = data.flatMap((property) => {
    const atoll = atollMap.get(property.atoll_id ?? "");
    const island = islandMap.get(property.island_id ?? "");
    if (!atoll || !island) return [];
    return [{
      ...property,
      atoll,
      island,
      facilities: facilitiesByProperty.get(property.id) ?? [],
      media: mediaByProperty.get(property.id) ?? [],
    }];
  });

  return { properties, total: count ?? properties.length, page: filters.page, pageSize: filters.pageSize };
}

export async function getPublicPropertyBySlug(slug: string): Promise<PublicProperty | null> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;
  const result = await getPublicProperties({ slug: normalizedSlug, pageSize: 1 });
  return result.properties[0] ?? null;
}
