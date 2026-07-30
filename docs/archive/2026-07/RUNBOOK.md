# RUNBOOK — from zero to the first build task

Four stages. Follow in order. Tick as you go.

---

# STAGE 1 — SET UP (one sitting, ~1 hour)

### ☐ 1.1 Back up browser data — do this before opening the sticker tool again

Open any remaining tool HTML file **from the folder the deleted file lived in** → F12 → Console → paste `backup-browser-data.js` → Enter.

Console should report `BBLabelDB presets recovered: N`. If it says NOT found, try a different tool file from that folder. Save the downloaded JSON — it is the only copy of those presets.

### ☐ 1.2 Create the folder structure

```
balance-bites-unified/
├─ README.md
├─ .gitignore
├─ AGENTS.md                    ← from rules/AGENTS.md
├─ SESSION_CONTEXT.md           ← create empty, fill in 1.4
├─ DEVELOPMENT_JOURNAL.md       ← create empty
├─ .cursor/rules/
│   ├─ bb-devos.mdc             ← from rules/CURSOR_RULES.md, File 1
│   ├─ bb-returns.mdc           ← File 2
│   └─ bb-print.mdc             ← File 3
├─ legacy/                      ← FROZEN. read-only from here on
│   ├─ bb-stock-costs.html
│   ├─ balance-bites-invoice-pro.html
│   ├─ balance-bites-sticker.html
│   ├─ balance-bites-label-editor- latest.html
│   ├─ balance-bites-stand.html
│   ├─ balance-bites-carton (2).html
│   ├─ bb-browser-data-backup-*.json
│   └─ FREEZE.md
├─ tools/
│   └─ backup-browser-data.js
└─ docs/
    ├─ REPORT.md
    ├─ UNIFICATION.md
    ├─ inventory.json
    ├─ RETURNS_ADDENDUM.md      ← write this: your returns notes, verbatim
    ├─ ADRs/                    ← empty for now
    └─ method/
        ├─ DEV_OS_REFERENCE.md
        ├─ BB_DEV_OS.md
        ├─ PHASE_PLAN.md
        ├─ PROMPT_PACK.md
        ├─ DELTA_RUN_01.md
        └─ CLAUDE_PROJECT_INSTRUCTIONS.md
```

> Keep `docs/` flat for the audit files — the prompts reference `docs/REPORT.md`, `docs/DELTA_REPORT_01.md` etc. by that exact path.

**`legacy/FREEZE.md`** — three lines is enough:

```markdown
# FREEZE POINT
Frozen: <date>. The port is built and parity-tested against these files.
Any change to a legacy tool after this date requires a numbered delta audit
and a signed OD amendment.

MISSING: balance-bites-label-v3.html — deleted permanently <date>, replaced by
balance-bites-sticker.html. Its only surviving record is docs/REPORT.md §2.2.
Its browser data (bbbacklabel_* keys, BBLabelDB) is preserved in
bb-browser-data-backup-*.json and is the P02 migration source.
```

**`.gitignore`**

```
node_modules/
dist/
.env*
.DS_Store
```

### ☐ 1.3 Push to GitHub — **make the repo PRIVATE**

The browser backup contains customer names, phones, addresses, and invoice history. The audit flagged this as High severity. Private, not public.

```bash
cd balance-bites-unified
git init
git add .
git commit -m "Freeze legacy tools + audit docs + Dev OS method"
gh repo create balance-bites-unified --private --source=. --push
```

No `gh`? Create the private repo on github.com, then:

```bash
git remote add origin https://github.com/<you>/balance-bites-unified.git
git branch -M main
git push -u origin main
```

### ☐ 1.4 Write `SESSION_CONTEXT.md`

```markdown
# SESSION CONTEXT
Updated: <date> · By: human · Phase: PRE-P00 · Last task: repo freeze · Verdict: —

## Where we are
Legacy tools frozen in legacy/. Audit docs present but STALE on three files.
Delta audit not yet run. No code exists.

## Active carry-forwards
- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
- [ ] CF-02 — Unescaped innerHTML in all legacy tools; every ported renderer escapes
- [ ] CF-03 — Legacy catch(e){} swallowing; ported paths surface errors
- [ ] CF-04 — Older returns lack outAllocations; both shapes must render
- [ ] CF-05 — Print calibration unresolved until OD-5 signed

## Environment quirks (never re-discover)
- Brave isolates IndexedDB per file:// origin. Legacy data is only visible from
  a tool file in its original folder.
- balance-bites-label-v3.html deleted permanently. REPORT.md §2.2 is the sole
  record of its behaviour. Do not infer beyond it.

## Frozen decisions in force
- Freeze point set <date> (legacy/FREEZE.md). None signed yet — OD-1..OD-12 open.

## Next action
DELTA_RUN_01.md — Pass 1.
```

Commit.

### ☐ 1.5 Create the Claude Project

Name: `Balance Bites — Unified App`. Paste `CLAUDE_PROJECT_INSTRUCTIONS.md` into the instructions field. Upload as knowledge: `BB_DEV_OS.md`, `DEV_OS_REFERENCE.md`, `REPORT.md`, `UNIFICATION.md`, `inventory.json`, `RETURNS_ADDENDUM.md`, `PHASE_PLAN.md`.

Sanity check — ask it: *"State the three surfaces, the authority rule, and what you are never allowed to do."*

---

# STAGE 2 — REFRESH THE TRUTH (~half a day)

Everything from `docs/method/DELTA_RUN_01.md`. Fresh agent window per pass, Opus, read-only.

### ☐ 2.1 Pass 1 — full audit of the sticker tool → `docs/AUDIT_STICKER.md`
### ☐ 2.2 Pass 2 — delta on the two business tools → `docs/DELTA_REPORT_01.md` + `docs/DELTA_SCHEMA.md`
### ☐ 2.3 Pass 3 — reconcile REPORT / inventory.json / UNIFICATION
### ☐ 2.4 Re-run `backup-browser-data.js` and diff against 1.1 — did the sticker tool touch `BBLabelDB`?
### ☐ 2.5 Pass 4 — paste all three reports into the Claude Project for the verdict

Commit after each pass. **PASS required before Stage 3.**

---

# STAGE 3 — FREEZE THE CONTRACT (~1–2 days)

`PROMPT_PACK.md § C`, in order. Claude Project authors each; a builder land task commits it.

### ☐ 3.1 C1 → `docs/SCOPE.md` + `docs/DECISIONS.md` (OD-1…OD-12, unsigned)

### ☐ 3.2 **Sign the ODs.** Read each, write your decision and the date.

Do OD-7 (returns semantics) and OD-11 (configurable tax) first — they change the data model, and C3 cannot start without them.

### ☐ 3.3 C2 → `docs/PARITY_MATRIX.md`
### ☐ 3.4 C3 → `docs/DATA_MODEL.md`
### ☐ 3.5 C4 → `docs/BRAND_CONFIG.md`
### ☐ 3.6 C5 → `docs/ARCHITECTURE.md` + `docs/ADRs/ADR-001..008.md`
### ☐ 3.7 C6 → `docs/PRINT_CONTRACT.md`
### ☐ 3.8 C7 → `docs/MODULE_SPEC.md`
### ☐ 3.9 C8 → `docs/MASTER_PROMPT.md`

### ☐ 3.10 Revise `PHASE_PLAN.md` P06 against the sticker audit

The label-v3 removal invalidates T06.1, T06.6, T06.9 and the P06 title. Do this once, here, with the audit in hand.

Commit. **No code exists yet. That is correct.**

---

# STAGE 4 — START BUILDING

### ☐ 4.1 Open a new conversation in the Claude Project

Opening message:

```
Starting P01 — Foundation.

SESSION_CONTEXT.md: [paste current contents]

The document pipeline is complete and committed: SCOPE, DECISIONS (all 12 ODs
signed), PARITY_MATRIX, DATA_MODEL, BRAND_CONFIG, ARCHITECTURE + ADR-001..008,
PRINT_CONTRACT, MODULE_SPEC, MASTER_PROMPT. PHASE_PLAN P06 revised after the
sticker audit.

Emit the T01.1 task prompt.
```

### ☐ 4.2 Run the loop

```
Claude Project emits T0n
  → fresh IDE window, correct model class
  → "Read SESSION_CONTEXT.md and AGENTS.md, then execute T0n."
  → builder reports back
  → paste report into Claude Project
  → PASS/FAIL + next prompt
```

One task per window. Commit per task. Update `SESSION_CONTEXT.md` + `DEVELOPMENT_JOURNAL.md` every session.

---

## The three things that break this if skipped

1. **Skipping the delta audit** — every downstream document derives from the data model, and the data model is currently wrong about returns.
2. **Signing ODs late** — OD-7 and OD-11 change entity shapes. Signing them after `DATA_MODEL.md` means rewriting it and everything under it.
3. **Writing code during Stage 3** — the whole point of the frozen contract is that the build has nothing left to improvise.
