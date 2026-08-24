import json
import structlog
from anthropic import AsyncAnthropic
from app.ai.base import AIProvider, ArticleAnalysis, BriefingItemAnalysis, DailyLearning
from tenacity import retry, stop_after_attempt, wait_exponential

logger = structlog.get_logger()


ARTICLE_ANALYSIS_PROMPT = """You are an expert AI analyst for AI Pulse, an AI intelligence platform.

Analyze the following AI-related article and return a JSON object with this exact structure:

{{
  "summary": "2-3 sentence concise summary of what happened",
  "why_it_matters": "2-3 sentences explaining practical significance — what changes because of this, who benefits",
  "category": "one of: AI News, Research, New Models, Model Releases, Benchmarks, Open Source, AI Tools, Developer Tools, AI Agents, LLMs, RAG, Multimodal AI, Computer Vision, Robotics, AI Infrastructure, AI Safety, AI Startups, AI Business, AI Regulations, Tutorials, Technical Articles",
  "subcategory": "more specific subcategory",
  "tags": ["tag1", "tag2"],
  "companies": ["company names mentioned"],
  "models_mentioned": ["AI model names"],
  "key_concepts": ["key technical concepts"],
  "technologies": ["technologies mentioned"],
  "affected_users": ["Developers", "Researchers", "Founders", "Students", "AI enthusiasts"],
  "learning_topics": ["topics to learn related to this"],
  "difficulty": "beginner | intermediate | advanced",
  "estimated_reading_time": "5 minutes | 10 minutes | 30 minutes | 1 hour",
  "importance_score": 0.0-1.0,
  "technical_significance": 0.0-1.0,
  "business_significance": 0.0-1.0,
  "novelty_score": 0.0-1.0,
  "industry_impact": 0.0-1.0,
  "source_credibility": 0.0-1.0
}}

Title: {title}
URL: {url}
Content: {content}

Return ONLY valid JSON, no markdown, no explanations."""

BRIEFING_ITEM_PROMPT = """You are an expert AI analyst for AI Pulse.

Given this AI development, generate a briefing item for a {experience_level} user interested in {interests}.

Return JSON:
{{
  "summary": "clear, concise explanation of what happened (2-3 sentences)",
  "why_it_matters": "practical significance — what changes, why it matters NOW (2-3 sentences, specific not generic)",
  "who_should_care": ["specific personas like: Developers, Researchers, Founders, Students"],
  "what_to_learn": ["specific learning topics relevant to this development"],
  "difficulty": "beginner | intermediate | advanced",
  "estimated_time": "5 minutes | 10 minutes | 30 minutes | 1 hour"
}}

Article title: {title}
Article summary: {summary}
Category: {category}

Return ONLY valid JSON."""

DAILY_LEARNING_PROMPT = """You are an AI learning advisor for AI Pulse.

Based on today's top AI developments, recommend one learning topic for a {experience_level} user.

Today's top stories: {stories}

Return JSON:
{{
  "topic": "topic name",
  "why": "2-3 sentences: why this topic is relevant to today's developments",
  "explanation": "3-4 sentences: clear explanation of this concept",
  "resources": [
    {{"title": "resource name", "url": "https://...", "type": "article|video|docs|tutorial", "time": "5 min"}},
    {{"title": "resource name", "url": "https://...", "type": "article|video|docs|tutorial", "time": "20 min"}}
  ],
  "estimated_time": "total learning time"
}}

Return ONLY valid JSON."""

CLASSIFICATION_PROMPT = """Classify this AI article quickly.

Title: {title}
Preview: {content_preview}

Return JSON:
{{
  "category": "AI News|Research|New Models|Model Releases|Benchmarks|Open Source|AI Tools|Developer Tools|AI Agents|LLMs|RAG|Multimodal AI|Computer Vision|Robotics|AI Infrastructure|AI Safety|AI Startups|AI Business|AI Regulations|Tutorials|Technical Articles",
  "importance_score": 0.0-1.0,
  "is_ai_related": true|false
}}

Return ONLY valid JSON."""


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str):
        self.client = AsyncAnthropic(api_key=api_key)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def analyze_article(
        self, title: str, content: str, url: str, model: str
    ) -> ArticleAnalysis:
        prompt = ARTICLE_ANALYSIS_PROMPT.format(
            title=title,
            url=url,
            content=content[:3000],
        )
        message = await self.client.messages.create(
            model=model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        return ArticleAnalysis(**data)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_briefing_item(
        self, article: dict, user_context: dict, model: str
    ) -> BriefingItemAnalysis:
        prompt = BRIEFING_ITEM_PROMPT.format(
            experience_level=user_context.get("experience_level", "intermediate"),
            interests=", ".join(user_context.get("interests", ["LLMs", "AI Tools"])),
            title=article.get("title", ""),
            summary=article.get("summary", ""),
            category=article.get("category", ""),
        )
        message = await self.client.messages.create(
            model=model,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        return BriefingItemAnalysis(**data)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_daily_learning(
        self, top_articles: list[dict], user_context: dict, model: str
    ) -> DailyLearning:
        stories = "\n".join(
            f"- {a.get('title', '')}: {a.get('summary', '')[:100]}"
            for a in top_articles[:5]
        )
        prompt = DAILY_LEARNING_PROMPT.format(
            experience_level=user_context.get("experience_level", "intermediate"),
            stories=stories,
        )
        message = await self.client.messages.create(
            model=model,
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        data = json.loads(raw)
        return DailyLearning(**data)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def classify_article(
        self, title: str, content_preview: str, model: str
    ) -> dict:
        prompt = CLASSIFICATION_PROMPT.format(
            title=title,
            content_preview=content_preview[:500],
        )
        message = await self.client.messages.create(
            model=model,
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = message.content[0].text.strip()
        return json.loads(raw)
