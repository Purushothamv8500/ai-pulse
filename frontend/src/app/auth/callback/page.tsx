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
      // Read URL entirely client-side (inside useEffect = browser only)
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      // ── 0. Surface any OAuth error Supabase / Google returned ─────────────
      const oauthError =
        searchParams.get("error") || hashParams.get("error");
      if (oauthError) {
        const desc =
          searchParams.get("error_description") ||
          hashParams.get("error_description") ||
          "Google sign-in was cancelled or failed.";
        console.error("[auth/callback] OAuth error:", oauthError, "|", desc);
        setError(desc);
        return;
      }

      // ── 1. Obtain a Supabase session ───────────────────────────────────────
      let session = null;

      const code = searchParams.get("code");

      if (code) {
        // PKCE path — Supabase returned ?code=… (expected when flowType:'pkce')
        console.log("[auth/callback] PKCE code found — calling exchangeCodeForSession");
        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error(
            "[auth/callback] exchangeCodeForSession failed:",
            exchangeError.message,
            "| status:", exchangeError.status
          );
          setError("Authentication failed. Please try again.");
          return;
        }
        if (!data.session) {
          console.error("[auth/callback] exchangeCodeForSession: no session in response");
          setError("Authentication failed. Please try again.");
          return;
        }
        session = data.session;
        console.log("[auth/callback] PKCE exchange OK — user:", session.user?.email ?? "(no email)");

      } else {
        // No ?code= in URL — log what IS in the URL for diagnosis
        console.warn(
          "[auth/callback] No ?code= in URL.",
          "| search:", window.location.search || "(empty)",
          "| hash length:", window.location.hash.length
        );

        // Implicit-flow fallback: hash still has tokens (rare with flowType:'pkce'
        // but possible if the Supabase project overrides to implicit server-side)
        const hashAccessToken = hashParams.get("access_token");
        const hashRefreshToken = hashParams.get("refresh_token");

        if (hashAccessToken && hashRefreshToken) {
          console.log("[auth/callback] Implicit hash tokens present — calling setSession");
          const { data, error: setSessionError } =
            await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            });
          if (setSessionError) {
            console.error("[auth/callback] setSession failed:", setSessionError.message);
            setError("Authentication failed. Please try again.");
            return;
          }
          session = data.session;
          console.log("[auth/callback] setSession OK — user:", session?.user?.email ?? "(no email)");

        } else {
          // Last resort: check if Supabase already stored a session (magic link etc.)
          console.log("[auth/callback] No hash tokens — calling getSession as last resort");
          const { data, error: sessionError } =
            await supabase.auth.getSession();
          if (sessionError) {
            console.error("[auth/callback] getSession error:", sessionError.message);
          }
          session = data?.session ?? null;
          console.log("[auth/callback] getSession result:", session ? "session found" : "no session");
        }
      }

      if (!session) {
        console.error(
          "[auth/callback] Could not obtain session via any path.",
          "| code present:", !!code,
          "| hash present:", window.location.hash.length > 1
        );
        setError("Authentication failed. Please try again.");
        return;
      }

      // ── 2. Exchange Supabase session for AI Pulse JWT ──────────────────────
      console.log("[auth/callback] Calling backend /api/v1/auth/supabase...");
      try {
        const res = await api.post("/auth/supabase", {
          access_token: session.access_token,
        });

        setTokens({
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token,
          token_type: res.data.token_type ?? "bearer",
        });

        console.log(
          "[auth/callback] Backend auth OK — onboarding_complete:",
          res.data.onboarding_complete
        );
        router.push(res.data.onboarding_complete ? "/dashboard" : "/onboarding");

      } catch (backendErr: any) {
        const status = backendErr?.response?.status;
        const detail =
          backendErr?.response?.data?.detail ?? backendErr?.message ?? "network error";
        console.error(
          "[auth/callback] Backend /auth/supabase failed — HTTP", status, "|", detail
        );
        if (status === 501) {
          setError("Server configuration error: Supabase is not configured on the backend. Contact support.");
        } else {
          setError("Sign-in completed but account setup failed. Please try again.");
        }
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="text-center">
          <div className="w-10 h-10 bg-[#FEF2F2] border border-[#FECACA] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-5 h-5 text-[#B91C1C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-sm text-[#57534E] mb-4">{error}</p>
          <a
            href="/login"
            className="text-[#1649FF] text-sm font-semibold hover:underline"
          >
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
