import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveRedirectOrigin, sanitizeRedirectPath } from "@/modules/auth/redirect";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectOrigin = resolveRedirectOrigin({
    requestUrl: request.url,
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
  });
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
