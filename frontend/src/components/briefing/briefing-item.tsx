"use client";

import { useState } from "react";
import { BriefingItem as BriefingItemType } from "@/types";
import { cn } from "@/lib/utils";
import { articleApi } from "@/lib/api";
import { Bookmark, BookmarkCheck, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  item: BriefingItemType;
  position: number;
}

function importanceLabel(score: number): string {
  if (score >= 0.8) return "Critical";
  if (score >= 0.6) return "High signal";
  if (score >= 0.4) return "Worth knowing";
  return "Background";
}

function importanceStyle(score: number): string {
  if (score >= 0.8) return "text-[#7F1D1D] bg-[#FEF2F2]";
  if (score >= 0.6) return "text-[#78350F] bg-[#FFFBEB]";
  return "text-[#A8A29E] bg-[#F2F1EE]";
}

function categoryStyle(cat?: string | null) {
  const c = cat?.toLowerCase() ?? "";
  if (c.includes("model")) return "text-[#1238E8] bg-[#EFF3FF]";
  if (c.includes("research")) return "text-[#0F4C81]  bg-[#EFF6FF]";
  if (c.includes("agent")) return "text-[#581C87] bg-[#FAF5FF]";
  if (c.includes("infra")) return "text-[#166534] bg-[#F0FDF4]";
  if (c.includes("safety")) return "text-[#7F1D1D] bg-[#FEF2F2]";
  if (c.includes("open")) return "text-[#1C4532] bg-[#ECFDF5]";
  return "text-[#57534E] bg-[#F2F1EE]";
}

export function BriefingItemCard({ item, position }: Props) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSave = async () => {
    try {
      if (saved) {
        await articleApi.unsave(item.article.id);
        setSaved(false);
      } else {
        await articleApi.save(item.article.id);
        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const score = item.article.importance_score;

  return (
    <article className="bg-white border border-[#E7E5E0] border-b-0 last:border-b first:rounded-t-sm last:rounded-b-sm hover:bg-[#FDFCFB] transition-colors group">
      <div className="px-6 py-6">

        {/* Meta row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Position */}
            <span className="font-mono text-xs font-bold text-[#C9C5BE] tabular-nums">
              {String(position).padStart(2, "0")}
            </span>

            {/* Category */}
            {item.article.category && (
              <span className={cn("section-label px-2 py-0.5 rounded-sm", categoryStyle(item.article.category))}>
                {item.article.category}
              </span>
            )}

            {/* Importance */}
            <span className={cn("section-label px-2 py-0.5 rounded-sm", importanceStyle(score))}>
              {importanceLabel(score)}
            </span>

            {/* Reading time */}
            {item.estimated_time && (
              <span className="text-xs text-[#A8A29E]">{item.estimated_time}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleSave}
              title={saved ? "Unsave" : "Save"}
              className={cn(
                "p-1.5 rounded-sm transition-colors",
                saved
                  ? "text-[#1649FF] bg-[#EFF3FF]"
                  : "text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F2F1EE]"
              )}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <a
              href={item.article.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Read source"
              className="p-1.5 rounded-sm text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F2F1EE] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-[#111110] leading-snug mb-3 group-hover:text-[#1238E8] transition-colors">
          {item.article.title}
        </h2>

        {/* What happened */}
        {item.summary && (
          <p className="text-sm text-[#57534E] leading-relaxed mb-4">
            {item.summary}
          </p>
        )}

        {/* Why it matters */}
        {item.why_it_matters && (
          <div className="border-l-2 border-[#1649FF] pl-4 mb-4">
            <p className="section-label text-[#1649FF] mb-1.5">Why it matters</p>
            <p className="text-sm text-[#111110] leading-relaxed">{item.why_it_matters}</p>
          </div>
        )}

        {/* Expandable section */}
        {(item.who_should_care.length > 0 || item.what_to_learn.length > 0) && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-[#1649FF] hover:underline transition-colors"
            >
              {expanded ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Who should care & what to learn <ChevronDown className="w-3 h-3" /></>
              )}
            </button>

            {expanded && (
              <div className="mt-4 pt-4 border-t border-[#F2F1EE] space-y-4 animate-fade-in">
                {item.who_should_care.length > 0 && (
                  <div>
                    <p className="section-label text-[#A8A29E] mb-2">Who should care</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.who_should_care.map((who) => (
                        <span key={who} className="text-xs bg-[#F2F1EE] text-[#57534E] px-2.5 py-1 rounded-sm">
                          {who}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.what_to_learn.length > 0 && (
                  <div>
                    <p className="section-label text-[#A8A29E] mb-2">What to learn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.what_to_learn.map((topic) => (
                        <span key={topic} className="text-xs bg-[#EFF3FF] text-[#1238E8] px-2.5 py-1 rounded-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
