import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/modules/auth/session";
import { getUserActivity } from "@/modules/learning/service";

export const metadata: Metadata = {
  title: "Learning History",
};

export default async function DashboardHistoryPage() {
  const user = await requireUser();
  const activity = await getUserActivity(user.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[#F3F4F6]">Activity History</h1>
        <p className="mt-1 text-sm text-[#AAB4BE]">
          Recent lessons you opened across sessions.
        </p>
      </header>

      {activity.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-sm text-[#AAB4BE]">
          No lesson views recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
          {activity.map((act) => (
            <Link
              key={act.id}
              href={`/learn/lessons/${act.slug}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-[#202831] transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-[#F3F4F6]">{act.title}</div>
                <div className="text-xs text-[#7B8794] capitalize">{act.contentType}</div>
              </div>
              <span className="font-mono text-xs text-[#7B8794] tabular-nums">
                {act.viewedAt.replace("T", " ").slice(0, 16)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
