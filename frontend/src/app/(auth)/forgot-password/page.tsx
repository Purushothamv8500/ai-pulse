"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

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

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-[#EFF3FF] border border-[#C7D7FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#1649FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111110] mb-2">Check your email</h2>
            <p className="text-sm text-[#57534E] mb-1">If an account exists for</p>
            <p className="text-sm font-semibold text-[#111110] mb-4">{email}</p>
            <p className="text-sm text-[#57534E] mb-6">you'll receive a password reset link shortly.</p>
            <Link href="/login" className="text-sm text-[#1649FF] font-semibold hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#111110] mb-1">Forgot your password?</h1>
            <p className="text-sm text-[#57534E] mb-8">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
                />
              </div>
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
                    Sending...
                  </>
                ) : "Send reset link"}
              </button>
            </form>

            <p className="text-center text-xs text-[#A8A29E] mt-6">
              Remember it?{" "}
              <Link href="/login" className="text-[#1649FF] font-semibold hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
