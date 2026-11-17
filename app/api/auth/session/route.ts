import { NextResponse } from "next/server";
import { getUserAssignmentProgress } from "@/modules/assignments/service";
import { isAccountActive } from "@/modules/auth/guards";
import { getCurrentUser } from "@/modules/auth/session";
import { getUserBookmarks, getUserLessonProgress } from "@/modules/learning/service";
import { getUserQuizAttempts } from "@/modules/quizzes/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const activeUser = isAccountActive(user) ? user : null;

  if (!activeUser) {
    return NextResponse.json(
      {
        user: null,
        completedLessonIds: [],
        bookmarkedContentIds: [],
        quizBestBySlug: {},
        assignmentProgressById: {},
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  }

  const [progress, bookmarks, attempts, assignments] = await Promise.all([
    getUserLessonProgress(activeUser.id),
    getUserBookmarks(activeUser.id),
    getUserQuizAttempts(activeUser.id),
    getUserAssignmentProgress(activeUser.id),
  ]);

  const completedLessonIds = progress.filter((p) => p.completed).map((p) => p.lessonId);
  const bookmarkedContentIds = bookmarks.map((b) => b.contentId);

  const quizBestBySlug: Record<
    string,
    { percentage: number; passed: boolean; submittedAt: string }
  > = {};
  for (const att of attempts) {
    if (!att.quizSlug) continue;
    const prev = quizBestBySlug[att.quizSlug];
    if (!prev || att.percentage > prev.percentage) {
      quizBestBySlug[att.quizSlug] = {
        percentage: att.percentage,
        passed: att.passed,
        submittedAt: att.submittedAt,
      };
    }
  }

  const assignmentProgressById: Record<
    string,
    { status: "not_started" | "in_progress" | "completed"; notes: string }
  > = {};
  for (const item of assignments) {
    assignmentProgressById[item.assignmentId] = {
      status: item.status,
      notes: item.notes,
    };
  }

  return NextResponse.json(
    {
      user: activeUser,
      completedLessonIds,
      bookmarkedContentIds,
      quizBestBySlug,
      assignmentProgressById,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
