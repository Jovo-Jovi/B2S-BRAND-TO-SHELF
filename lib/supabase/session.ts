import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { deniedCount, runWithPhases } from "@/lib/observability/phase-timing";
import { serverTimingHeader } from "@/lib/observability/server-timing";
import type { Database } from "@/types/database";

import { freshFetch } from "./fresh-fetch";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest, phases = false) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase session helper is missing its environment configuration",
    );
  }

  const started = performance.now();
  return runWithPhases(() => update(request, phases, started, supabaseUrl, supabasePublishableKey));
}

async function update(
  request: NextRequest,
  phases: boolean,
  started: number,
  url: string,
  key: string,
) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, key, {
    global: { fetch: freshFetch },
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
      const samples = [
        { name: "proxy", dur: performance.now() - started },
        { name: "proxy-user", dur: performance.now() - userStarted },
      ];
      const denied = deniedCount();
      if (denied > 0) samples.push({ name: "http-429", dur: denied });
      const header = serverTimingHeader(process.env.VERCEL_ENV, samples);
      if (header) response.headers.set("Server-Timing", header);
    }
  }
  return response;
}
