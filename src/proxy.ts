import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_EXPIRY_COOKIE,
  AUTH_REFRESH_COOKIE,
  authCookieOptions,
} from "@/lib/auth-session";

// This proxy refreshes the Supabase Auth session only. Authorization remains
// in server-side route/layout/action code and is never decided by a path list.
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.next({ request });

  const expiresAt = Number(request.cookies.get(AUTH_EXPIRY_COOKIE)?.value ?? 0);
  if (Number.isFinite(expiresAt) && expiresAt * 1000 > Date.now() + 60_000) {
    return NextResponse.next({ request });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    const response = NextResponse.next({ request });
    for (const name of [AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE, AUTH_EXPIRY_COOKIE]) {
      response.cookies.set(name, "", authCookieOptions(0));
    }
    return response;
  }

  const expiresAtNext =
    data.session.expires_at ?? Math.floor(Date.now() / 1000) + data.session.expires_in;
  request.cookies.set(AUTH_ACCESS_COOKIE, data.session.access_token);
  request.cookies.set(AUTH_REFRESH_COOKIE, data.session.refresh_token);
  request.cookies.set(AUTH_EXPIRY_COOKIE, String(expiresAtNext));

  const response = NextResponse.next({ request });
  response.cookies.set(
    AUTH_ACCESS_COOKIE,
    data.session.access_token,
    authCookieOptions(data.session.expires_in),
  );
  response.cookies.set(
    AUTH_REFRESH_COOKIE,
    data.session.refresh_token,
    authCookieOptions(60 * 60 * 24 * 30),
  );
  response.cookies.set(
    AUTH_EXPIRY_COOKIE,
    String(expiresAtNext),
    authCookieOptions(data.session.expires_in),
  );
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
