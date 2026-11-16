"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

interface CatalogPath {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  lessonCount: number;
}

interface CatalogLesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  moduleNumber: number;
  pathId: string;
}

export function CatalogExplorer({
  paths,
  lessons,
}: {
  paths: CatalogPath[];
  lessons: CatalogLesson[];
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const topics = ["all", "linux", "networking", "web-security"];
  const difficulties = ["all", "beginner", "intermediate"];

  const filteredPaths = useMemo(() => {
    const q = query.trim().toLowerCase();
    return paths.filter((p) => {
      if (topic !== "all" && p.category !== topic) return false;
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (q && !`${p.title} ${p.description} ${p.category}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [paths, query, topic, difficulty]);

  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((l) => {
      if (topic !== "all" && l.category !== topic) return false;
      if (difficulty !== "all" && l.difficulty !== difficulty) return false;
      if (q && !`${l.title} ${l.description} ${l.category}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [lessons, query, topic, difficulty]);

  return (
    <div className="space-y-10">
      {/* Filter Toolbar */}
      <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8794]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter paths and lessons by keyword..."
            className="h-10 w-full rounded-lg border border-[#303A44] bg-[#101418] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#7B8794] focus:border-[#A3E635] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  topic === t
                    ? "bg-[#173D35] text-[#A3E635] border border-[#2B5E52]"
                    : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
                }`}
              >
                {t === "all" ? "All Topics" : t.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  difficulty === d
                    ? "bg-[#202831] text-[#F3F4F6] border border-[#4B5866]"
                    : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
                }`}
              >
                {d === "all" ? "All Levels" : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <section aria-labelledby="paths-heading" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="paths-heading" className="text-xl font-semibold text-[#F3F4F6]">
            Structured Learning Paths
          </h2>
          <span className="text-xs text-[#7B8794] tabular-nums">
            {filteredPaths.length} path{filteredPaths.length === 1 ? "" : "s"}
          </span>
        </div>

        {filteredPaths.length === 0 ? (
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 text-sm text-[#AAB4BE]">
            No learning paths match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {filteredPaths.map((p) => (
              <Link
                key={p.id}
                href={`/learn/paths/${p.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#303A44] bg-[#171D23] p-6 hover:border-[#4B5866] transition-colors"
              >
                <div>
                  <div className="text-xs text-[#AAB4BE] capitalize">
                    {p.category.replace("-", " ")} · {p.difficulty} · {p.lessonCount} modules
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-[#F3F4F6] group-hover:text-[#A3E635] transition-colors">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#AAB4BE]">
                    {p.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#262F38] pt-4 text-xs text-[#AAB4BE]">
                  <span className="tabular-nums">{p.estimatedMinutes} min total</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#A3E635]">
                    Open Path <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Individual Lessons */}
      <section aria-labelledby="lessons-heading" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="lessons-heading" className="text-xl font-semibold text-[#F3F4F6]">
            Published Modules &amp; Tutorials
          </h2>
          <span className="text-xs text-[#7B8794] tabular-nums">
            {filteredLessons.length} lesson{filteredLessons.length === 1 ? "" : "s"}
          </span>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 text-sm text-[#AAB4BE]">
            No published lessons match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
            {filteredLessons.map((l) => (
              <Link
                key={l.id}
                href={`/learn/lessons/${l.slug}`}
                className="flex flex-col gap-2 p-5 hover:bg-[#202831] transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-xs text-[#7B8794] capitalize tabular-nums">
                    Module {String(l.moduleNumber).padStart(2, "0")} · {l.category.replace("-", " ")} ·{" "}
                    {l.difficulty} · {l.estimatedMinutes} min
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-[#F3F4F6]">
                    {l.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#AAB4BE] line-clamp-1">
                    {l.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3E635] shrink-0">
                  Read Lesson <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
