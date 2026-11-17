import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb } from "@/lib/store/preview-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlatformAnalytics } from "@/lib/types/domain";
import { getAllUsersForAdmin } from "@/modules/admin/service";
import {
  getPublishedLearningPaths,
  getPublishedLessons,
} from "@/modules/content/loader";

export interface PlatformAnalyticsWithCounts extends PlatformAnalytics {
  publishedQuizCount: number;
  publishedAssignmentCount: number;
}

export const getPlatformAnalytics = cache(
  async (): Promise<PlatformAnalyticsWithCounts> => {
    const paths = getPublishedLearningPaths();
    const lessons = getPublishedLessons();
    const users = await getAllUsersForAdmin();

    if (isSupabaseConfigured()) {
      const admin = createSupabaseAdminClient();
      if (!admin) {
        return {
          totalUsers: users.length,
          activeLearners: 0,
          totalLessonCompletions: 0,
          totalQuizAttempts: 0,
          averageQuizPassRate: 0,
          assignmentCompletionRate: 0,
          publishedQuizCount: 0,
          publishedAssignmentCount: 0,
          pathStats: [],
          popularLessons: [],
          quizPerformance: [],
        };
      }

      const [
        { data: progressRows },
        { data: activityRows },
        { data: attemptRows },
        { data: quizRows },
        { data: assignProgRows },
        { data: assignRows },
      ] = await Promise.all([
        admin.from("lesson_progress").select("user_id, lesson_id").eq("completed", true),
        admin.from("content_activity").select("content_id"),
        admin.from("quiz_attempts").select("quiz_id, passed, percentage"),
        admin.from("quizzes").select("id, title, status"),
        admin.from("assignment_progress").select("status"),
        admin.from("assignments").select("id").eq("status", "published"),
      ]);

      const completedRows = progressRows ?? [];
      const activeIds = new Set(completedRows.map((r) => r.user_id));
      const attempts = attemptRows ?? [];
      const passedCount = attempts.filter((a) => a.passed).length;

      const assignCompleted = (assignProgRows ?? []).filter((a) => a.status === "completed").length;
      const publishedAssigns = assignRows ?? [];
      const totalPossibleAssignments = Math.max(1, users.length * (publishedAssigns.length || 1));
      const publishedQuizCount = (quizRows ?? []).filter((q) => q.status === "published").length;

      return {
        totalUsers: users.length,
        activeLearners: activeIds.size,
        totalLessonCompletions: completedRows.length,
        totalQuizAttempts: attempts.length,
        averageQuizPassRate: attempts.length ? Math.round((passedCount / attempts.length) * 100) : 0,
        assignmentCompletionRate: Math.min(100, Math.round((assignCompleted / totalPossibleAssignments) * 100)),
        publishedQuizCount,
        publishedAssignmentCount: publishedAssigns.length,
        pathStats: paths.map((p) => {
          const completions = completedRows.filter((r) => p.lessons.includes(r.lesson_id)).length;
          const denom = Math.max(1, users.length * p.lessons.length);
          return {
            pathId: p.id,
            title: p.title,
            totalLessons: p.lessons.length,
            completions,
            completionRate: Math.min(100, Math.round((completions / denom) * 100)),
          };
        }),
        popularLessons: lessons.slice(0, 6).map((l) => ({
          lessonId: l.meta.id,
          title: l.meta.title,
          slug: l.meta.slug,
          views: (activityRows ?? []).filter((a) => a.content_id === l.meta.id).length,
          completions: completedRows.filter((r) => r.lesson_id === l.meta.id).length,
        })),
        quizPerformance: (quizRows ?? []).map((q) => {
          const qAttempts = attempts.filter((a) => a.quiz_id === q.id);
          const qPassed = qAttempts.filter((a) => a.passed).length;
          const avg = qAttempts.length
            ? Math.round(qAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / qAttempts.length)
            : 0;
          return {
            quizId: q.id,
            title: q.title,
            attempts: qAttempts.length,
            passRate: qAttempts.length ? Math.round((qPassed / qAttempts.length) * 100) : 0,
            avgScore: avg,
          };
        }),
      };
    }

    const db = readPreviewDb();
    const completedRows = db.lessonProgress.filter((p) => p.completed);
    const activeLearners = new Set([
      ...completedRows.map((p) => p.userId),
      ...db.quizAttempts.map((a) => a.userId),
      ...db.contentActivity.map((c) => c.userId),
    ]).size;

    const passedAttempts = db.quizAttempts.filter((a) => a.passed).length;
    const completedAssignments = db.assignmentProgress.filter((a) => a.status === "completed").length;
    const totalPublishedAssignments = db.assignments.filter((a) => a.status === "published").length;
    const totalPublishedQuizzes = db.quizzes.filter((q) => q.status === "published").length;

    return {
      totalUsers: users.length,
      activeLearners,
      totalLessonCompletions: completedRows.length,
      totalQuizAttempts: db.quizAttempts.length,
      averageQuizPassRate: db.quizAttempts.length
        ? Math.round((passedAttempts / db.quizAttempts.length) * 100)
        : 0,
      assignmentCompletionRate:
        users.length && totalPublishedAssignments
          ? Math.min(
              100,
              Math.round((completedAssignments / (users.length * totalPublishedAssignments)) * 100)
            )
          : 0,
      publishedQuizCount: totalPublishedQuizzes,
      publishedAssignmentCount: totalPublishedAssignments,
      pathStats: paths.map((p) => {
        const completions = completedRows.filter((r) => p.lessons.includes(r.lessonId)).length;
        const denom = Math.max(1, users.length * p.lessons.length);
        return {
          pathId: p.id,
          title: p.title,
          totalLessons: p.lessons.length,
          completions,
          completionRate: Math.min(100, Math.round((completions / denom) * 100)),
        };
      }),
      popularLessons: lessons
        .map((l) => ({
          lessonId: l.meta.id,
          title: l.meta.title,
          slug: l.meta.slug,
          views: db.contentActivity.filter((a) => a.contentId === l.meta.id).length,
          completions: completedRows.filter((r) => r.lessonId === l.meta.id).length,
        }))
        .sort((a, b) => b.views + b.completions - (a.views + a.completions))
        .slice(0, 6),
      quizPerformance: db.quizzes.map((q) => {
        const qAttempts = db.quizAttempts.filter((a) => a.quizId === q.id);
        const qPassed = qAttempts.filter((a) => a.passed).length;
        const avgScore = qAttempts.length
          ? Math.round(qAttempts.reduce((acc, a) => acc + a.percentage, 0) / qAttempts.length)
          : 0;
        return {
          quizId: q.id,
          title: q.title,
          attempts: qAttempts.length,
          passRate: qAttempts.length ? Math.round((qPassed / qAttempts.length) * 100) : 0,
          avgScore,
        };
      }),
    };
  }
);
