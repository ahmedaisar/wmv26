const DEFAULT_SITE_URL = "https://wheresmaldives.com";

export function getSiteUrl(value?: string): URL {
  const candidate = value?.trim();

  if (!candidate) {
    return new URL(DEFAULT_SITE_URL);
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new URL(DEFAULT_SITE_URL);
    }
    return url;
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrlString(value?: string): string {
  return getSiteUrl(value).toString().replace(/\/$/, "");
}
