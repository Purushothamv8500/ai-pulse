"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { briefingApi, userApi } from "@/lib/api";
import { BriefingItemCard } from "@/components/briefing/briefing-item";
import type { Briefing, User } from "@/types";
import { ArrowRight, BookOpen } from "lucide-react";

interface DashboardStats {
  active_sources: number;
  today_articles: number;
  high_signal_today: number;
  briefing_status: "none" | "generating" | "ready";
  briefing_items: number;
  experience_level: string | null;
  onboarding_complete: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function DashboardPage() {
  const { data: user } = useQuery<User>({
    queryKey: ["me"],
    queryFn: () => userApi.me().then((r) => r.data),
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => userApi.stats().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: briefing, isLoading, error } = useQuery<Briefing>({
    queryKey: ["briefing-today"],
    queryFn: () => briefingApi.today().then((r) => r.data),
    retry: false,
  });

  const firstName = user?.full_name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* Page header — editorial style */}
      <div className="bg-white border-b border-[#E7E5E0]">
        <div className="max-w-4xl mx-auto px-8 py-7">
          <p className="section-label text-[#A8A29E] mb-1.5">{formatToday()}</p>
          <h1 className="editorial-title text-2xl md:text-3xl font-bold text-[#111110]">
            {firstName ? `${getGreeting()}, ${firstName}.` : "Your AI Pulse."}
          </h1>
          <p className="text-[#57534E] text-sm mt-1">
            {briefing
              ? `Today's briefing has ${briefing.items_count} developments.`
              : "Your daily AI intelligence briefing."}
          </p>
        </div>

        {/* Intelligence strip — real data */}
        <div className="border-t border-[#F2F1EE]">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xl font-bold text-[#111110] tabular-nums">
                  {stats ? stats.today_articles : "—"}
                </p>
                <p className="text-xs text-[#A8A29E] mt-0.5">Stories today</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#111110] tabular-nums">
                  {stats ? stats.active_sources : "—"}
                </p>
                <p className="text-xs text-[#A8A29E] mt-0.5">Sources monitored</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#111110] tabular-nums">
                  {stats ? stats.high_signal_today : "—"}
                </p>
                <p className="text-xs text-[#A8A29E] mt-0.5">High-signal</p>
              </div>
              <div>
                <p className={`text-xl font-bold tabular-nums ${
                  stats?.briefing_status === "ready"
                    ? "text-[#166534]"
                    : stats?.briefing_status === "generating"
                    ? "text-[#78350F]"
                    : "text-[#A8A29E]"
                }`}>
                  {stats?.briefing_status === "ready"
                    ? "Ready"
                    : stats?.briefing_status === "generating"
                    ? "Generating"
                    : "—"}
                </p>
                <p className="text-xs text-[#A8A29E] mt-0.5">Briefing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-px">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#E7E5E0] p-6 animate-pulse">
                <div className="flex gap-4 mb-3">
                  <div className="h-3 bg-[#F2F1EE] rounded w-16" />
                  <div className="h-3 bg-[#F2F1EE] rounded w-12" />
                </div>
                <div className="h-5 bg-[#F2F1EE] rounded w-3/4 mb-3" />
                <div className="h-3 bg-[#F2F1EE] rounded mb-2" />
                <div className="h-3 bg-[#F2F1EE] rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* No briefing yet */}
        {error && !isLoading && (
          <div className="bg-white border border-[#E7E5E0] p-12 text-center">
            <p className="section-label text-[#A8A29E] mb-4">AI Pulse</p>
            <h2 className="editorial-title text-xl font-bold text-[#111110] mb-3">
              Your briefing is being prepared
            </h2>
            <p className="text-[#57534E] text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              AI Pulse is analyzing today's AI developments and ranking them by importance.
              Check back shortly, or explore past briefings.
            </p>
            <Link
              href="/briefings"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1649FF] hover:underline"
            >
              Browse past briefings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {briefing && (
          <div>
            {/* Greeting strip */}
            {briefing.greeting && (
              <div className="bg-[#EFF3FF] border border-[#C0D0FF] px-6 py-4 mb-6 rounded-sm">
                <p className="text-sm text-[#1238E8] leading-relaxed">{briefing.greeting}</p>
              </div>
            )}

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#57534E] uppercase tracking-widest">
                Today's AI Developments · {briefing.items_count} stories
              </h2>
              <Link href="/briefings" className="text-xs text-[#1649FF] hover:underline flex items-center gap-1">
                All briefings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Stories */}
            <div className="space-y-px">
              {briefing.items.map((item) => (
                <BriefingItemCard key={item.id} item={item} position={item.position} />
              ))}
            </div>

            {/* Learning recommendation */}
            {briefing.learning_topic && (
              <div className="mt-8 bg-white border border-[#E7E5E0] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#F2F1EE] rounded-sm flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4 text-[#57534E]" />
                  </div>
                  <div className="flex-1">
                    <p className="section-label text-[#A8A29E] mb-2">Today's Learning Priority</p>
                    <h3 className="font-bold text-[#111110] text-base mb-1">{briefing.learning_topic}</h3>
                    {briefing.learning_why && (
                      <p className="text-sm text-[#57534E] leading-relaxed mb-4">{briefing.learning_why}</p>
                    )}
                    {briefing.learning_explanation && (
                      <p className="text-sm text-[#57534E] leading-relaxed mb-4">{briefing.learning_explanation}</p>
                    )}
                    {briefing.learning_resources.length > 0 && (
                      <div className="space-y-2 mt-4 border-t border-[#E7E5E0] pt-4">
                        <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">Resources</p>
                        {briefing.learning_resources.map((resource, i) => (
                          <a
                            key={i}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between py-2.5 px-0 border-b border-[#F2F1EE] last:border-0 hover:text-[#1649FF] group transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#111110] group-hover:text-[#1649FF] transition-colors">
                                {resource.title}
                              </p>
                              <p className="text-xs text-[#A8A29E] mt-0.5">{resource.type} · {resource.time}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#1649FF] transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
