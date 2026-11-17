import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getVerifiedHeaderSecret, isSupabaseConfigured } from "@/lib/env";
import { signVerifiedUserHeader } from "@/modules/auth/verified-header";

const AUTH_REFRESH_PREFIXES = ["/dashboard", "/admin", "/login", "/auth", "/api"];
const VERIFIED_USER_HEADER = "x-forgesec-verified-user";

function needsMiddlewareAuthRefresh(pathname: string): boolean {
  return AUTH_REFRESH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(VERIFIED_USER_HEADER);

  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const { pathname } = request.nextUrl;
  if (!needsMiddlewareAuthRefresh(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSupabaseCookie) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user && user.email) {
    const signed = await signVerifiedUserHeader(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        createdAt: user.created_at,
        displayName:
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined),
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      },
      getVerifiedHeaderSecret()
    );
    requestHeaders.set(VERIFIED_USER_HEADER, signed);
    const updatedCookies = response.cookies.getAll();
    response = NextResponse.next({ request: { headers: requestHeaders } });
    for (const c of updatedCookies) {
      response.cookies.set(c);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
