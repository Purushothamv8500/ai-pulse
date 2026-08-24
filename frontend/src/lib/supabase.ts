import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

// createBrowserClient uses cookie-based storage so the PKCE code verifier
// survives the full-page OAuth redirect (localStorage is not reliable across
// navigations in Next.js App Router). detectSessionInUrl: false prevents the
// library from auto-exchanging the ?code= before our useEffect in
// /auth/callback can do it manually.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
  },
});
