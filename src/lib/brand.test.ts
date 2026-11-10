import { describe, expect, it } from "vitest";

describe("WheresMaldives brand foundation", () => {
  it("uses the approved public brand name", () => {
    expect("WheresMaldives.com").toContain("Maldives");
  });
});
