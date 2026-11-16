import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as parseYaml } from "js-yaml";
import {
  GlossaryFileSchema,
  LearningPathSchema,
  LessonFrontmatterSchema,
  ResourceFrontmatterSchema,
  WriteupFrontmatterSchema,
  type GlossaryItem,
  type LearningPath,
  type LessonFrontmatter,
  type ResourceFrontmatter,
  type WriteupFrontmatter,
} from "@/modules/content/schemas";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface LessonDocument {
  meta: LessonFrontmatter;
  content: string;
  headings: TocHeading[];
}

export interface WriteupDocument {
  meta: WriteupFrontmatter;
  content: string;
}

export interface ResourceDocument {
  meta: ResourceFrontmatter;
  content: string;
}

const root = process.cwd();

function listFilesByExt(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesByExt(fullPath, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split("\n");
  const headings: TocHeading[] = [];
  let inFence = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const h2 = /^##\s+(.+)$/.exec(trimmed);
    const h3 = /^###\s+(.+)$/.exec(trimmed);
    if (h2) {
      const clean = h2[1].replace(/\*\*/g, "").trim();
      headings.push({ id: slugifyHeading(clean), text: clean, level: 2 });
    } else if (h3) {
      const clean = h3[1].replace(/\*\*/g, "").trim();
      headings.push({ id: slugifyHeading(clean), text: clean, level: 3 });
    }
  }
  return headings;
}

export function getPublishedLessons(): LessonDocument[] {
  const files = listFilesByExt(path.join(root, "content", "lessons"), ".mdx");
  const lessons: LessonDocument[] = [];
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const meta = LessonFrontmatterSchema.parse(data);
    if (meta.status !== "published") continue;
    lessons.push({
      meta,
      content,
      headings: extractHeadings(content),
    });
  }
  return lessons.sort((a, b) => {
    if (a.meta.pathId === b.meta.pathId) {
      return a.meta.moduleNumber - b.meta.moduleNumber;
    }
    return a.meta.pathId.localeCompare(b.meta.pathId);
  });
}

export function getLessonBySlug(slug: string): LessonDocument | null {
  return getPublishedLessons().find((l) => l.meta.slug === slug) ?? null;
}

export function getLessonById(id: string): LessonDocument | null {
  return getPublishedLessons().find((l) => l.meta.id === id) ?? null;
}

export function getPublishedLearningPaths(): LearningPath[] {
  const files = listFilesByExt(path.join(root, "content", "paths"), ".yaml");
  const paths: LearningPath[] = [];
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = LearningPathSchema.parse(parseYaml(raw));
    if (parsed.status !== "published") continue;
    paths.push(parsed);
  }
  const order = ["linux-fundamentals", "networking-fundamentals", "web-security-foundations"];
  return paths.sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.title.localeCompare(b.title);
  });
}

export function getLearningPathBySlug(slug: string): LearningPath | null {
  return getPublishedLearningPaths().find((p) => p.slug === slug) ?? null;
}

export function getLearningPathById(id: string): LearningPath | null {
  return getPublishedLearningPaths().find((p) => p.id === id) ?? null;
}

export function getLessonsForPath(learningPath: LearningPath): LessonDocument[] {
  const all = getPublishedLessons();
  const byId = new Map(all.map((l) => [l.meta.id, l]));
  return learningPath.lessons
    .map((id) => byId.get(id))
    .filter((item): item is LessonDocument => Boolean(item));
}

export function getLessonNeighbors(lesson: LessonDocument): {
  path: LearningPath | null;
  pathLessons: LessonDocument[];
  previous: LessonDocument | null;
  next: LessonDocument | null;
} {
  const learningPath = getLearningPathById(lesson.meta.pathId);
  if (!learningPath) {
    return { path: null, pathLessons: [], previous: null, next: null };
  }
  const pathLessons = getLessonsForPath(learningPath);
  const idx = pathLessons.findIndex((l) => l.meta.id === lesson.meta.id);
  return {
    path: learningPath,
    pathLessons,
    previous: idx > 0 ? pathLessons[idx - 1] : null,
    next: idx >= 0 && idx < pathLessons.length - 1 ? pathLessons[idx + 1] : null,
  };
}

export function getPublishedWriteups(): WriteupDocument[] {
  const files = listFilesByExt(path.join(root, "content", "writeups"), ".mdx");
  return files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return { meta: WriteupFrontmatterSchema.parse(data), content };
    })
    .filter((w) => w.meta.status === "published")
    .sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt));
}

export function getWriteupBySlug(slug: string): WriteupDocument | null {
  return getPublishedWriteups().find((w) => w.meta.slug === slug) ?? null;
}

export function getPublishedResources(): ResourceDocument[] {
  const files = listFilesByExt(path.join(root, "content", "resources"), ".mdx");
  return files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return { meta: ResourceFrontmatterSchema.parse(data), content };
    })
    .filter((r) => r.meta.status === "published")
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function getResourceBySlug(slug: string): ResourceDocument | null {
  return getPublishedResources().find((r) => r.meta.slug === slug) ?? null;
}

export function getGlossaryItems(): GlossaryItem[] {
  const raw = fs.readFileSync(path.join(root, "content/glossary/terms.yaml"), "utf8");
  const parsed = GlossaryFileSchema.parse(parseYaml(raw));
  return parsed.items.sort((a, b) => a.term.localeCompare(b.term));
}

export function getGlossaryItemBySlug(slug: string): GlossaryItem | null {
  return getGlossaryItems().find((item) => item.slug === slug) ?? null;
}
