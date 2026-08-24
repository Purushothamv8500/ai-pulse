"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { briefingApi } from "@/lib/api";
import type { Briefing } from "@/types";
import { ArrowRight, Newspaper } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function formatShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

export default function BriefingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["briefings"],
    queryFn: () => briefingApi.list().then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="bg-white border-b border-[#E7E5E0] px-8 py-6">
        <p className="section-label text-[#A8A29E] mb-1">Archive</p>
        <h1 className="editorial-title text-2xl font-bold text-[#111110]">All Briefings</h1>
        <p className="text-sm text-[#57534E] mt-1">Your complete AI intelligence history.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {isLoading && (
          <div className="space-y-px">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-[#E7E5E0] p-5 animate-pulse">
                <div className="h-2.5 bg-[#F2F1EE] rounded w-24 mb-3" />
                <div className="h-4 bg-[#F2F1EE] rounded w-2/3 mb-2" />
                <div className="h-2.5 bg-[#F2F1EE] rounded w-16" />
              </div>
            ))}
          </div>
        )}

        {data && data.items?.length > 0 && (
          <div className="space-y-px">
            {data.items.map((briefing: Briefing, index: number) => (
              <Link
                key={briefing.id}
                href={`/briefings/${briefing.id}`}
                className="block bg-white border border-[#E7E5E0] px-6 py-5 hover:bg-[#F8F7FF] hover:border-[#C0D0FF] transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-[#A8A29E] font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="section-label text-[#A8A29E]">{formatDate(briefing.date)}</span>
                    </div>
                    <h2 className="font-bold text-[#111110] text-sm group-hover:text-[#1649FF] transition-colors truncate">
                      {briefing.title || `AI Intelligence Briefing — ${formatShort(briefing.date)}`}
                    </h2>
                    <p className="text-xs text-[#A8A29E] mt-1.5">{briefing.items_count} stories</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C9C5BE] group-hover:text-[#1649FF] transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {data && (!data.items || data.items.length === 0) && (
          <div className="bg-white border border-[#E7E5E0] p-16 text-center">
            <div className="w-12 h-12 bg-[#F2F1EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-5 h-5 text-[#A8A29E]" />
            </div>
            <h3 className="font-bold text-[#111110] mb-2">No briefings yet</h3>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Your first briefing will appear here once AI Pulse finishes analyzing today's AI developments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
