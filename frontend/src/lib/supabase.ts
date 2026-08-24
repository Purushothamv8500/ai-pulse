import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

// Use PKCE flow explicitly so signInWithOAuth always redirects back with
// ?code= (not a hash fragment). detectSessionInUrl is disabled so Supabase
// does not race our manual exchangeCodeForSession call in the callback page.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: false,
  },
});
