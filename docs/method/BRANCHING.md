# BRANCHING — B2S

**Status:** IN FORCE. Method document.
**Authored:** 2026-08-01 by the reviewer surface.
**Signed:** the owner, 2026-08-01 — public repository, no required reviews,
no PR approval gate. The owner merges his own work.

---

## 1. The rule

`main` holds the last signed-off state. Always. Nothing lands on `main` that has
not passed its phase exit gate.

## 2. One branch per phase

    phase/01-foundation
    phase/02-<name>
    ...

Named from the build phase plan. Created at phase entry, from `main`.

Task-level commits on the phase branch, one task per fresh builder window. The
phase exit-verification gate runs **on the branch**, before anything is proposed
for merge — the gate's job is to attack the build, and it cannot do that against
a branch that has already landed.

## 3. One consolidated pull request per phase

One PR per phase into `main`. The owner merges it. No reviewer, no approval gate,
no required status check blocking the merge — CI reports, the owner decides.

A phase may hold one pull request against main, opened as a draft at any
point in the phase and marked ready for review only after the phase's exit
gate passes. A draft cannot be merged, so this keeps §3's purpose — one pull
request per phase, merged only after the gate — while giving every push to
the phase branch a pull-request isolation run against staging. It is the
only pull request the phase may hold. Origin: pull requests #4 to #8, each
opened with the owner's credentials during the phase, each running the full
isolation suite on every push.

**AMENDED 2026-10-03 — what the draft is for.** The paragraph above stands and is not edited (PR-07). The draft's value is one pull request per phase that cannot be merged before the gate. It is not per-push isolation coverage, as the reviewer's earlier amendment claimed: pushes that touch schema, migrations, types or the suite already run isolation on the push trigger, and a pull request's path filter matches its whole diff against main, so a draft re-ran the full suite on every push, including docs-only ones — four serialised runs in P03-T17. The pull-request trigger now runs only when the pull request is marked ready, which is the gate moment, and tests the merged result.

**AMENDED 2026-10-05 — both suites wait for ready.** The paragraphs above stand and are not edited (PR-07). The browser tier's pull-request trigger now runs on the same events as isolation's — opened, synchronize, reopened and ready_for_review — and only when the pull request is not a draft. Both suites wait for ready. The push triggers are unchanged.

A signed mid-phase amendment gets its own branch and its own consolidated PR,
on the same terms.

The design-surface catalog lands on the open phase branch as a contiguous
run of tasks, reviewed as one unit inside the phase pull request — not on a
branch of its own. It depends on decisions and documents that exist only on
the phase branch while the phase is open, so a separate branch from main
would either lack its own specification or carry copies of it. The phrase
"its own consolidated pull request" meant reviewable as one unit; a
contiguous task run inside the phase pull request keeps that.

## 3.1 Foundation exception

The task establishing the toolchain and the pipeline may merge on its own,
because every later branch is cut from it and a pipeline living only on a branch
guards nothing. It carries no features, no schema and no data access, so the
phase gate has nothing to test that the branch does not already show. Every other
task follows §3. Signed by the owner, 2026-08-01.

## 3.2 Method amendments

A change to the method — a decision, a precedent, a lifecycle, a conformance
check — is not phase work and lands on `main` directly. §3's one-branch-one-PR
rule governs work that builds the product. Signed by the owner, 2026-08-04.

## 4. Deletion requires verified containment

A phase branch is deleted only after

    git log main..<branch>

returns empty. The verification is recorded in `DEVELOPMENT_JOURNAL.md` with the
branch name. A branch deleted without it may have taken work with it, and there
is no evidence either way afterwards.

## 5. Protections in force

`main` blocks force-push and deletion. Secret scanning and push protection are on
across the repository. `enforce_admins` is false, so an administrator can force-
push deliberately; the block stops accident and tooling, not intent.

No required reviews. No required status checks. The repository is public (OD-G7).

## 6. Credentials

Never in a commit, never in a chat, never in an agent surface. A pasted
credential is treated as compromised and rotated immediately. The Supabase
`service_role` key exists only in Vercel environment variables — never in the
repository, never in a client bundle, never in a migration file (§9 of the
prepare-phase runbook, OD-G7).

Push protection is the mechanism that enforces this at the moment of the push.
It is not disabled for any reason.

---

*Method document. Read with `docs/method/DEV_OS_REFERENCE.md` §6.*
