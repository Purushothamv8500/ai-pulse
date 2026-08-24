"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi, articleApi, learningApi } from "@/lib/api";

export default function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.me().then((r) => r.data),
  });

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => userApi.getPreferences().then((r) => r.data),
  });

  const { data: saved } = useQuery({
    queryKey: ["saved-articles"],
    queryFn: () => articleApi.savedList().then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ["learning-progress"],
    queryFn: () => learningApi.progress().then((r) => r.data),
  });

  const completedTopics = (progress || []).filter((p: any) => p.status === "completed");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Profile</h1>
        <p className="text-gray-600 mt-1">Your AI learning journey</p>
      </div>

      {user && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-pulse-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-pulse-600">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="text-xs text-pulse-600 font-medium mt-0.5 capitalize">
                {prefs?.experience_level || "intermediate"} level
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(saved || []).length}</div>
              <div className="text-xs text-gray-500 mt-1">Saved articles</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{completedTopics.length}</div>
              <div className="text-xs text-gray-500 mt-1">Topics completed</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{(progress || []).length}</div>
              <div className="text-xs text-gray-500 mt-1">Topics started</div>
            </div>
          </div>
        </div>
      )}

      {prefs && prefs.interests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Your Interests</h3>
          <div className="flex flex-wrap gap-2">
            {prefs.interests.map((interest: string) => (
              <span
                key={interest}
                className="bg-pulse-50 text-pulse-700 border border-pulse-100 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {saved && saved.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Saved Articles</h3>
          <div className="space-y-3">
            {saved.map((article: any) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-pulse-700">
                    {article.title}
                  </p>
                  {article.category && (
                    <p className="text-xs text-gray-500 mt-0.5">{article.category}</p>
                  )}
                </div>
                <span className="text-gray-400 group-hover:text-pulse-500 ml-3">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
