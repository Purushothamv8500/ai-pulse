"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { briefingApi } from "@/lib/api";
import { BriefingItemCard } from "@/components/briefing/briefing-item";
import { formatDate } from "@/lib/utils";
import type { Briefing } from "@/types";

export default function BriefingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: briefing, isLoading } = useQuery<Briefing>({
    queryKey: ["briefing", id],
    queryFn: () => briefingApi.get(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse h-40" />
        ))}
      </div>
    );
  }

  if (!briefing) return <div className="p-8 text-gray-500">Briefing not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-2">
        <Link href="/briefings" className="text-sm text-gray-500 hover:text-gray-700">← All briefings</Link>
      </div>
      <div className="mb-8">
        <p className="text-sm text-gray-500">{formatDate(briefing.date)}</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">{briefing.title}</h1>
        {briefing.greeting && (
          <div className="bg-pulse-50 rounded-xl p-4 border border-pulse-100 mt-4">
            <p className="text-pulse-800 font-medium text-sm">{briefing.greeting}</p>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-bold text-gray-900">Top AI Developments</h2>
        {briefing.items.map((item) => (
          <BriefingItemCard key={item.id} item={item} position={item.position} />
        ))}
      </div>

      {briefing.learning_topic && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📚</span>
            <h2 className="text-lg font-bold text-gray-900">Today's Recommended Learning</h2>
          </div>
          <div className="space-y-3">
            <p className="text-xl font-semibold text-gray-900">{briefing.learning_topic}</p>
            {briefing.learning_why && <p className="text-gray-700 text-sm">{briefing.learning_why}</p>}
            {briefing.learning_explanation && <p className="text-gray-600 text-sm leading-relaxed">{briefing.learning_explanation}</p>}
            {briefing.learning_resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-900">{r.title}</span>
                <span className="text-xs text-gray-500 ml-2">{r.type} · {r.time}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
