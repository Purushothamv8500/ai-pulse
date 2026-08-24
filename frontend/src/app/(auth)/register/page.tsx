"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(data.email, data.password, data.full_name);
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please try again.");
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

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-[#EFF3FF] border border-[#C7D7FE] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#1649FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#111110] mb-2">Confirm your email address</h2>
          <p className="text-sm text-[#57534E] mb-1">We sent a confirmation link to</p>
          <p className="text-sm font-semibold text-[#111110] mb-6">{registeredEmail}</p>
          <p className="text-xs text-[#A8A29E]">
            Didn't receive it?{" "}
            <button
              onClick={async () => {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-verification`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: registeredEmail }),
                });
              }}
              className="text-[#1649FF] font-semibold hover:underline"
            >
              Resend email
            </button>
          </p>
        </div>
      </div>
    );
  }

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
          <p className="text-[#A8A29E] text-xs uppercase tracking-widest font-semibold mb-4">Start for free</p>
          <h2 className="editorial-title text-2xl font-bold text-white leading-snug mb-4">
            Know what's happening in AI. Every morning.
          </h2>
          <p className="text-[#57534E] text-sm leading-relaxed">
            Join professionals, researchers, and developers who start every day with AI Pulse.
          </p>
        </div>
        <p className="text-[#3F3F3F] text-xs">© 2026 AI Pulse</p>
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

          <h1 className="text-xl font-bold text-[#111110] mb-1">Create your account</h1>
          <p className="text-sm text-[#57534E] mb-8">Start getting personalized AI intelligence daily</p>

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
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Full name</label>
              <input
                {...register("full_name")}
                type="text"
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#E7E5E0] bg-white text-[#111110] text-sm placeholder-[#C9C5BE] focus:outline-none focus:border-[#1649FF] focus:ring-2 focus:ring-[#1649FF]/15 transition"
              />
              {errors.full_name && <p className="text-[#B91C1C] text-xs mt-1">{errors.full_name.message}</p>}
            </div>

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
              <label className="block text-xs font-semibold text-[#57534E] mb-1.5">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="Min. 8 characters"
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
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-[#A8A29E] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1649FF] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
