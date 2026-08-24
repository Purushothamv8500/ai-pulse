"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type State = "loading" | "success" | "already_verified" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setState("error");
          return;
        }

        if (data.message === "already_verified") {
          setState("already_verified");
        } else {
          setEmail(data.email || "");
          setState("success");
        }
      } catch {
        setState("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">

        {state === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-[#1649FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#57534E]">Verifying your email...</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-14 h-14 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111110] mb-2">Email confirmed</h2>
            <p className="text-sm text-[#57534E] mb-1">Your AI Pulse account is now active.</p>
            {email && <p className="text-xs text-[#A8A29E] mb-6">{email}</p>}
            <Link
              href="/login?verified=true"
              className="inline-flex items-center gap-2 bg-[#1649FF] text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-[#1238E8] transition-colors"
            >
              Sign in to AI Pulse
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </>
        )}

        {state === "already_verified" && (
          <>
            <div className="w-14 h-14 bg-[#EFF3FF] border border-[#C7D7FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#1649FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111110] mb-2">Already verified</h2>
            <p className="text-sm text-[#57534E] mb-6">Your account is already active. Go ahead and sign in.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#1649FF] text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-[#1238E8] transition-colors"
            >
              Sign in
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-14 h-14 bg-[#FEF2F2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-[#B91C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#111110] mb-2">Link expired or invalid</h2>
            <p className="text-sm text-[#57534E] mb-6 leading-relaxed">
              Verification links expire after 24 hours. Register again or request a new link from the sign-in page.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#1649FF] text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-[#1238E8] transition-colors"
              >
                Back to sign in
              </Link>
              <Link href="/register" className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">
                Create a new account
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
