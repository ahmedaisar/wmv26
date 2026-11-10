import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("normalizes spaces and punctuation", () => {
    expect(slugify("A Closer Look: Maldives Travel!")).toBe("a-closer-look-maldives-travel");
  });

  it("removes combining accents", () => {
    expect(slugify("Café & Islands")).toBe("cafe-islands");
  });

  it("returns an empty string for punctuation only", () => {
    expect(slugify("…!?")).toBe("");
  });
});
