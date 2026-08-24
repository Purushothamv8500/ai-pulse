"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { articleApi } from "@/lib/api";
import { cn, difficultyColor, importanceColor, importanceLabel } from "@/lib/utils";
import type { Article } from "@/types";

const CATEGORIES = [
  "All", "AI News", "Research", "New Models", "Model Releases", "Benchmarks",
  "Open Source", "AI Tools", "Developer Tools", "AI Agents", "LLMs", "RAG",
  "Multimodal AI", "AI Safety", "AI Startups", "AI Business", "Tutorials",
];

export default function ExplorePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["articles", category, search, page],
    queryFn: () =>
      articleApi.list({
        page,
        category: category === "All" ? undefined : category,
        search: search || undefined,
      }).then((r) => r.data),
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore</h1>
        <p className="text-gray-600 mt-1">Browse all AI developments by category, topic, or search</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search articles, models, companies..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              category === cat
                ? "bg-pulse-500 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-32" />
          ))}
        </div>
      )}

      {data && (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.total} articles found</p>
          <div className="space-y-3">
            {data.items.map((article: Article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-pulse-200 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {article.category && (
                        <span className="bg-pulse-50 text-pulse-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {article.category}
                        </span>
                      )}
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", importanceColor(article.importance_score))}>
                        {importanceLabel(article.importance_score)}
                      </span>
                      {article.difficulty && (
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", difficultyColor(article.difficulty))}>
                          {article.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-pulse-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{article.summary}</p>
                    )}
                    {article.why_it_matters && (
                      <p className="text-xs text-amber-700 mt-1.5 line-clamp-1">
                        <span className="font-medium">Why it matters: </span>{article.why_it_matters}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {article.companies.slice(0, 3).map((c) => (
                        <span key={c} className="text-xs text-gray-400">{c}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-pulse-500 flex-shrink-0">→</span>
                </div>
              </a>
            ))}
          </div>

          {data.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:border-gray-300"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:border-gray-300"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
