import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/modules/auth/session";
import { getUserBookmarks } from "@/modules/learning/service";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default async function DashboardBookmarksPage() {
  const user = await requireUser();
  const bookmarks = await getUserBookmarks(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Saved Bookmarks</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Quick access to lessons and command references you saved for revision.
        </p>
      </header>

      {bookmarks.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-sm text-[#AAB4BE]">
          No bookmarks saved yet. Open any lesson in the{" "}
          <Link href="/learn" className="text-[#A3E635] underline">
            catalog
          </Link>{" "}
          and click Bookmark.
        </div>
      ) : (
        <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
          {bookmarks.map((b) => (
            <Link
              key={b.id}
              href={
                b.contentType === "reference" || b.contentType === "guide"
                  ? `/resources/${b.slug}`
                  : `/learn/lessons/${b.slug}`
              }
              className="flex items-center justify-between gap-4 p-5 hover:bg-[#202831] transition-colors"
            >
              <div>
                <div className="text-xs text-[#7B8794] capitalize">{b.contentType}</div>
                <div className="mt-0.5 text-base font-semibold text-[#F3F4F6]">
                  {b.title}
                </div>
              </div>
              <span className="font-mono text-xs text-[#7B8794] tabular-nums">
                {b.createdAt.slice(0, 10)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
