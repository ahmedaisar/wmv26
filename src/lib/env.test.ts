import { describe, expect, it } from "vitest";
import { parseSupabasePublicEnv } from "./env";

describe("Supabase public environment", () => {
  it("accepts a project URL and anon key", () => {
    expect(
      parseSupabasePublicEnv({
        url: "https://project-ref.supabase.co",
        anonKey: "public-anon-key",
      }),
    ).toEqual({
      url: "https://project-ref.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("rejects a missing URL", () => {
    expect(() => parseSupabasePublicEnv({ anonKey: "public-anon-key" })).toThrow();
  });

  it("rejects an invalid URL", () => {
    expect(
      () => parseSupabasePublicEnv({ url: "not-a-url", anonKey: "public-anon-key" }),
    ).toThrow();
  });

  it("rejects an empty key", () => {
    expect(
      () =>
        parseSupabasePublicEnv({
          url: "https://project-ref.supabase.co",
          anonKey: "",
        }),
    ).toThrow();
  });
});
