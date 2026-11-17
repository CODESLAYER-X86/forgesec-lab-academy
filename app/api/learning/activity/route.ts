import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAccountActive } from "@/modules/auth/guards";
import { getCurrentUser } from "@/modules/auth/session";
import { recordContentView } from "@/modules/learning/service";

const ActivitySchema = z.object({
  contentId: z.string().min(2).max(128),
  contentType: z.enum(["tutorial", "learning_path", "writeup", "guide", "reference", "glossary"]),
  title: z.string().min(1).max(200),
  slug: z.string().min(2).max(160),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.json().catch(() => null);
  const parsed = ActivitySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user || !isAccountActive(user)) {
    return NextResponse.json({ ok: true, recorded: false });
  }

  await recordContentView(user.id, parsed.data);
  return NextResponse.json({ ok: true, recorded: true });
}
