import { describe, expect, it } from "vitest";
import { buildPropertyDirectoryHref, safeExternalUrl } from "@/lib/public-links";

describe("safeExternalUrl", () => {
  it("accepts http and https URLs", () => {
    expect(safeExternalUrl("https://example.com/stay")).toBe("https://example.com/stay");
    expect(safeExternalUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsafe and malformed URLs", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,hello")).toBeNull();
    expect(safeExternalUrl("not a url")).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
  });
});

describe("buildPropertyDirectoryHref", () => {
  it("preserves filters when moving between pages", () => {
    expect(buildPropertyDirectoryHref({
      search: "reef & lagoon",
      atollSlug: "north-male",
      islandSlug: "thulusdhoo",
      propertyType: "resort",
      facilitySlug: "diving",
    }, 2)).toBe("/hotels?q=reef+%26+lagoon&atoll=north-male&island=thulusdhoo&type=resort&facility=diving&page=2");
  });

  it("omits empty filters and the first page", () => {
    expect(buildPropertyDirectoryHref({}, 1)).toBe("/hotels");
  });
});
