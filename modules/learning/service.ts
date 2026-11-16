import { isSupabaseConfigured } from "@/lib/env";
import { readPreviewDb, writePreviewDb } from "@/lib/store/preview-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BookmarkRecord,
  ContentActivityRecord,
  ContentType,
  LessonProgressRecord,
} from "@/lib/types/domain";
import {
  getLessonById,
  getPublishedLearningPaths,
  getPublishedLessons,
} from "@/modules/content/loader";
import {
  calculatePathProgress,
  pickContinueLearningPath,
  type PathProgressSummary,
} from "@/modules/learning/progress";

export async function getUserLessonProgress(userId: string): Promise<LessonProgressRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId);
    return (data ?? []).map((row) => ({
      userId: row.user_id,
      lessonId: row.lesson_id,
      pathId: row.path_id ?? "",
      completed: Boolean(row.completed),
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    }));
  }

  const db = readPreviewDb();
  return db.lessonProgress.filter((p) => p.userId === userId);
}

export async function toggleLessonCompletion(
  userId: string,
  lessonId: string,
  pathId: string,
  completed: boolean
): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        path_id: pathId,
        completed,
        completed_at: completed ? now : null,
        updated_at: now,
      },
      { onConflict: "user_id,lesson_id" }
    );
    return;
  }

  const db = readPreviewDb();
  const idx = db.lessonProgress.findIndex(
    (p) => p.userId === userId && p.lessonId === lessonId
  );
  if (idx !== -1) {
    db.lessonProgress[idx] = {
      ...db.lessonProgress[idx],
      pathId,
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
    };
  } else {
    db.lessonProgress.push({
      userId,
      lessonId,
      pathId,
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
    });
  }
  writePreviewDb(db);
}

export async function getUserBookmarks(userId: string): Promise<BookmarkRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      contentType: row.content_type,
      title: row.title,
      slug: row.slug,
      createdAt: row.created_at,
    }));
  }

  const db = readPreviewDb();
  return db.bookmarks
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function toggleBookmark(
  userId: string,
  item: { contentId: string; contentType: ContentType; title: string; slug: string }
): Promise<{ bookmarked: boolean }> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Supabase unavailable");
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("content_id", item.contentId)
      .maybeSingle();

    if (existing) {
      await supabase.from("bookmarks").delete().eq("id", existing.id);
      return { bookmarked: false };
    }
    await supabase.from("bookmarks").insert({
      user_id: userId,
      content_id: item.contentId,
      content_type: item.contentType,
      title: item.title,
      slug: item.slug,
    });
    return { bookmarked: true };
  }

  const db = readPreviewDb();
  const idx = db.bookmarks.findIndex(
    (b) => b.userId === userId && b.contentId === item.contentId
  );
  if (idx !== -1) {
    db.bookmarks.splice(idx, 1);
    writePreviewDb(db);
    return { bookmarked: false };
  }
  db.bookmarks.unshift({
    id: `bm-${Date.now()}`,
    userId,
    contentId: item.contentId,
    contentType: item.contentType,
    title: item.title,
    slug: item.slug,
    createdAt: new Date().toISOString(),
  });
  writePreviewDb(db);
  return { bookmarked: true };
}

export async function recordContentView(
  userId: string,
  item: { contentId: string; contentType: ContentType; title: string; slug: string }
): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;
    await supabase.from("content_activity").insert({
      user_id: userId,
      content_id: item.contentId,
      content_type: item.contentType,
      title: item.title,
      slug: item.slug,
      viewed_at: now,
    });
    return;
  }

  const db = readPreviewDb();
  // Deduplicate immediate back-to-back refresh of same item
  const latest = db.contentActivity.find((a) => a.userId === userId);
  if (latest && latest.contentId === item.contentId) {
    latest.viewedAt = now;
  } else {
    db.contentActivity.unshift({
      id: `act-${Date.now()}`,
      userId,
      contentId: item.contentId,
      contentType: item.contentType,
      title: item.title,
      slug: item.slug,
      viewedAt: now,
    });
    db.contentActivity = db.contentActivity.slice(0, 200);
  }
  writePreviewDb(db);
}

export async function getUserActivity(userId: string): Promise<ContentActivityRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("content_activity")
      .select("*")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(20);
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      contentType: row.content_type,
      title: row.title,
      slug: row.slug,
      viewedAt: row.viewed_at,
    }));
  }

  const db = readPreviewDb();
  return db.contentActivity
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.viewedAt.localeCompare(a.viewedAt))
    .slice(0, 20);
}

export async function getDashboardLearningSummary(userId: string): Promise<{
  completedCount: number;
  totalPublishedLessons: number;
  overallPercentage: number;
  pathSummaries: PathProgressSummary[];
  continueLearning: {
    path: PathProgressSummary;
    nextLessonTitle: string;
    nextLessonSlug: string;
  } | null;
  completedIds: string[];
}> {
  const progress = await getUserLessonProgress(userId);
  const completedIds = progress.filter((p) => p.completed).map((p) => p.lessonId);
  const completedSet = new Set(completedIds);

  const paths = getPublishedLearningPaths();
  const totalPublishedLessons = getPublishedLessons().length;
  const pathSummaries = paths.map((p) => calculatePathProgress(p, completedSet));
  const continuePath = pickContinueLearningPath(paths, completedSet);

  let continueLearning: {
    path: PathProgressSummary;
    nextLessonTitle: string;
    nextLessonSlug: string;
  } | null = null;

  if (continuePath && continuePath.nextLessonId) {
    const nextLesson = getLessonById(continuePath.nextLessonId);
    if (nextLesson) {
      continueLearning = {
        path: continuePath,
        nextLessonTitle: nextLesson.meta.title,
        nextLessonSlug: nextLesson.meta.slug,
      };
    }
  }

  const overallPercentage =
    totalPublishedLessons === 0
      ? 0
      : Math.round((completedSet.size / totalPublishedLessons) * 100);

  return {
    completedCount: completedSet.size,
    totalPublishedLessons,
    overallPercentage,
    pathSummaries,
    continueLearning,
    completedIds,
  };
}
