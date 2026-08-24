import Link from "next/link";

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="6" fill="#1649FF"/>
    <path d="M7 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="1.5" fill="white"/>
  </svg>
);

const categories = [
  "LLMs", "AI Agents", "RAG", "Research", "New Models",
  "Infrastructure", "Open Source", "AI Safety", "Enterprise AI", "Benchmarks",
  "Robotics", "Multimodal", "Fine-tuning", "AI Startups", "Regulation",
];

const features = [
  {
    title: "Autonomous source research",
    desc: "Monitors 50+ verified AI sources every hour — company blogs, arXiv, GitHub, RSS feeds. No hallucinations. Only real information from real sources.",
    tag: "Ingestion",
  },
  {
    title: "Why it matters analysis",
    desc: "Every story is analyzed for technical significance, business impact, and who should care. Not just a summary — real context.",
    tag: "AI Analysis",
  },
  {
    title: "Personalized daily briefing",
    desc: "Ranked by importance to you — your expertise level, role, and interests. 5–15 minutes depending on your reading preference.",
    tag: "Personalization",
  },
  {
    title: "Learning recommendations",
    desc: "Every briefing includes a curated learning path tied to today's top developments — papers, courses, resources.",
    tag: "Learning",
  },
  {
    title: "Email delivery",
    desc: "Briefing sent to your inbox every morning at your configured time and timezone. Readable on any device.",
    tag: "Email",
  },
  {
    title: "Knowledge profile",
    desc: "Tracks what you've read and learned. Over time, AI Pulse builds an estimated knowledge profile to improve personalization.",
    tag: "Intelligence",
  },
];

const faqs = [
  {
    q: "Is AI Pulse actually free?",
    a: "Yes — the core experience is free. You get daily briefings, AI analysis, and learning recommendations at no cost. A Pro plan with deeper personalization is coming soon.",
  },
  {
    q: "How is this different from an AI newsletter?",
    a: "Newsletters are written by humans, published on a fixed schedule, and sent to everyone the same way. AI Pulse is automated, runs every hour, analyzes sources with AI, and personalizes every briefing to each user's expertise and interests.",
  },
  {
    q: "Where does the news come from?",
    a: "Real sources — AI company blogs (OpenAI, Anthropic, Google, Meta), arXiv research papers, GitHub releases, Hugging Face, tech publications, and more. The AI never invents news. Every story links to the original source.",
  },
  {
    q: "How does personalization work?",
    a: "During onboarding you set your experience level (Beginner → Expert), interests (LLMs, AI Agents, Robotics, etc.), and preferred reading time. AI Pulse uses this to rank stories by relevance and adjusts over time as your reading history grows.",
  },
  {
    q: "Can I control what I receive?",
    a: "Yes. You can change your interests, experience level, briefing length, delivery time, and timezone at any time in Settings. You can also enable or disable email delivery.",
  },
  {
    q: "How often is the briefing generated?",
    a: "Sources are checked every hour. Your personal briefing is generated once a day at your configured delivery time in your timezone. High-signal breaking developments may appear in tomorrow's briefing.",
  },
];

export default function LandingPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#111110]">

      {/* ── Header ── */}
      <header className="border-b border-[#E7E5E0] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Logo />
            <span className="font-bold text-[#111110] text-base tracking-tight">AI Pulse</span>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#how", label: "How it works" },
              { href: "#example", label: "Briefing" },
              { href: "#coverage", label: "Coverage" },
              { href: "#pricing", label: "Pricing" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[#57534E] hover:text-[#111110] text-sm px-3 py-2 rounded-md hover:bg-[#F2F1EE] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login" className="text-[#57534E] hover:text-[#111110] text-sm font-medium px-3 py-2 transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link href="/register" className="bg-[#1649FF] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#1238E8] transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-[#E7E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="section-label text-[#A8A29E] mb-5">{today}</p>
            <h1 className="editorial-title text-4xl md:text-6xl font-bold text-[#111110] mb-6">
              Your daily intelligence
              <br />
              layer for AI.
            </h1>
            <p className="text-lg md:text-xl text-[#57534E] leading-relaxed mb-8 max-w-xl">
              AI Pulse automatically researches today's most important AI developments,
              explains why they matter, and tells you what to learn next —
              personalized to your expertise and interests.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="bg-[#1649FF] text-white px-7 py-3.5 rounded-md font-semibold hover:bg-[#1238E8] transition-colors inline-flex items-center justify-center gap-2 text-sm">
                Start reading AI Pulse
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a href="#features" className="border border-[#E7E5E0] text-[#57534E] px-7 py-3.5 rounded-md font-medium hover:border-[#C9C5BE] hover:text-[#111110] transition-colors text-sm inline-flex items-center justify-center">
                See all features
              </a>
            </div>
          </div>
        </div>

        {/* Intel strip */}
        <div className="border-t border-[#E7E5E0] bg-[#F8F7F4]">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <div className="flex flex-wrap gap-8 md:gap-16">
              {[
                { value: "Daily", label: "Automated briefing" },
                { value: "Real sources", label: "Not LLM hallucinations" },
                { value: "Personalized", label: "By your interests & level" },
                { value: "Free to start", label: "No credit card" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-bold text-[#111110]">{item.value}</p>
                  <p className="text-xs text-[#A8A29E] mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-b border-[#E7E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">Features</p>
              <p className="text-xs text-[#A8A29E] mt-2 leading-relaxed">
                Everything you need to stay ahead in AI — built in.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-x-12 gap-y-10">
              {features.map((f) => (
                <div key={f.title}>
                  <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#1649FF] bg-[#EFF3FF] px-2 py-0.5 rounded-sm mb-3">
                    {f.tag}
                  </span>
                  <h3 className="font-bold text-[#111110] text-sm mb-2">{f.title}</h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-b border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">How it works</p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-10">
              {[
                { num: "01", title: "Autonomous research", desc: "AI Pulse monitors 50+ real AI sources every hour — blogs, papers, GitHub, RSS feeds. No LLM hallucinations. Only real, verified sources." },
                { num: "02", title: "Intelligence analysis", desc: "Every development is analyzed: what happened, why it matters technically and commercially, who should care, and what changed." },
                { num: "03", title: "Personalized ranking", desc: "Stories are ranked by importance and relevance to your expertise level, role, and interests — not by recency alone." },
                { num: "04", title: "Daily briefing + email", desc: "Every morning, your personalized briefing arrives in-app and via email. Read it in 5–15 minutes depending on your preference." },
              ].map((item) => (
                <div key={item.num}>
                  <p className="text-2xl font-bold text-[#E7E5E0] mb-3 font-mono">{item.num}</p>
                  <h3 className="font-bold text-[#111110] mb-2 text-sm">{item.title}</h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Briefing Example ── */}
      <section id="example" className="border-b border-[#E7E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">Briefing example</p>
              <p className="text-xs text-[#A8A29E] mt-2 leading-relaxed">This is what a real briefing story looks like.</p>
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-label text-[#1649FF]">New Model</span>
                <span className="text-[#E7E5E0]">·</span>
                <span className="section-label text-[#78350F]">High signal</span>
                <span className="text-[#E7E5E0]">·</span>
                <span className="text-xs text-[#A8A29E]">5 min read</span>
              </div>
              <h2 className="editorial-title text-2xl md:text-3xl font-bold text-[#111110] mb-4">
                Anthropic releases Claude 3.5 Haiku with 2× faster inference at lower cost
              </h2>
              <p className="text-[#57534E] leading-relaxed mb-6 text-sm">
                Anthropic released Claude 3.5 Haiku, their fastest model yet, delivering 2× faster
                inference at meaningfully lower cost than previous Claude versions — while maintaining
                strong performance on coding and reasoning benchmarks.
              </p>
              <div className="border-l-2 border-[#1649FF] pl-5 mb-6">
                <p className="section-label text-[#1649FF] mb-2">Why it matters</p>
                <p className="text-[#111110] leading-relaxed text-sm">
                  Developers building production AI applications can now achieve comparable
                  quality with significantly lower latency and cost. Applications that previously
                  required Claude 3 Sonnet may now use Haiku, cutting inference costs by up to 4×.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center mb-6">
                <span className="text-xs text-[#A8A29E]">Who should care:</span>
                {["AI Engineers", "Founders", "Product Managers"].map((who) => (
                  <span key={who} className="text-xs bg-[#F2F1EE] text-[#57534E] px-2.5 py-1 rounded-sm">{who}</span>
                ))}
              </div>
              <div className="border-t border-[#E7E5E0] pt-5">
                <p className="section-label text-[#A8A29E] mb-2">Learning recommendation</p>
                <p className="text-sm font-semibold text-[#111110]">Understanding LLM Inference Optimization</p>
                <p className="text-xs text-[#A8A29E] mt-1">45 min · Intermediate · Tied to today's top story</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coverage ── */}
      <section id="coverage" className="border-b border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">Coverage</p>
              <p className="text-xs text-[#A8A29E] mt-2 leading-relaxed">
                Every corner of AI, filtered to what actually matters.
              </p>
            </div>
            <div className="flex-1 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat} className="border border-[#E7E5E0] text-[#57534E] text-sm px-4 py-2 rounded-sm bg-white hover:border-[#C9C5BE] transition-colors">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="border-b border-[#E7E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">Pricing</p>
              <p className="text-xs text-[#A8A29E] mt-2 leading-relaxed">
                Simple and honest.
              </p>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-6 max-w-2xl">
              {/* Free plan */}
              <div className="border border-[#E7E5E0] rounded-md p-7 bg-[#F8F7F4]">
                <p className="section-label text-[#A8A29E] mb-4">Free</p>
                <p className="text-3xl font-bold text-[#111110] mb-1">$0</p>
                <p className="text-xs text-[#A8A29E] mb-6">Forever free</p>
                <ul className="space-y-3 mb-7">
                  {[
                    "Daily AI briefing",
                    "Why it matters analysis",
                    "Learning recommendations",
                    "Email delivery",
                    "Up to 5 interest topics",
                    "Knowledge profile",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#57534E]">
                      <svg className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block text-center bg-[#111110] text-white text-sm font-semibold py-2.5 rounded-md hover:bg-[#1649FF] transition-colors">
                  Get started free
                </Link>
              </div>

              {/* Pro plan */}
              <div className="border-2 border-[#1649FF] rounded-md p-7 relative">
                <span className="absolute -top-3 left-5 bg-[#1649FF] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                  Coming soon
                </span>
                <p className="section-label text-[#1649FF] mb-4">Pro</p>
                <p className="text-3xl font-bold text-[#111110] mb-1">$9<span className="text-base font-normal text-[#A8A29E]">/mo</span></p>
                <p className="text-xs text-[#A8A29E] mb-6">Everything in Free, plus</p>
                <ul className="space-y-3 mb-7">
                  {[
                    "Unlimited interest topics",
                    "Deep research mode",
                    "Multi-source corroboration",
                    "Briefing archive (90 days)",
                    "Priority email delivery",
                    "API access",
                    "Slack / Notion integration",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#57534E]">
                      <svg className="w-4 h-4 text-[#1649FF] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <button disabled className="block w-full text-center bg-[#EFF3FF] text-[#1649FF] text-sm font-semibold py-2.5 rounded-md cursor-not-allowed opacity-60">
                  Join waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-b border-[#E7E5E0]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-16 flex-col lg:flex-row">
            <div className="lg:w-48 shrink-0">
              <p className="section-label text-[#A8A29E]">FAQ</p>
              <p className="text-xs text-[#A8A29E] mt-2 leading-relaxed">
                Common questions answered.
              </p>
            </div>
            <div className="flex-1 max-w-2xl divide-y divide-[#E7E5E0]">
              {faqs.map((faq) => (
                <div key={faq.q} className="py-6 first:pt-0">
                  <h3 className="font-bold text-[#111110] text-sm mb-2">{faq.q}</h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#111110]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl">
            <p className="section-label text-[#57534E] mb-5">AI Pulse</p>
            <h2 className="editorial-title text-3xl md:text-4xl font-bold text-white mb-4">
              Stay intelligent, not overwhelmed.
            </h2>
            <p className="text-[#A8A29E] text-base mb-8 leading-relaxed">
              The AI space moves too fast to follow manually.
              AI Pulse does the research so you can focus on what matters: understanding and learning.
            </p>
            <Link href="/register" className="bg-[#1649FF] text-white px-7 py-3.5 rounded-md font-semibold hover:bg-[#1238E8] transition-colors inline-flex items-center gap-2 text-sm">
              Start reading AI Pulse — it's free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E7E5E0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo />
                <span className="font-bold text-sm text-[#111110]">AI Pulse</span>
              </div>
              <p className="text-xs text-[#A8A29E] max-w-xs leading-relaxed">
                Know what happened. Understand why it matters. Learn what's next.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-16 gap-y-8">
              <div>
                <p className="section-label text-[#C9C5BE] mb-3">Product</p>
                <div className="space-y-2">
                  {[
                    { href: "#features", label: "Features" },
                    { href: "#how", label: "How it works" },
                    { href: "#pricing", label: "Pricing" },
                    { href: "#example", label: "Briefing example" },
                  ].map((item) => (
                    <a key={item.href} href={item.href} className="block text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <p className="section-label text-[#C9C5BE] mb-3">Coverage</p>
                <div className="space-y-2">
                  {["LLMs", "AI Agents", "Research", "Open Source", "AI Safety"].map((item) => (
                    <span key={item} className="block text-xs text-[#A8A29E]">{item}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="section-label text-[#C9C5BE] mb-3">Account</p>
                <div className="space-y-2">
                  <Link href="/register" className="block text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">Create account</Link>
                  <Link href="/login" className="block text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">Sign in</Link>
                  <a href="#faq" className="block text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">FAQ</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E7E5E0] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#A8A29E] text-xs">© 2026 AI Pulse. All rights reserved.</p>
            <p className="text-[#A8A29E] text-xs">Built for the AI-curious professional.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
