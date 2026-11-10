import { describe, expect, it } from "vitest";
import { parseSupabaseServerEnv } from "./env";

describe("Supabase server environment", () => {
  it("accepts a project URL and server-only secret key", () => {
    expect(
      parseSupabaseServerEnv({
        url: "https://project-ref.supabase.co",
        secretKey: "sb_secret_test_key",
      }),
    ).toEqual({
      url: "https://project-ref.supabase.co",
      secretKey: "sb_secret_test_key",
    });
  });

  it("rejects a missing URL", () => {
    expect(() => parseSupabaseServerEnv({ secretKey: "sb_secret_test_key" })).toThrow();
  });

  it("rejects an invalid URL", () => {
    expect(
      () => parseSupabaseServerEnv({ url: "not-a-url", secretKey: "sb_secret_test_key" }),
    ).toThrow();
  });

  it("rejects a missing or empty secret key", () => {
    expect(() => parseSupabaseServerEnv({ url: "https://project-ref.supabase.co" })).toThrow();
    expect(
      () => parseSupabaseServerEnv({ url: "https://project-ref.supabase.co", secretKey: "" }),
    ).toThrow();
  });
});
