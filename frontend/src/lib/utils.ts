import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function difficultyColor(difficulty: string | null): string {
  switch (difficulty?.toLowerCase()) {
    case "beginner": return "text-green-600 bg-green-50";
    case "intermediate": return "text-yellow-600 bg-yellow-50";
    case "advanced": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
}

export function importanceLabel(score: number): string {
  if (score >= 0.8) return "Critical";
  if (score >= 0.6) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
}

export function importanceColor(score: number): string {
  if (score >= 0.8) return "text-red-600 bg-red-50";
  if (score >= 0.6) return "text-orange-600 bg-orange-50";
  if (score >= 0.4) return "text-yellow-600 bg-yellow-50";
  return "text-gray-600 bg-gray-50";
}
