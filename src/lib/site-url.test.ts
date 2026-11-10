import { describe, expect, it } from "vitest";
import { getSiteUrl, getSiteUrlString } from "./site-url";

describe("site URL configuration", () => {
  it("uses the canonical site URL when the environment value is missing", () => {
    expect(getSiteUrlString(undefined)).toBe("https://wheresmaldives.com");
  });

  it("uses the canonical site URL when the environment value is empty", () => {
    expect(getSiteUrlString("")).toBe("https://wheresmaldives.com");
  });

  it("uses the canonical site URL when the environment value is whitespace", () => {
    expect(getSiteUrlString("   ")).toBe("https://wheresmaldives.com");
  });

  it("uses the canonical site URL for malformed values", () => {
    expect(getSiteUrlString("not a valid URL")).toBe("https://wheresmaldives.com");
  });

  it("rejects non-http protocols and falls back to the canonical site URL", () => {
    expect(getSiteUrlString("javascript:alert(1)")).toBe("https://wheresmaldives.com");
  });

  it("preserves a valid configured deployment URL", () => {
    expect(getSiteUrlString("https://preview.example.com/")).toBe("https://preview.example.com");
  });

  it("returns a URL object for metadataBase consumers", () => {
    expect(getSiteUrl("https://preview.example.com").origin).toBe("https://preview.example.com");
  });
});
