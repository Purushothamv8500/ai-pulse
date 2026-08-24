"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loggedOut = searchParams.get("logged_out") === "true";
  const justVerified = searchParams.get("verified") === "true";
  const nextUrl = searchParams.get("next") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendSent, setResendSent] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const user = await login(data.email, data.password);
      setLoginName(user.full_name?.split(" ")[0] || "");
      setLoginSuccess(true);
      setTimeout(() => {
        const destination = nextUrl || (user.onboarding_complete ? "/dashboard" : "/onboarding");
        router.push(destination);
      }, 1500);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail === "email_not_verified") {
        setUnverifiedEmail(data.email);
      } else {
        setError(detail || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 bg-[#111110] flex-col justify-between p-10 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1649FF"/>
              <path d="M7 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="1.5" fill="white"/>
            </svg>
            <span className="font-bold text-white text-sm">AI Pulse</span>
          </div>
          <p className="text-[#A8A29E] text-xs uppercase tracking-widest font-semibold mb-4">What is AI Pulse?</p>
          <h2 className="editorial-title text-2xl font-bold text-white leading-snug mb-4">
            Your daily AI intelligence briefing.
          </h2>
          <p className="text-[#57534E] text-sm leading-relaxed">
            Real sources. Real analysis. Personalized to your expertise and interests. Every morning.
          </p>
        </div>
        <p className="text-[#3F3F3F] text-xs">
          © 2026 AI Pulse
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#1649FF"/>
              <path d="M7 14c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="1.5" fill="white"/>
            </svg>
            <span className="font-bold text-[#111110] text-sm">AI Pulse</span>
          </div>

          <h1 className="text-xl font-bold text-[#111110] mb-1">Welcome back</h1>
          <p className="text-sm text-[#57534E] mb-6">Sign in to your AI intelligence dashboard</p>

          {/* Login success state */}
          {loginSuccess && (
            <div className="flex items-center gap-3 bg-[#F0FDF4] border border-[#A7F3D0] text-[#166534] text-sm px-4 py-3 rounded-md mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Welcome back{loginName ? `, ${loginName}` : ""}! Taking you to your dashboard...
              </span>
            </div>
          )}

          {/* Email verified banner */}
          {justVerified && (
            <div className="flex items-start gap-2.5 bg-[#F0FDF4] border border-[#A7F3D0] text-[#166534] text-sm px-4 py-3 rounded-md mb-5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Email confirmed! Your account is active. Sign in below.</span>
            </div>
          )}

          {/* Logout success banner */}
          {loggedOut && (
            <div className="flex items-center gap-2.5 bg-[#F0FDF4] border border-[#A7F3D0] text-[#166534] text-sm px-4 py-3 rounded-md mb-6">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              You've been signed out successfully.
            </div>
          )}

          {/* Email not verified */}
          {unverifiedEmail && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-md px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-[#92400E] mb-1">Confirm your email first</p>
              <p className="text-xs text-[#92400E] leading-relaxed mb-3">
                We sent a verification link to <span className="font-semibold">{unverifiedEmail}</span>.
                Check your inbox (and spam folder) and click the link to activate your account.
              </p>
              {resendSent ? (
                <p className="text-xs text-[#166534] font-semibold">Verification email resent.</p>
              ) : (
                <button
                  onClick={async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-verification`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: unverifiedEmail }),
                    });
                    setResendSent(true);
                  }}
                  className="text-xs font-semibold text-[#1649FF] hover:underline"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E7E5E0] rounded-md bg-white hover:border-[#C9C5BE] transition-colors text-sm font-medium text-[#111110] mb-5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E7E5E0]" />
            <span className="text-xs text-[#A8A29E]">or</span>
            <div className="flex-1 h-px bg-[#E7E5E0]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
              />
              {errors.email && <p className="text-[#B91C1C] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#57534E]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#1649FF] hover:underline">Forgot password?</Link>
              </div>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
              />
              {errors.password && <p className="text-[#B91C1C] text-xs mt-1">{errors.password.message}</p>}
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
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-[#A8A29E] mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#1649FF] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
