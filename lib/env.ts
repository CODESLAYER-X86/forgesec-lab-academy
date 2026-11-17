export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && anon && url.startsWith("http"));
}

export function isSupabaseAdminConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export function isPreviewAuthEnabled(): boolean {
  if (isSupabaseConfigured()) {
    return false;
  }
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_LOCAL_PREVIEW_AUTH === "true"
  );
}

export function getPreviewAuthSecret(): string {
  const envSecret = process.env.PREVIEW_AUTH_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  // Ephemeral fallback scoped to current Node process for local development only
  const globalForSecret = globalThis as unknown as { __forgesecPreviewSecret?: string };
  if (!globalForSecret.__forgesecPreviewSecret) {
    globalForSecret.__forgesecPreviewSecret =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? `${crypto.randomUUID()}-${crypto.randomUUID()}`
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return globalForSecret.__forgesecPreviewSecret;
}

export function getAdminEmails(): string[] {
  const fallback = isPreviewAuthEnabled() ? "admin@forgesec.academy" : "";
  const raw = process.env.ADMIN_EMAILS ?? fallback;
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPermanentAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function normalizeOriginUrl(raw?: string | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed === "MY_APP_URL") {
    return null;
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

export function getConfiguredSiteUrl(options?: { ignoreLocalhostInProd?: boolean }): string | null {
  const vercelHost =
    process.env.VERCEL_ENV === "preview"
      ? process.env.VERCEL_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  const candidates = (
    process.env.VERCEL_ENV === "preview"
      ? [vercelHost, process.env.NEXT_PUBLIC_SITE_URL, process.env.APP_URL]
      : [process.env.NEXT_PUBLIC_SITE_URL, process.env.APP_URL, vercelHost]
  )
    .map((value) => normalizeOriginUrl(value))
    .filter((value): value is string => Boolean(value));

  if (candidates.length === 0) {
    return null;
  }

  if (process.env.NODE_ENV === "production") {
    const nonLocal = candidates.find((origin) => !isLocalhostOrigin(origin));
    if (nonLocal) {
      return nonLocal;
    }
    if (options?.ignoreLocalhostInProd) {
      return null;
    }
  }

  return candidates[0];
}

export function getSiteUrl(): string {
  return getConfiguredSiteUrl() || "http://localhost:3000";
}

