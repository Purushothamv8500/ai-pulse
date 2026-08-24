export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  onboarding_complete: boolean;
  created_at: string;
}

export interface UserPreferences {
  experience_level: string;
  interests: string[];
  reading_time: string;
  delivery_hour: number;
  delivery_minute: number;
  timezone: string;
  email_enabled: boolean;
  email_frequency: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  why_it_matters: string | null;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  companies: string[];
  models_mentioned: string[];
  key_concepts: string[];
  affected_users: string[];
  learning_topics: string[];
  difficulty: string | null;
  estimated_reading_time: string | null;
  importance_score: number;
  published_at: string | null;
  source_id: string;
  is_processed: boolean;
  created_at: string;
}

export interface BriefingItem {
  id: string;
  position: number;
  summary: string | null;
  why_it_matters: string | null;
  who_should_care: string[];
  what_to_learn: string[];
  difficulty: string | null;
  estimated_time: string | null;
  article: Article;
}

export interface Briefing {
  id: string;
  date: string;
  title: string;
  greeting: string | null;
  summary: string | null;
  learning_topic: string | null;
  learning_why: string | null;
  learning_explanation: string | null;
  learning_resources: { title: string; url: string; type: string; time: string }[];
  is_published: boolean;
  items_count: number;
  items: BriefingItem[];
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LearningProgressEntry {
  topic_id: string;
  status: "started" | "completed";
  progress_percent: number;
}
