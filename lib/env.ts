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

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000"
  );
}
