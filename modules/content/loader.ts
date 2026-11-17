import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
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

import {
  extractHeadings,
  slugifyHeading,
  type TocHeading,
} from "@/modules/content/headings";
import {
  clampPageNumber,
  paginateLesson,
  type LessonPageChunk,
} from "@/modules/content/pagination";

export { clampPageNumber, extractHeadings, paginateLesson, slugifyHeading };
export type { LessonPageChunk, TocHeading };

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
const isProdCacheEnabled = process.env.NODE_ENV === "production";

interface CachedContentMaps {
  lessons?: LessonDocument[];
  lessonsBySlug?: Map<string, LessonDocument>;
  lessonsById?: Map<string, LessonDocument>;
  paths?: LearningPath[];
  pathsBySlug?: Map<string, LearningPath>;
  pathsById?: Map<string, LearningPath>;
  writeups?: WriteupDocument[];
  writeupsBySlug?: Map<string, WriteupDocument>;
  resources?: ResourceDocument[];
  resourcesBySlug?: Map<string, ResourceDocument>;
  glossary?: GlossaryItem[];
  glossaryBySlug?: Map<string, GlossaryItem>;
}

const prodCache: CachedContentMaps = {};

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

const loadLessonsInternal = cache((): {
  list: LessonDocument[];
  bySlug: Map<string, LessonDocument>;
  byId: Map<string, LessonDocument>;
} => {
  if (isProdCacheEnabled && prodCache.lessons && prodCache.lessonsBySlug && prodCache.lessonsById) {
    return {
      list: prodCache.lessons,
      bySlug: prodCache.lessonsBySlug,
      byId: prodCache.lessonsById,
    };
  }

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
  lessons.sort((a, b) => {
    if (a.meta.pathId === b.meta.pathId) {
      return a.meta.moduleNumber - b.meta.moduleNumber;
    }
    return a.meta.pathId.localeCompare(b.meta.pathId);
  });

  const bySlug = new Map(lessons.map((l) => [l.meta.slug, l]));
  const byId = new Map(lessons.map((l) => [l.meta.id, l]));

  if (isProdCacheEnabled) {
    prodCache.lessons = lessons;
    prodCache.lessonsBySlug = bySlug;
    prodCache.lessonsById = byId;
  }

  return { list: lessons, bySlug, byId };
});

export function getPublishedLessons(): LessonDocument[] {
  return loadLessonsInternal().list;
}

export function getLessonBySlug(slug: string): LessonDocument | null {
  return loadLessonsInternal().bySlug.get(slug) ?? null;
}

export function getLessonById(id: string): LessonDocument | null {
  return loadLessonsInternal().byId.get(id) ?? null;
}

const loadPathsInternal = cache((): {
  list: LearningPath[];
  bySlug: Map<string, LearningPath>;
  byId: Map<string, LearningPath>;
} => {
  if (isProdCacheEnabled && prodCache.paths && prodCache.pathsBySlug && prodCache.pathsById) {
    return {
      list: prodCache.paths,
      bySlug: prodCache.pathsBySlug,
      byId: prodCache.pathsById,
    };
  }

  const files = listFilesByExt(path.join(root, "content", "paths"), ".yaml");
  const paths: LearningPath[] = [];
  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = LearningPathSchema.parse(parseYaml(raw));
    if (parsed.status !== "published") continue;
    paths.push(parsed);
  }
  const order = ["linux-fundamentals", "networking-fundamentals", "web-security-foundations"];
  paths.sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.title.localeCompare(b.title);
  });

  const bySlug = new Map(paths.map((p) => [p.slug, p]));
  const byId = new Map(paths.map((p) => [p.id, p]));

  if (isProdCacheEnabled) {
    prodCache.paths = paths;
    prodCache.pathsBySlug = bySlug;
    prodCache.pathsById = byId;
  }

  return { list: paths, bySlug, byId };
});

export function getPublishedLearningPaths(): LearningPath[] {
  return loadPathsInternal().list;
}

export function getLearningPathBySlug(slug: string): LearningPath | null {
  return loadPathsInternal().bySlug.get(slug) ?? null;
}

export function getLearningPathById(id: string): LearningPath | null {
  return loadPathsInternal().byId.get(id) ?? null;
}

export function getLessonsForPath(learningPath: LearningPath): LessonDocument[] {
  const { byId } = loadLessonsInternal();
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

const loadWriteupsInternal = cache((): {
  list: WriteupDocument[];
  bySlug: Map<string, WriteupDocument>;
} => {
  if (isProdCacheEnabled && prodCache.writeups && prodCache.writeupsBySlug) {
    return { list: prodCache.writeups, bySlug: prodCache.writeupsBySlug };
  }

  const files = listFilesByExt(path.join(root, "content", "writeups"), ".mdx");
  const list = files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return { meta: WriteupFrontmatterSchema.parse(data), content };
    })
    .filter((w) => w.meta.status === "published")
    .sort((a, b) => b.meta.updatedAt.localeCompare(a.meta.updatedAt));
  const bySlug = new Map(list.map((w) => [w.meta.slug, w]));

  if (isProdCacheEnabled) {
    prodCache.writeups = list;
    prodCache.writeupsBySlug = bySlug;
  }

  return { list, bySlug };
});

export function getPublishedWriteups(): WriteupDocument[] {
  return loadWriteupsInternal().list;
}

export function getWriteupBySlug(slug: string): WriteupDocument | null {
  return loadWriteupsInternal().bySlug.get(slug) ?? null;
}

const loadResourcesInternal = cache((): {
  list: ResourceDocument[];
  bySlug: Map<string, ResourceDocument>;
} => {
  if (isProdCacheEnabled && prodCache.resources && prodCache.resourcesBySlug) {
    return { list: prodCache.resources, bySlug: prodCache.resourcesBySlug };
  }

  const files = listFilesByExt(path.join(root, "content", "resources"), ".mdx");
  const list = files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return { meta: ResourceFrontmatterSchema.parse(data), content };
    })
    .filter((r) => r.meta.status === "published")
    .sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  const bySlug = new Map(list.map((r) => [r.meta.slug, r]));

  if (isProdCacheEnabled) {
    prodCache.resources = list;
    prodCache.resourcesBySlug = bySlug;
  }

  return { list, bySlug };
});

export function getPublishedResources(): ResourceDocument[] {
  return loadResourcesInternal().list;
}

export function getResourceBySlug(slug: string): ResourceDocument | null {
  return loadResourcesInternal().bySlug.get(slug) ?? null;
}

const loadGlossaryInternal = cache((): {
  list: GlossaryItem[];
  bySlug: Map<string, GlossaryItem>;
} => {
  if (isProdCacheEnabled && prodCache.glossary && prodCache.glossaryBySlug) {
    return { list: prodCache.glossary, bySlug: prodCache.glossaryBySlug };
  }

  const raw = fs.readFileSync(path.join(root, "content/glossary/terms.yaml"), "utf8");
  const parsed = GlossaryFileSchema.parse(parseYaml(raw));
  const list = parsed.items.sort((a, b) => a.term.localeCompare(b.term));
  const bySlug = new Map(list.map((g) => [g.slug, g]));

  if (isProdCacheEnabled) {
    prodCache.glossary = list;
    prodCache.glossaryBySlug = bySlug;
  }

  return { list, bySlug };
});

export function getGlossaryItems(): GlossaryItem[] {
  return loadGlossaryInternal().list;
}

export function getGlossaryItemBySlug(slug: string): GlossaryItem | null {
  return loadGlossaryInternal().bySlug.get(slug) ?? null;
}
