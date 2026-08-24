"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { userApi } from "@/lib/api";
import { logout } from "@/lib/auth";

const INTERESTS = [
  "LLMs", "Generative AI", "AI Agents", "RAG", "AI Coding",
  "AI Research", "Computer Vision", "Robotics", "AI Infrastructure",
  "AI Startups", "AI Business", "AI Safety", "Open Source", "AI Tools", "Multimodal AI",
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "New to AI" },
  { value: "intermediate", label: "Intermediate", desc: "Some AI knowledge" },
  { value: "advanced", label: "Advanced", desc: "Deep AI experience" },
  { value: "expert", label: "Expert", desc: "AI professional" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E7E5E0]">
      <div className="px-6 py-4 border-b border-[#E7E5E0]">
        <h2 className="text-sm font-bold text-[#111110]">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => userApi.me().then((r) => r.data),
  });

  const { data: prefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: () => userApi.getPreferences().then((r) => r.data),
  });

  const [profileForm, setProfileForm] = useState({ full_name: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [prefsForm, setPrefsForm] = useState({
    experience_level: "intermediate",
    interests: [] as string[],
    reading_time: "15",
    delivery_hour: 7,
    email_enabled: true,
    timezone: "UTC",
  });

  useEffect(() => {
    if (user) setProfileForm({ full_name: user.full_name || "" });
  }, [user]);

  useEffect(() => {
    if (prefs) {
      setPrefsForm({
        experience_level: prefs.experience_level,
        interests: prefs.interests || [],
        reading_time: prefs.reading_time || "15",
        delivery_hour: prefs.delivery_hour ?? 7,
        email_enabled: prefs.email_enabled ?? true,
        timezone: prefs.timezone || "UTC",
      });
    }
  }, [prefs]);

  const profileMutation = useMutation({
    mutationFn: (data: { full_name: string }) => userApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setProfileSaved(true);
      setProfileError("");
      setTimeout(() => setProfileSaved(false), 2500);
    },
    onError: (err: any) => setProfileError(err?.response?.data?.detail || "Failed to update profile"),
  });

  const prefsMutation = useMutation({
    mutationFn: (data: typeof prefsForm) => userApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    },
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.new_password.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    if (pwForm.new_password !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    setPwLoading(true);
    try {
      await userApi.changePassword(pwForm.current_password, pwForm.new_password);
      setPwSuccess(true);
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err?.response?.data?.detail || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setPrefsForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="bg-white border-b border-[#E7E5E0] px-8 py-6">
        <p className="section-label text-[#A8A29E] mb-1">Account</p>
        <h1 className="editorial-title text-2xl font-bold text-[#111110]">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

        {/* Profile */}
        <Section title="Profile">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Full name</label>
              <input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Email</label>
              <input
                value={user?.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-[#F8F7F4] text-[#A8A29E] text-sm cursor-not-allowed"
              />
              <p className="text-xs text-[#A8A29E] mt-1">Email cannot be changed.</p>
            </div>
            {profileError && <p className="text-xs text-[#B91C1C]">{profileError}</p>}
            <button
              onClick={() => profileMutation.mutate(profileForm)}
              disabled={profileMutation.isPending}
              className="bg-[#111110] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#1649FF] disabled:opacity-50 transition-colors"
            >
              {profileMutation.isPending ? "Saving..." : profileSaved ? "Saved" : "Save profile"}
            </button>
          </div>
        </Section>

        {/* Password */}
        {user?.hashed_password !== "" && (
          <Section title="Change password">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Current password</label>
                <input
                  type="password"
                  value={pwForm.current_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">New password</label>
                <input
                  type="password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>
              {pwError && <p className="text-xs text-[#B91C1C]">{pwError}</p>}
              {pwSuccess && <p className="text-xs text-[#166534] font-semibold">Password updated successfully.</p>}
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-[#111110] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#1649FF] disabled:opacity-50 transition-colors"
              >
                {pwLoading ? "Updating..." : "Update password"}
              </button>
            </form>
          </Section>
        )}

        {/* Experience */}
        <Section title="Experience level">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setPrefsForm((p) => ({ ...p, experience_level: level.value }))}
                className={`p-3 rounded-md border-2 text-left transition-all ${
                  prefsForm.experience_level === level.value
                    ? "border-[#1649FF] bg-[#EFF3FF]"
                    : "border-[#E7E5E0] hover:border-[#C9C5BE]"
                }`}
              >
                <p className={`text-xs font-bold ${prefsForm.experience_level === level.value ? "text-[#1649FF]" : "text-[#111110]"}`}>
                  {level.label}
                </p>
                <p className="text-[10px] text-[#A8A29E] mt-0.5">{level.desc}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* Interests */}
        <Section title="Interests">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  prefsForm.interests.includes(interest)
                    ? "border-[#1649FF] bg-[#1649FF] text-white"
                    : "border-[#E7E5E0] text-[#57534E] hover:border-[#C9C5BE]"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Email delivery">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111110]">Daily email briefing</p>
                <p className="text-xs text-[#A8A29E] mt-0.5">Receive your briefing in your inbox</p>
              </div>
              <button
                onClick={() => setPrefsForm((p) => ({ ...p, email_enabled: !p.email_enabled }))}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${prefsForm.email_enabled ? "bg-[#1649FF]" : "bg-[#E7E5E0]"}`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${prefsForm.email_enabled ? "translate-x-5" : "translate-x-0.5"}`} style={{width:'18px',height:'18px'}} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Delivery hour</label>
                <select
                  value={prefsForm.delivery_hour}
                  onChange={(e) => setPrefsForm((p) => ({ ...p, delivery_hour: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-[#E7E5E0] rounded-md text-sm text-[#111110] focus:outline-none focus:border-[#1649FF] bg-white"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{i.toString().padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Timezone</label>
                <select
                  value={prefsForm.timezone}
                  onChange={(e) => setPrefsForm((p) => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E7E5E0] rounded-md text-sm text-[#111110] focus:outline-none focus:border-[#1649FF] bg-white"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Reading time preference</label>
              <div className="flex gap-2">
                {[["5", "5 min"], ["10", "10 min"], ["15", "15 min"], ["30", "30 min"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setPrefsForm((p) => ({ ...p, reading_time: val }))}
                    className={`flex-1 py-2 rounded-md border text-xs font-medium transition-all ${
                      prefsForm.reading_time === val
                        ? "border-[#1649FF] bg-[#EFF3FF] text-[#1649FF]"
                        : "border-[#E7E5E0] text-[#57534E] hover:border-[#C9C5BE]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Save preferences */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => prefsMutation.mutate(prefsForm)}
            disabled={prefsMutation.isPending}
            className="bg-[#1649FF] text-white text-sm font-semibold px-6 py-2.5 rounded-md hover:bg-[#1238E8] disabled:opacity-50 transition-colors"
          >
            {prefsMutation.isPending ? "Saving..." : prefsSaved ? "Saved!" : "Save preferences"}
          </button>
          <button onClick={logout} className="text-xs text-[#A8A29E] hover:text-[#7F1D1D] transition-colors">
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
