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

A signed mid-phase amendment gets its own branch and its own consolidated PR,
on the same terms.

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
