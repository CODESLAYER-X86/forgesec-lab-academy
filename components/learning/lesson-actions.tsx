"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, Check, CheckCircle2, Circle, Share2 } from "lucide-react";
import {
  toggleBookmarkAction,
  toggleLessonCompletionAction,
} from "@/app/actions/learning";

export function LessonActions({
  lessonId,
  pathId,
  slug,
  title,
  initialCompleted,
  initialBookmarked,
  isAuthenticated,
}: {
  lessonId: string;
  pathId: string;
  slug: string;
  title: string;
  initialCompleted: boolean;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleComplete = () => {
    if (!isAuthenticated) {
      setNotice("Sign in to save lesson progress.");
      return;
    }
    const nextState = !completed;
    setCompleted(nextState);
    setNotice(null);
    startTransition(async () => {
      const res = await toggleLessonCompletionAction({
        lessonId,
        pathId,
        slug,
        completed: nextState,
      });
      if (!res.ok) {
        setCompleted(!nextState);
        setNotice(res.error ?? "Unable to update progress.");
      }
    });
  };

  const handleToggleBookmark = () => {
    if (!isAuthenticated) {
      setNotice("Sign in to bookmark lessons.");
      return;
    }
    const prev = bookmarked;
    setBookmarked(!prev);
    setNotice(null);
    startTransition(async () => {
      const res = await toggleBookmarkAction({
        contentId: lessonId,
        contentType: "tutorial",
        title,
        slug,
      });
      if (!res.ok) {
        setBookmarked(prev);
        setNotice(res.error ?? "Unable to update bookmark.");
      }
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      setNotice("Copy the URL from your browser address bar.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleComplete}
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors whitespace-nowrap ${
            completed
              ? "border border-[#22C55E]/40 bg-[#173D35] text-[#BBF7D0] hover:bg-[#1E4E44]"
              : "bg-[#A3E635] text-[#101418] hover:bg-[#B4F04E]"
          }`}
        >
          {completed ? (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>Completed (Click to undo)</span>
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" aria-hidden="true" />
              <span>Mark Lesson Complete</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleBookmark}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
            bookmarked
              ? "border-[#A3E635]/50 bg-[#202831] text-[#A3E635]"
              : "border-[#303A44] bg-[#171D23] text-[#AAB4BE] hover:text-[#F3F4F6]"
          }`}
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#303A44] bg-[#171D23] px-3.5 text-sm font-medium text-[#AAB4BE] hover:text-[#F3F4F6] transition-colors whitespace-nowrap"
        >
          {copiedUrl ? (
            <>
              <Check className="h-4 w-4 text-[#22C55E]" aria-hidden="true" />
              <span className="text-[#22C55E]">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {notice ? (
        <div className="text-xs text-[#F59E0B]">
          {notice}{" "}
          {!isAuthenticated ? (
            <Link href="/login" className="underline text-[#A3E635]">
              Go to login
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
