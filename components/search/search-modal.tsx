"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import { ArrowRight, Search, X } from "lucide-react";

interface SearchDoc {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "tutorial" | "learning_path" | "writeup" | "guide" | "reference" | "glossary";
  category: string;
  difficulty?: string;
  tags: string[];
  searchableText: string;
  url: string;
}

const TYPE_LABELS: Record<string, string> = {
  all: "All",
  tutorial: "Lessons",
  learning_path: "Paths",
  writeup: "Write-ups",
  reference: "References",
  glossary: "Glossary",
};

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 20);
    if (loaded) return;
    fetch("/search/index.json")
      .then((res) => res.json())
      .then((data: SearchDoc[]) => {
        setDocs(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const mini = useMemo(() => {
    const instance = new MiniSearch<SearchDoc>({
      fields: ["title", "description", "tags", "searchableText", "category"],
      storeFields: ["id", "title", "description", "type", "category", "difficulty", "url"],
      searchOptions: {
        boost: { title: 4, tags: 2, description: 2 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
    if (docs.length > 0) {
      instance.addAll(docs);
    }
    return instance;
  }, [docs]);

  const results = useMemo(() => {
    const base = query.trim()
      ? (mini.search(query.trim()) as unknown as SearchDoc[])
      : docs.slice(0, 12);

    if (filterType === "all") return base.slice(0, 14);
    return base
      .filter((item) =>
        filterType === "reference"
          ? item.type === "reference" || item.type === "guide"
          : item.type === filterType
      )
      .slice(0, 14);
  }, [query, filterType, mini, docs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search FORGESEC ACADEMY"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[#303A44] bg-[#171D23] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#303A44] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#AAB4BE]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Linux lessons, networking paths, commands, glossary..."
            className="w-full bg-transparent text-sm text-[#F3F4F6] placeholder-[#7B8794] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-md p-1.5 text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#303A44] px-4 py-2.5">
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterType(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === key
                  ? "bg-[#173D35] text-[#A3E635] border border-[#2B5E52]"
                  : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] overflow-y-auto divide-y divide-[#262F38]">
          {!loaded ? (
            <div className="px-4 py-8 text-center text-sm text-[#AAB4BE]">
              Loading content index...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#AAB4BE]">
              No matching published content found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={onClose}
                className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-[#202831] transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#F3F4F6] truncate">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs text-[#AAB4BE] line-clamp-1">
                    {item.description}
                  </div>
                  <div className="mt-1 text-xs text-[#7B8794]">
                    <span>{TYPE_LABELS[item.type] ?? item.type}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="capitalize">{item.category}</span>
                    {item.difficulty ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span className="capitalize">{item.difficulty}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
              </Link>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#303A44] px-4 py-2.5 text-xs text-[#7B8794]">
          <span>Press Esc to close</span>
          <Link
            href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"}
            onClick={onClose}
            className="text-[#A3E635] hover:underline"
          >
            Open full search page
          </Link>
        </div>
      </div>
    </div>
  );
}
