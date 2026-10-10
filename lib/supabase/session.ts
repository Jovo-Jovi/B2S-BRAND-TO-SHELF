import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { serverTimingHeader } from "@/lib/observability/server-timing";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest, phases = false) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase session helper is missing its environment configuration",
    );
  }

  const started = performance.now();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const userStarted = performance.now();
  try {
    await supabase.auth.getUser();
  } finally {
    if (phases) {
      const header = serverTimingHeader(process.env.VERCEL_ENV, [
        { name: "proxy", dur: performance.now() - started },
        { name: "proxy-user", dur: performance.now() - userStarted },
      ]);
      if (header) response.headers.set("Server-Timing", header);
    }
  }
  return response;
}
