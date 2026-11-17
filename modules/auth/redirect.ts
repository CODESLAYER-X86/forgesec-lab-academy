import { getConfiguredSiteUrl, isLocalhostOrigin } from "@/lib/env";

const VALID_HOST_REGEX = /^[a-z0-9.-]+(?::\d{1,5})?$/i;

export function sanitizeRedirectPath(nextPath: string | null): string {
  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.startsWith("/\\") ||
    /[\r\n\0]/.test(nextPath)
  ) {
    return "/dashboard";
  }
  return nextPath;
}

function parseForwardedOrigin(
  forwardedHost?: string | null,
  forwardedProto?: string | null
): string | null {
  const rawHost = forwardedHost?.split(",")[0]?.trim();
  if (!rawHost || !VALID_HOST_REGEX.test(rawHost)) {
    return null;
  }

  const rawProto = forwardedProto?.split(",")[0]?.trim().toLowerCase();
  const proto = rawProto === "http" || rawProto === "https" ? rawProto : "https";
  try {
    return new URL(`${proto}://${rawHost}`).origin;
  } catch {
    return null;
  }
}

export function resolveRedirectOrigin({
  requestUrl,
  forwardedHost,
  forwardedProto,
}: {
  requestUrl: string;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}): string {
  let requestOrigin = "http://localhost:3000";
  try {
    requestOrigin = new URL(requestUrl).origin;
  } catch {
    // Fall back to configured URL below
  }

  const configuredExternalOrigin = getConfiguredSiteUrl({ ignoreLocalhostInProd: true });
  const forwardedOrigin = parseForwardedOrigin(forwardedHost, forwardedProto);

  if (process.env.NODE_ENV === "production") {
    // Pin to explicit external canonical origin when configured to prevent Host header spoofing
    if (configuredExternalOrigin) {
      return configuredExternalOrigin;
    }

    // Use the public request origin directly instead of falling back to http://localhost:3000
    if (!isLocalhostOrigin(requestOrigin)) {
      return requestOrigin;
    }

    // Behind reverse proxies (e.g. Cloud Run) where request.url binds to localhost/0.0.0.0
    if (forwardedOrigin && !isLocalhostOrigin(forwardedOrigin)) {
      return forwardedOrigin;
    }

    return requestOrigin;
  }

  if (!isLocalhostOrigin(requestOrigin)) {
    return requestOrigin;
  }

  if (forwardedOrigin && !isLocalhostOrigin(forwardedOrigin)) {
    return forwardedOrigin;
  }

  if (requestOrigin.includes("://0.0.0.0") && configuredExternalOrigin) {
    return configuredExternalOrigin;
  }

  return requestOrigin;
}
