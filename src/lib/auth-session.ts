export const AUTH_ACCESS_COOKIE = "wmv26-access-token";
export const AUTH_REFRESH_COOKIE = "wmv26-refresh-token";
export const AUTH_EXPIRY_COOKIE = "wmv26-auth-expiry";

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
