import "server-only";

import { redirect } from "next/navigation";

import { timePhase } from "@/lib/observability/phase-timing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { decide } from "./destination";
import { repairOnboardingDraft } from "./actions";
import type { GateDecision, GateState, LocaleCode, RequestedScreen, ResumeStep } from "./types";
import { RESUME_STEPS } from "./types";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function isResume(value: string): value is ResumeStep {
  return (RESUME_STEPS as readonly string[]).includes(value);
}

export async function readOnboardingState(): Promise<GateState> {
  const supabase = await createSupabaseServerClient();
  const [auth, tenant] = await Promise.all([
    timePhase("gate-user", () => supabase.auth.getUser()),
    timePhase("gate-tenant", () => supabase.rpc("current_tenant_id")),
  ]);
  if (!auth.data.user) return { kind: "anonymous" };
  if (tenant.error) {
    throw new Error("onboarding could not resolve the current tenant");
  }
  if (!tenant.data) return { kind: "welcome" };

  const [owner, draft, brand] = await timePhase("gate-wave", () =>
    Promise.all([
      supabase.rpc("is_current_tenant_owner"),
      supabase.from("onboarding_draft").select("resume_step, archived_at").maybeSingle(),
      supabase.from("brand").select("current_profile_id").maybeSingle(),
    ]),
  );
  if (owner.error) {
    throw new Error("onboarding could not resolve the caller's role");
  }
  if (!owner.data) return { kind: "pending" };
  if (draft.error) {
    throw new Error("onboarding could not read the draft");
  }
  if (brand.error) {
    throw new Error("onboarding could not read the brand");
  }
  const currentProfile = Boolean(brand.data?.current_profile_id);

  if (draft.data && !draft.data.archived_at && isResume(draft.data.resume_step)) {
    return { kind: "draft", resume: draft.data.resume_step };
  }
  if (currentProfile) return { kind: "complete" };
  return { kind: "repair" };
}

export async function resolveOnboarding(
  locale: LocaleCode,
  requested: RequestedScreen,
): Promise<GateDecision> {
  let state = await readOnboardingState();
  if (state.kind === "repair") {
    await repairOnboardingDraft({ locale });
    state = await readOnboardingState();
  }
  return decide(locale, state, requested);
}

export function send(decision: GateDecision): void {
  if (decision.type === "redirect") redirect(decision.href);
}

export type { Client };
