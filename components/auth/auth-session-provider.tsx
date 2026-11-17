"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AssignmentProgressStatus, SessionUser } from "@/lib/types/domain";

export interface QuizBestSummary {
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export interface AssignmentProgressSummary {
  status: AssignmentProgressStatus;
  notes: string;
}

interface SessionStatePayload {
  user: SessionUser | null;
  completedLessonIds: string[];
  bookmarkedContentIds: string[];
  quizBestBySlug: Record<string, QuizBestSummary>;
  assignmentProgressById: Record<string, AssignmentProgressSummary>;
}

interface AuthSessionContextValue {
  user: SessionUser | null;
  loaded: boolean;
  completedIds: Set<string>;
  bookmarkedIds: Set<string>;
  quizBestBySlug: Record<string, QuizBestSummary>;
  assignmentProgressById: Record<string, AssignmentProgressSummary>;
  refreshSession: () => Promise<void>;
  setLessonCompletedOptimistic: (lessonId: string, completed: boolean) => void;
  setBookmarkOptimistic: (contentId: string, bookmarked: boolean) => void;
  setQuizBestOptimistic: (slug: string, summary: QuizBestSummary) => void;
  setAssignmentProgressOptimistic: (
    assignmentId: string,
    summary: AssignmentProgressSummary
  ) => void;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const EMPTY_STATE: SessionStatePayload = {
  user: null,
  completedLessonIds: [],
  bookmarkedContentIds: [],
  quizBestBySlug: {},
  assignmentProgressById: {},
};

async function fetchSessionPayload(): Promise<SessionStatePayload | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SessionStatePayload;
    return {
      user: data.user ?? null,
      completedLessonIds: Array.isArray(data.completedLessonIds)
        ? data.completedLessonIds
        : [],
      bookmarkedContentIds: Array.isArray(data.bookmarkedContentIds)
        ? data.bookmarkedContentIds
        : [],
      quizBestBySlug: data.quizBestBySlug ?? {},
      assignmentProgressById: data.assignmentProgressById ?? {},
    };
  } catch {
    return null;
  }
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionStatePayload>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);

  const refreshSession = useCallback(async () => {
    const payload = await fetchSessionPayload();
    if (payload) {
      setState(payload);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    let active = true;
    void fetchSessionPayload().then((payload) => {
      if (!active) return;
      if (payload) {
        setState(payload);
      }
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const setLessonCompletedOptimistic = useCallback(
    (lessonId: string, completed: boolean) => {
      setState((prev) => {
        const next = new Set(prev.completedLessonIds);
        if (completed) {
          next.add(lessonId);
        } else {
          next.delete(lessonId);
        }
        return { ...prev, completedLessonIds: Array.from(next) };
      });
    },
    []
  );

  const setBookmarkOptimistic = useCallback((contentId: string, bookmarked: boolean) => {
    setState((prev) => {
      const next = new Set(prev.bookmarkedContentIds);
      if (bookmarked) {
        next.add(contentId);
      } else {
        next.delete(contentId);
      }
      return { ...prev, bookmarkedContentIds: Array.from(next) };
    });
  }, []);

  const setQuizBestOptimistic = useCallback(
    (slug: string, summary: QuizBestSummary) => {
      setState((prev) => {
        const existing = prev.quizBestBySlug[slug];
        if (existing && existing.percentage > summary.percentage) {
          return prev;
        }
        return {
          ...prev,
          quizBestBySlug: {
            ...prev.quizBestBySlug,
            [slug]: summary,
          },
        };
      });
    },
    []
  );

  const setAssignmentProgressOptimistic = useCallback(
    (assignmentId: string, summary: AssignmentProgressSummary) => {
      setState((prev) => ({
        ...prev,
        assignmentProgressById: {
          ...prev.assignmentProgressById,
          [assignmentId]: summary,
        },
      }));
    },
    []
  );

  const value = useMemo<AuthSessionContextValue>(() => {
    return {
      user: state.user,
      loaded,
      completedIds: new Set(state.completedLessonIds),
      bookmarkedIds: new Set(state.bookmarkedContentIds),
      quizBestBySlug: state.quizBestBySlug,
      assignmentProgressById: state.assignmentProgressById,
      refreshSession,
      setLessonCompletedOptimistic,
      setBookmarkOptimistic,
      setQuizBestOptimistic,
      setAssignmentProgressOptimistic,
    };
  }, [
    state,
    loaded,
    refreshSession,
    setLessonCompletedOptimistic,
    setBookmarkOptimistic,
    setQuizBestOptimistic,
    setAssignmentProgressOptimistic,
  ]);

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    return {
      user: null,
      loaded: false,
      completedIds: new Set(),
      bookmarkedIds: new Set(),
      quizBestBySlug: {},
      assignmentProgressById: {},
      refreshSession: async () => {},
      setLessonCompletedOptimistic: () => {},
      setBookmarkOptimistic: () => {},
      setQuizBestOptimistic: () => {},
      setAssignmentProgressOptimistic: () => {},
    };
  }
  return ctx;
}
