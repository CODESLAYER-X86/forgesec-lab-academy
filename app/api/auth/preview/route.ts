import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getPreviewAuthSecret,
  isPreviewAuthEnabled,
  isSupabaseConfigured,
} from "@/lib/env";
import { readPreviewDb } from "@/lib/store/preview-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signPreviewSessionToken } from "@/modules/auth/preview-token";
import { PREVIEW_SESSION_COOKIE } from "@/modules/auth/session";

const PreviewAuthSchema = z.object({
  action: z.enum(["login", "logout"]),
  userId: z.string().min(2).max(64).optional(),
});

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type application/json required." },
      { status: 415 }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = PreviewAuthSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid authentication payload." }, { status: 400 });
  }

  if (parsed.data.action === "logout") {
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient();
      await supabase?.auth.signOut();
    }
    const cookieStore = await cookies();
    cookieStore.delete(PREVIEW_SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  }

  if (!isPreviewAuthEnabled()) {
    return NextResponse.json(
      { error: "Preview login is disabled in this environment." },
      { status: 403 }
    );
  }

  if (!parsed.data.userId) {
    return NextResponse.json({ error: "Missing userId." }, { status: 400 });
  }

  const db = readPreviewDb();
  const target = db.users.find((u) => u.id === parsed.data.userId);
  if (!target) {
    return NextResponse.json({ error: "Demo account not found." }, { status: 404 });
  }
  if (target.accountStatus !== "active") {
    return NextResponse.json({ error: "Account is inactive." }, { status: 403 });
  }

  const signedToken = signPreviewSessionToken(target.id, getPreviewAuthSecret());
  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_SESSION_COOKIE, signedToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, user: { id: target.id, role: target.role } });
}
