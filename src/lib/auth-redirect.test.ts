import { describe, expect, it } from "vitest";
import { safeInternalRedirect } from "./auth-redirect";

describe("safeInternalRedirect", () => {
  it("preserves a local path, query and hash", () => {
    expect(safeInternalRedirect("/admin/articles?status=draft#list")).toBe("/admin/articles?status=draft#list");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeInternalRedirect("https://attacker.example")).toBe("/admin");
    expect(safeInternalRedirect("//attacker.example")).toBe("/admin");
  });

  it("rejects non-path values", () => {
    expect(safeInternalRedirect("admin")).toBe("/admin");
  });
});
