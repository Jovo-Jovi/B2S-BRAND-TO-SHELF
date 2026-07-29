# Balance Bites Unified App

Six single-file HTML business tools for Balance Bites are being unified into one white-label web app (Vite + React + TypeScript, static on Vercel).

## Start here

1. Read `docs/method/BB_DEV_OS.md` for the operating method.
2. Read `SESSION_CONTEXT.md` before every agent session.
3. Legacy tools live in `legacy/` — **frozen, read-only reference** (see `legacy/FREEZE.md`).
4. Audit and proposal docs are flat under `docs/` (`REPORT.md`, `UNIFICATION.md`, `inventory.json`).
5. Run Stage B (delta audit) per `docs/method/DELTA_RUN_01.md` before any planning or code.

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
| `docs/ADRs/` | Architecture decision records (empty until C5) |
