import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// ARCHITECTURE.md §4 — the browser client acts AS THE MEMBER. It carries the
// publishable key only, so every row it reads is evaluated by RLS against the
// caller's tenant and no policy can be bypassed from here. A page that forgets
// its own check shows an empty result, never another tenant's data.
//
// Read statically, not through a computed key: Next.js inlines NEXT_PUBLIC_
// variables into the client bundle only for literal member access.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase browser client is missing its environment configuration",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
