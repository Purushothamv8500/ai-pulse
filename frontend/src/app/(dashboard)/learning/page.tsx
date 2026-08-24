"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { learningApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function LearningPage() {
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useQuery({
    queryKey: ["learning-topics"],
    queryFn: () => learningApi.topics().then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ["learning-progress"],
    queryFn: () => learningApi.progress().then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (topicId: string) => learningApi.complete(topicId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["learning-progress"] }),
  });

  const progressMap = new Map<string, { status: string }>(
    (progress || []).map((p: any) => [p.topic_id, p])
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning</h1>
        <p className="text-gray-600 mt-1">Topics recommended from your AI briefings</p>
      </div>

      {progress && progress.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-600">{progress.length}</div>
              <div className="text-xs text-gray-500">Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progress.filter((p: any) => p.status === "completed").length}
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-24" />
          ))}
        </div>
      )}

      {topics && topics.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-lg font-medium">No learning topics yet</p>
          <p className="text-sm mt-1">Topics will appear as briefings are generated.</p>
        </div>
      )}

      {topics && topics.length > 0 && (
        <div className="space-y-3">
          {topics.map((topic: any) => {
            const prog = progressMap.get(topic.id);
            const isCompleted = prog?.status === "completed";

            return (
              <div
                key={topic.id}
                className={cn(
                  "bg-white rounded-xl border p-5 transition-colors",
                  isCompleted ? "border-green-100 bg-green-50/30" : "border-gray-100"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {topic.category && (
                        <span className="bg-pulse-50 text-pulse-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {topic.category}
                        </span>
                      )}
                      {topic.difficulty && (
                        <span className="text-xs text-gray-500">{topic.difficulty}</span>
                      )}
                      {topic.estimated_time && (
                        <span className="text-xs text-gray-500">· {topic.estimated_time}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{topic.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-green-600 text-sm font-medium">✓ Done</span>
                    ) : (
                      <button
                        onClick={() => completeMutation.mutate(topic.id)}
                        disabled={completeMutation.isPending}
                        className="text-xs bg-pulse-50 text-pulse-700 px-3 py-1.5 rounded-lg hover:bg-pulse-100 transition-colors font-medium"
                      >
                        Mark done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
