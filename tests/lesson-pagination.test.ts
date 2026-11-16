import { describe, expect, it } from "vitest";
import { readPreviewDb } from "@/lib/store/preview-store";
import {
  clampPageNumber,
  extractHeadings,
  getPublishedLessons,
  paginateLesson,
  slugifyHeading,
} from "@/modules/content/loader";

function hasBalancedFences(mdx: string): boolean {
  const fenceMatches = mdx.match(/^(?:```|~~~)/gm);
  return !fenceMatches || fenceMatches.length % 2 === 0;
}

describe("Lesson section-aware pagination & static quiz cleanup", () => {
  const lessons = getPublishedLessons();
  const db = readPreviewDb();
  const quizSlugs = new Set(db.quizzes.filter((q) => q.status === "published").map((q) => q.slug));

  it("removes static Knowledge Check, Answer Key, and escaped badge artifacts from all published lessons", () => {
    expect(lessons.length).toBe(15);
    for (const lesson of lessons) {
      expect(lesson.content).not.toMatch(/^#{1,3}\s+(?:\*\*)?(?:[A-Z]\.\s+)?Knowledge Check/im);
      expect(lesson.content).not.toMatch(/^#{1,3}\s+(?:\*\*)?(?:[A-Z]\.\s+)?Answer Key/im);
      expect(lesson.content).not.toContain("&lt;badge");
      expect(lesson.content).not.toContain("images.openai.com");
    }
  });

  it("maps every published lesson quizSlug to a published interactive quiz", () => {
    for (const lesson of lessons) {
      expect(lesson.meta.quizSlug).toBeTruthy();
      expect(quizSlugs.has(lesson.meta.quizSlug!)).toBe(true);
    }
  });

  it("splits Linux modules into balanced multi-page reading steps ending with an assessment page", () => {
    const linuxLessons = lessons.filter((l) => l.meta.category === "linux");
    expect(linuxLessons).toHaveLength(10);

    for (const lesson of linuxLessons) {
      const pages = paginateLesson(lesson.content, lesson.meta.estimatedMinutes, {
        hasQuiz: Boolean(lesson.meta.quizSlug),
      });
      expect(pages.length).toBeGreaterThanOrEqual(4);
      expect(pages[pages.length - 1]?.isAssessmentPage).toBe(true);

      const readingPages = pages.slice(0, -1);
      for (const page of readingPages) {
        expect(page.isAssessmentPage).toBe(false);
        expect(page.mdxContent.trim().length).toBeGreaterThan(100);
        expect(page.estimatedMinutes).toBeGreaterThanOrEqual(1);
        expect(page.estimatedMinutes).toBeLessThanOrEqual(5);
        expect(hasBalancedFences(page.mdxContent)).toBe(true);
      }

      expect(hasBalancedFences(pages[pages.length - 1]!.mdxContent)).toBe(true);
    }
  });

  it("paginates shorter networking & web-security lessons into 1 reading page + 1 closing assessment page", () => {
    const shortLessons = lessons.filter((l) => l.meta.category !== "linux");
    expect(shortLessons).toHaveLength(5);

    for (const lesson of shortLessons) {
      const pages = paginateLesson(lesson.content, lesson.meta.estimatedMinutes, {
        hasQuiz: Boolean(lesson.meta.quizSlug),
      });
      expect(pages).toHaveLength(2);
      expect(pages[0]?.isAssessmentPage).toBe(false);
      expect(pages[1]?.isAssessmentPage).toBe(true);
    }
  });

  it("clamps invalid or out-of-range page parameters cleanly", () => {
    expect(clampPageNumber(undefined, 5)).toBe(1);
    expect(clampPageNumber("", 5)).toBe(1);
    expect(clampPageNumber("abc", 5)).toBe(1);
    expect(clampPageNumber("0", 5)).toBe(1);
    expect(clampPageNumber("-3", 5)).toBe(1);
    expect(clampPageNumber("3", 5)).toBe(3);
    expect(clampPageNumber("999", 5)).toBe(5);
  });

  it("extracts headings cleanly and decodes HTML spaces for TOC anchor matching", () => {
    const headings = extractHeadings("### **1.&#x20;**`cat`**&#x20;— Display File Contents**");
    expect(headings).toHaveLength(1);
    expect(headings[0]?.text).toBe("1. cat — Display File Contents");
    expect(headings[0]?.id).toBe(slugifyHeading("1. cat — Display File Contents"));
    expect(headings[0]?.id).not.toContain("x20");
  });
});
