"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setTokens } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Read URL params client-side (runs only in the browser, inside useEffect)
        const params = new URLSearchParams(window.location.search);

        // Supabase may redirect with an error (e.g. user denied consent)
        const oauthError = params.get("error");
        if (oauthError) {
          const desc = params.get("error_description");
          setError(desc || "Google sign-in was cancelled or failed. Please try again.");
          return;
        }

        let session;

        const code = params.get("code");
        if (code) {
          // PKCE flow (default in @supabase/supabase-js v2):
          // Exchange the authorization code for a session using the stored PKCE verifier.
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError || !data.session) {
            setError("Authentication failed. Please try again.");
            return;
          }
          session = data.session;
        } else {
          // Implicit / already-established session fallback
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !data.session) {
            setError("Authentication failed. Please try again.");
            return;
          }
          session = data.session;
        }

        const res = await api.post("/auth/supabase", {
          access_token: session.access_token,
        });

        setTokens({
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
          token_type: res.data.token_type ?? "bearer",
        });

        router.push(res.data.onboarding_complete ? "/dashboard" : "/onboarding");
      } catch {
        setError("Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="text-center">
          <div className="w-10 h-10 bg-[#FEF2F2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-[#B91C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-[#57534E] mb-4">{error}</p>
          <a href="/login" className="text-[#1649FF] text-sm font-semibold hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#1649FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#57534E]">Completing sign in...</p>
      </div>
    </div>
  );
}
