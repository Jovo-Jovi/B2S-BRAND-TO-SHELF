// ADR-005 — QUARANTINE. This is the only construction of the privileged
// (service_role) client in the codebase, and the RLS bypass therefore exists in
// exactly one auditable place: reviewing "what can bypass tenant isolation" is
// reading this file, not searching a repository.
//
// Permitted uses: tenant provisioning and operator functions. Nothing else.
// Every use writes an ActivityEvent (SECURITY_MODEL.md §2.5, §7).
//
// Two mechanisms keep it here. `import "server-only"` fails the build at
// compile time if any module in a client bundle reaches this file, and
// scripts/check-service-import.mjs fails CI on any import of this directory
// from app/, features/ or components/. The guard exists because the compile
// error only fires for code that actually ships to the browser, while the rule
// is that feature code may not reach this module at all.
import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase service-role client is missing its environment configuration",
    );
  }

  // No session is persisted and no token is refreshed: this client is never a
  // user, so anything that would carry its authority across calls is a defect.
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
