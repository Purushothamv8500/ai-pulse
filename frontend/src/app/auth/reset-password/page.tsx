"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login?verified=true"), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-[#57534E] mb-4">Invalid reset link.</p>
          <Link href="/forgot-password" className="text-[#1649FF] text-sm font-semibold hover:underline">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1649FF"/>
            <path d="M7 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="1.5" fill="white"/>
          </svg>
          <span className="font-bold text-[#111110] text-sm">AI Pulse</span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111110] mb-2">Password updated</h2>
            <p className="text-sm text-[#57534E]">Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#111110] mb-1">Set a new password</h1>
            <p className="text-sm text-[#57534E] mb-8">Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>

              {error && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#7F1D1D] text-sm px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1649FF] text-white py-2.5 rounded-md font-semibold hover:bg-[#1238E8] disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Updating...
                  </>
                ) : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1649FF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
