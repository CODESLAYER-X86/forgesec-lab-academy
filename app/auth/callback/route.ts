import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sanitizeRedirectPath(nextPath: string | null): string {
  if (
    !nextPath ||
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.startsWith("/\\")
  ) {
    return "/dashboard";
  }
  return nextPath;
}

function resolveRedirectOrigin(requestOrigin: string): string {
  try {
    const canonicalOrigin = new URL(getSiteUrl()).origin;
    if (process.env.NODE_ENV === "production") {
      return canonicalOrigin;
    }
    return requestOrigin === canonicalOrigin ? canonicalOrigin : requestOrigin;
  } catch {
    return requestOrigin;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirectOrigin = resolveRedirectOrigin(origin);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${redirectOrigin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/login?error=auth_callback_failed`);
}
