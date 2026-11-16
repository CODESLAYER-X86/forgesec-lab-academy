import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import {
  getGlossaryItems,
  getPublishedLearningPaths,
  getPublishedLessons,
  getPublishedResources,
  getPublishedWriteups,
} from "@/modules/content/loader";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const staticRoutes = [
    "",
    "/learn",
    "/learn/paths",
    "/writeups",
    "/resources",
    "/glossary",
    "/quizzes",
    "/assignments",
    "/about",
    "/privacy",
    "/terms",
    "/acceptable-use",
    "/disclaimer",
    "/cookies",
    "/copyright",
    "/responsible-disclosure",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const pathRoutes = getPublishedLearningPaths().map((p) => ({
    url: `${baseUrl}/learn/paths/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const lessonRoutes = getPublishedLessons().map((l) => ({
    url: `${baseUrl}/learn/lessons/${l.meta.slug}`,
    lastModified: l.meta.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const writeupRoutes = getPublishedWriteups().map((w) => ({
    url: `${baseUrl}/writeups/${w.meta.slug}`,
    lastModified: w.meta.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const resourceRoutes = getPublishedResources().map((r) => ({
    url: `${baseUrl}/resources/${r.meta.slug}`,
    lastModified: r.meta.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const glossaryRoutes = getGlossaryItems().map((g) => ({
    url: `${baseUrl}/glossary/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...pathRoutes,
    ...lessonRoutes,
    ...writeupRoutes,
    ...resourceRoutes,
    ...glossaryRoutes,
  ];
}
