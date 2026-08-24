"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to AI, learning the basics" },
  { value: "intermediate", label: "Intermediate", desc: "Know the fundamentals, building with AI" },
  { value: "advanced", label: "Advanced", desc: "Deep practitioner, building AI systems" },
  { value: "expert", label: "Expert", desc: "Researcher or leading AI engineer" },
];

const INTERESTS = [
  "LLMs", "Generative AI", "AI Agents", "RAG", "AI Coding",
  "AI Research", "Computer Vision", "Robotics", "AI Infrastructure",
  "AI Startups", "AI Business", "AI Safety", "Open Source", "AI Tools", "Multimodal AI",
];

const READING_TIMES = [
  { value: "5", label: "5 minutes", desc: "Just the headlines" },
  { value: "15", label: "15 minutes", desc: "Key stories with context" },
  { value: "30", label: "30 minutes", desc: "Deep dives included" },
  { value: "60+", label: "60+ minutes", desc: "Everything, in full detail" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experience_level: "",
    interests: [] as string[],
    reading_time: "",
    delivery_hour: 7,
    delivery_minute: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await userApi.completeOnboarding(formData);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-pulse-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <span className="font-semibold text-gray-900 text-xl">AI Pulse</span>
          </div>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-16 rounded-full transition-colors ${s <= step ? "bg-pulse-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 1 && "What's your AI experience?"}
            {step === 2 && "What are you interested in?"}
            {step === 3 && "How much time do you have?"}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 1 && "We'll calibrate briefings to your level."}
            {step === 2 && "Select all that apply. This shapes your daily briefing."}
            {step === 3 && "We'll send your briefing at the right depth."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setFormData((prev) => ({ ...prev, experience_level: level.value }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    formData.experience_level === level.value
                      ? "border-pulse-500 bg-pulse-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{level.desc}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    formData.interests.includes(interest)
                      ? "border-pulse-500 bg-pulse-500 text-white"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {READING_TIMES.map((rt) => (
                <button
                  key={rt.value}
                  onClick={() => setFormData((prev) => ({ ...prev, reading_time: rt.value }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    formData.reading_time === rt.value
                      ? "border-pulse-500 bg-pulse-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{rt.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{rt.desc}</div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && !formData.experience_level) ||
                  (step === 2 && formData.interests.length === 0)
                }
                className="bg-pulse-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-pulse-600 disabled:opacity-50 transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!formData.reading_time || loading}
                className="bg-pulse-500 text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:bg-pulse-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Setting up..." : "Start my AI Pulse →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
