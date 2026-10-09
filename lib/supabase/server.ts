import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

// ARCHITECTURE.md §4 — the server client also acts AS THE MEMBER. Server
// Components and Server Actions read through RLS exactly as the browser does;
// running on the server buys no additional reach, which is the point. The
// privileged path is lib/supabase/server-only/service.ts and nothing else.
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase server client is missing its environment configuration",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          // A Server Component cannot write cookies, and this call is reached
          // from one whenever a session refresh lands mid-render. The refresh
          // is the middleware's job, so the write is genuinely redundant here
          // rather than lost. Named and narrowed so it is not the silent
          // catch(e){} of CF-03.
          if (!(error instanceof Error)) {
            throw error;
          }
        }
      },
    },
  });
}
