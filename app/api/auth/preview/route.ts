import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb } from "@/lib/store/preview-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PREVIEW_SESSION_COOKIE } from "@/modules/auth/session";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: "login" | "logout";
    userId?: string;
  };

  if (body.action === "logout") {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      await supabase?.auth.signOut();
    }
    const cookieStore = await cookies();
    cookieStore.delete(PREVIEW_SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  }

  if (isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Preview login is disabled when Supabase is active." },
      { status: 400 }
    );
  }

  const db = readPreviewDb();
  const target = db.users.find((u) => u.id === body.userId);
  if (!target) {
    return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_SESSION_COOKIE, target.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, user: { id: target.id, role: target.role } });
}
