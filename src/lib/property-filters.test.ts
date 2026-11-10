import { describe, expect, it } from "vitest";
import { normalizePropertyDirectoryFilters } from "./property-filters";

describe("normalizePropertyDirectoryFilters", () => {
  it("applies bounded pagination defaults", () => {
    expect(normalizePropertyDirectoryFilters()).toMatchObject({
      page: 1,
      pageSize: 12,
      search: "",
    });
    expect(normalizePropertyDirectoryFilters({ page: "0", pageSize: "500" })).toMatchObject({
      page: 1,
      pageSize: 48,
    });
    expect(normalizePropertyDirectoryFilters({ page: "not-a-number", pageSize: 24 })).toMatchObject({
      page: 1,
      pageSize: 24,
    });
  });

  it("normalizes valid slugs and rejects malformed values", () => {
    expect(
      normalizePropertyDirectoryFilters({
        atollSlug: "  North-Male  ",
        islandSlug: "Maafushi",
        facilitySlug: "pool",
        slug: "sample-property",
      }),
    ).toMatchObject({
      atollSlug: "north-male",
      islandSlug: "maafushi",
      facilitySlug: "pool",
      slug: "sample-property",
    });

    expect(
      normalizePropertyDirectoryFilters({ atollSlug: "../private", islandSlug: "North Male" }),
    ).toMatchObject({ atollSlug: null, islandSlug: null, valid: false });
  });

  it("accepts only known property types", () => {
    expect(normalizePropertyDirectoryFilters({ propertyType: "resort" }).propertyType).toBe("resort");
    expect(normalizePropertyDirectoryFilters({ propertyType: "RESORT" }).propertyType).toBe("resort");
    expect(normalizePropertyDirectoryFilters({ propertyType: "villa" })).toMatchObject({
      propertyType: null,
      valid: false,
    });
  });

  it("trims, bounds and escapes search terms", () => {
    const result = normalizePropertyDirectoryFilters({
      search: "  100% island_view\\escape  ",
    });
    expect(result.search).toBe("100\\% island\\_view\\\\escape");
    expect(normalizePropertyDirectoryFilters({ search: "x".repeat(120) }).search).toHaveLength(80);
  });
});
