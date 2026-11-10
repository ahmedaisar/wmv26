import { afterEach, describe, expect, it, vi } from "vitest";
import { authCookieOptions } from "./auth-session";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("authCookieOptions", () => {
  it("sets HttpOnly, SameSite and path protections", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(authCookieOptions(300)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });
  });

  it("marks cookies Secure in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(authCookieOptions(300).secure).toBe(true);
  });
});
