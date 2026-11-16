"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import { ArrowRight, Search } from "lucide-react";

interface SearchDoc {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  category: string;
  difficulty?: string;
  tags: string[];
  searchableText: string;
  url: string;
}

export function SearchPageClient({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState("all");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/search/index.json")
      .then((r) => r.json())
      .then((data: SearchDoc[]) => {
        setDocs(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

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
    if (docs.length > 0) instance.addAll(docs);
    return instance;
  }, [docs]);

  const results = useMemo(() => {
    const base = query.trim()
      ? (mini.search(query.trim()) as unknown as SearchDoc[])
      : docs;
    if (typeFilter === "all") return base;
    return base.filter((d) =>
      typeFilter === "reference"
        ? d.type === "reference" || d.type === "guide"
        : d.type === typeFilter
    );
  }, [query, typeFilter, mini, docs]);

  const filters = [
    { key: "all", label: "All" },
    { key: "tutorial", label: "Lessons" },
    { key: "learning_path", label: "Learning Paths" },
    { key: "writeup", label: "Write-ups" },
    { key: "reference", label: "Resources" },
    { key: "glossary", label: "Glossary" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8794]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Linux commands, permissions, SSH, networking, glossary..."
            className="h-11 w-full rounded-lg border border-[#303A44] bg-[#101418] pl-10 pr-4 text-sm text-[#F3F4F6] placeholder-[#7B8794] focus:border-[#A3E635] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === f.key
                  ? "bg-[#173D35] text-[#A3E635] border border-[#2B5E52]"
                  : "text-[#AAB4BE] hover:bg-[#202831] hover:text-[#F3F4F6]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-center text-sm text-[#AAB4BE]">
          Loading search index...
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-8 text-center text-sm text-[#AAB4BE]">
          No results found for &ldquo;{query}&rdquo;. Try searching terms like{" "}
          <button type="button" onClick={() => setQuery("chmod")} className="text-[#A3E635] underline">
            chmod
          </button>
          ,{" "}
          <button type="button" onClick={() => setQuery("ssh")} className="text-[#A3E635] underline">
            ssh
          </button>
          , or{" "}
          <button type="button" onClick={() => setQuery("dns")} className="text-[#A3E635] underline">
            dns
          </button>
          .
        </div>
      ) : (
        <div className="divide-y divide-[#262F38] rounded-xl border border-[#303A44] bg-[#171D23]">
          {results.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="flex items-center justify-between gap-4 p-5 hover:bg-[#202831] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs text-[#7B8794] capitalize">
                  {item.type.replace("_", " ")} · {item.category}
                  {item.difficulty ? ` · ${item.difficulty}` : ""}
                </div>
                <div className="mt-1 text-base font-semibold text-[#F3F4F6]">
                  {item.title}
                </div>
                <p className="mt-1 text-sm text-[#AAB4BE] line-clamp-1">{item.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#7B8794]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
