const INTERNAL_ORIGIN = "https://wheresmaldives.invalid";

export function safeInternalRedirect(value: unknown, fallback = "/admin"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }

  try {
    const destination = new URL(value, INTERNAL_ORIGIN);
    if (destination.origin !== INTERNAL_ORIGIN) return fallback;
    return destination.pathname + destination.search + destination.hash;
  } catch {
    return fallback;
  }
}
