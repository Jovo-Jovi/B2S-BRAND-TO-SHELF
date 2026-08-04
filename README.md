# B2S

Six single-file HTML business tools for Balance Bites are being unified into one white-label web app (Vite + React + TypeScript, static on Vercel).

## Start here

1. Read `docs/method/DEV_OS.md` for the operating method.
2. Read `SESSION_CONTEXT.md` before every agent session.
3. Legacy tools live in `legacy/` — **frozen, read-only reference** (see `legacy/FREEZE.md`).
4. Audit and proposal docs are under `docs/requirements/extracts/REPORT.md`, `docs/archive/2026-07/UNIFICATION.md`, `docs/archive/2026-07/inventory.json`.
5. Run Stage B (delta audit) per `docs/archive/2026-07/DELTA_RUN_01.md` before any planning or code.

## Repo layout

| Path | Purpose |
|---|---|
| `AGENTS.md` / `.cursor/rules/` | Always-on builder rules (Antigravity + Cursor) |
| `SESSION_CONTEXT.md` | Running state — overwritten each session |
| `DEVELOPMENT_JOURNAL.md` | Append-only session log |
| `legacy/` | Frozen HTML tools + browser-data backup |
| `tools/` | One-off utilities (e.g. browser-data backup script) |
| `docs/` | Audit outputs and addenda |
| `docs/method/` | Dev OS, phase plan, prompts |
| `docs/product/ADR.md` | Architecture decision records, append-only |
