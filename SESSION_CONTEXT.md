# SESSION CONTEXT
Updated: 2026-07-31 · By: agent · Phase: PREPARE Step 7 · Last task: P-04 · Verdict: PENDING

## Where we are
Greenfield pivot: parity against the six legacy HTML tools is void (OD B1
CLOSED). B2S — Brand to Shelf is a new multi-tenant white-label product; the
legacy tools are retiring, not being ported, and their audit docs are demoted
to requirements evidence. The repo was renamed from `balance-bites-unified` to
`B2S-BRAND-TO-SHELF` (github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF), branch `main`,
public. P-01 restructured the tree: `docs/requirements/`,
`docs/requirements/extracts/`, `docs/archive/2026-07/` and `docs/product/`
created; stale/void method docs and audit outputs archived with an ARCHIVED
banner; requirements-evidence files carry a REQUIREMENTS EVIDENCE banner;
`RETURNS_ADDENDUM.md` → `RETURNS_REQUIREMENTS.md`, `BB_DEV_OS.md` → `DEV_OS.md`,
`.cursor/rules/bb-*.mdc` → `.cursor/rules/b2s-*.mdc`; `RUNBOOK.md` and the old
Claude Project Instructions archived, the new instructions landed at
`docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`, and `VOCABULARY_DRAFT.md` landed
at `docs/product/`. 23 stub files created under `docs/product/` and
`docs/method/`, pending reviewer authorship. `legacy/FREEZE.md` rewritten to
state the tools are retiring, not port targets. P-01 verdict: PASS. P-01b
closed CF-36 and CF-37: `docs/archive/2026-07/inventory.json`'s banner was
reverted so it parses as valid JSON again, with a new
`docs/archive/2026-07/README.md` covering the whole directory instead;
`B2S_PREPARE_PHASE.md` §2's decision register was updated — D10, E11, G10,
G11 (PROPOSED) and E2, E6, H1, H6 (DELEGATED) are now SIGNED, and C16-C19,
E12, G12 were added SIGNED, at that point with the opening line reading "62
decisions" and placeholder Decision text ("SIGNED — see DECISIONS.md") on the
six new rows. P-01b verdict: PASS, with the 56/62 header-vs-row-count
mismatch logged as CF-38. P-01c closed CF-38: root cause was that the
original "56" count summed Groups A-F only and omitted G and H (true
pre-existing total was 73; 79 with the six vocabulary-pass rows). The
register's opening line, the P-06 authoring prompt, and the Gate 3 checklist
now all read 79, matching an independently recomputed row count of 79. §3
("Still open") now reads "none" — its prior four items (D10, G10, E11,
§5 sign-off) are all resolved elsewhere in the document. §5 (Release 1) is
now headed "SIGNED 2026-07-30", with `CreditNote` added to the IN list and
`Shipment` (R1 at data level, R2 UI) confirmed in the OUT-R2 list. The six
C16-C19/E12/G12 placeholder cells now carry real decision text. §7 gained a
stock-creation invariant naming the one write path into `StockLevel`. The
untracked reconfiguration record landed at `docs/method/PROJECT_RECONFIG.md`.
All commits through P-01c are pushed to `origin/main`. P-01c verdict: PASS —
"two flags, both correct, both mine" (the reviewer's own words), referring to
this task's two self-reported deviations: the missing §3/§4 `---` separator,
and CF-38's description having been inferred rather than pre-existing. Those
two flags are logged as CF-39 and CF-40 below.

P-02 performed the first requirements extraction of the retiring tool set:
`legacy/bb-stock-costs.html` → `docs/requirements/extracts/EXTRACT_STOCK_COSTS.md`
(new, REQUIREMENTS EVIDENCE banner copied verbatim from
`docs/requirements/RETURNS_REQUIREMENTS.md`). Read completely in 15 sequential
chunks; final chunk reached line 7083. **Verified line count 7083** — CF-12's
7084 is correct under the trailing-newline display convention and reconciles;
`REPORT.md` §2.3's 5577 is wrong by 1506 lines. `AUDIT_STICKER.md` §3.2.a's
"~319 lines" drift estimate holds only locally: measured drift into this file
ranges +140 to +1506 and is not constant, so every `bb-stock-costs.html`
citation in `REPORT.md`, `UNIFICATION.md` and `PHASE_PLAN.md` needs
re-derivation. All eight Parts complete; Part 7 is exhaustive by classification
rather than line-by-line (501 Arabic literals across 779 lines — every
data-key, bilingual and English-only literal enumerated individually, the
Arabic-only remainder given as complete category inventories). Evidence
delivered for CF-02 (32 unescaped-`innerHTML` sites; four escape functions exist
with four different coverage sets, confined to the two print engines), CF-03
(7 truly empty `catch`, 2 comment-only, 11 swallow-and-substitute), CF-04
(three record shapes distinguished — with `outAllocations`, with an empty array,
and with the key absent — plus a latent fourth for missing
`items[].disposition`), CF-11 (the stock-costs side of the `bb_stickers` link:
what it writes, reads and its seven assumptions; the sticker tool's side left to
P-04), and CF-28 (15 `customer` occurrences, 2 Tenant sense, 13 Buyer sense).
**Redaction applied:** `:1178` `SHARED_DATA_PATH` and the `:902` `file://`
anchor embed the owner's OS account name; the path structure is recorded with
the account name replaced by `<REDACTED>` and the verbatim value is not
transcribed. No credential, key, token or connection string exists in the file;
no real Buyer PII is embedded in source. Ten new findings are listed in the
extract's §C.4 for the reviewer to accept or reject as carry-forwards — **none
was opened as a carry-forward by this task, and no existing carry-forward was
closed.** P-02 verdict: PENDING.

P-03 performed the second requirements extraction:
`legacy/balance-bites-invoice-pro.html` →
`docs/requirements/extracts/EXTRACT_INVOICE_PRO.md` (new, REQUIREMENTS EVIDENCE
banner copied verbatim from `EXTRACT_STOCK_COSTS.md`). Read completely in 11
sequential chunks; final chunk reached line 4283 (`</html>`). **Verified line
count 4283** (`wc -l`; 222,321 bytes; trailing byte confirmed `\n`), **4284 as
displayed** — CF-12's 4,284 is correct and reconciles; `REPORT.md` §2.1's 3,498
is wrong by 785 lines (−18.3%). CORRECTION 2's non-linearity prediction holds:
34 `REPORT.md` §2.1 citations were re-derived and the drift runs
0 → +38 → +111 → +140 → +390 → +652 → +735 → **+3035**. **No redaction was
required** — no credential, key, token, connection string, OS account name or
absolute local path exists in the file, and no buyer PII is seeded in source
(the only URLs are three identical Google Fonts links). All ten Parts complete
(0, 1–4, 5-Payments, 6, 7, 8, 9). Part 7 satisfies CORRECTION 3: every
business-data and document-template literal is individually enumerated, as are
validation messages and English-only strings; only Arabic-only UI chrome is
rolled up.

**Four structural findings dominate the pass.** First, **invoice-pro is not the
returns or payments producer** — `Store.set` is never called with `bb_returns`
or `bb_invoice_payments`, so it is a strict consumer of both; PART 9 R4's
premise is corrected rather than answered as stated. Second, **the
`outAllocations` consumer is identified** at `:2515-2525`, closing the question
P-02 left open, while `toCustomerId`/`toInvoiceId` are written by the producer
and never read. Third, **`bb_color_presets` and `bb_active_color_preset_id` are
written by BOTH tools with incompatible field sets** (7 colours here vs 6 there,
sharing only `bg` and `gold`) under identical ids `cp_def1`–`cp_def4` — an
active data collision on every theme save from either side. Fourth,
**revenue is snapshotted at sale and cost is live**, so the two halves of margin
already follow opposite temporal policies across the family — this sharpens
CF-47 rather than contradicting it.

**R1–R4 answered.** R1: **no tax and no freight exist anywhere in
invoice-pro** (zero matches for `tax`/`VAT`/`ضريبة`/`freight`/`shipping`/`شحن`);
**discount exists** and is invoice-level, percent-based on the subtotal,
unrounded, stored twice with the percent authoritative and the money field
write-only, unguarded above 100% and below 0. R2: **no money value is rounded
anywhere before storage, comparison or aggregation**; the file's only
`Math.round` is a chart bar's width percentage (`:3907`), there is no `toFixed`,
and rounding exists only at display via `fmt` (`:1339`) at 0–2 dp — and
invoice-pro has **no `roundQty` equivalent**, so quantity normalisation diverges
from stock-costs. R3: **invoice-pro has no cost concept at all** — `unitPrice`
is a sale price; the two tools cannot disagree about cost because only one has
one. R4: answered on the corrected producer/consumer basis, with both
`outAllocations` shapes and fourteen renderer conditions documented; P-02's
Part 4 is **confirmed on every point of fact**, with two divergences (return
`amount` semantics; opposite default disposition for unmarked lines) and two
completions contributed by this pass. Evidence delivered for CF-02 (14
unescaped-`innerHTML` sites; three escape functions with one shared coverage set,
all omitting `'`), CF-03 (3 truly empty `catch`, 2 comment-only, 5
swallow-and-substitute, only 2 of 12 reaching the user), CF-04 (both shapes plus
three disposition variants and the fourteen conditions a renderer must handle),
and CF-28 (the collision is **latent, not active** — every `customer` identifier
here means Buyer, and the Tenant has no noun at all, which is why it was never
noticed). Fifteen new findings are listed in the extract's §C.4 for the reviewer
to accept or reject — **none was opened as a carry-forward by this task, and no
existing carry-forward was closed.** P-03 verdict: PENDING.

**Prompt defect encountered and worked around, reported per AGENTS.md §10:** the
P-03 prompt says "Land the **seven** carry-forward rows supplied below" and then
supplies **six** — CF-41, CF-42, CF-43, CF-45, CF-46, CF-47. **CF-44 is skipped
in the sequence and no text for it exists anywhere in the prompt.** The six
supplied rows are landed verbatim below; **no CF-44 row was invented.** This is
CF-40 recurring for a fourth time, in the same session in which CF-40 was
amended to require exactly this not happen.

P-04 performed the third and final requirements extraction, covering the three
remaining design tools together:
`legacy/balance-bites-label-editor- latest.html` (LE),
`legacy/balance-bites-stand.html` (ST) and `legacy/balance-bites-carton (2).html`
(CA) → `docs/requirements/extracts/EXTRACT_DESIGN_TOOLS.md` (new, REQUIREMENTS
EVIDENCE banner copied verbatim from `EXTRACT_INVOICE_PRO.md`). All three read
completely in sequential chunks — LE in 4 chunks to line 2180, ST in 2 chunks to
line 774, CA in 1 chunk to line 459 — each final chunk reaching `</html>`.

**All three line counts are EXACT against `REPORT.md`.** Verified 2,180 / 774 /
459 (`wc -l` 2,179 / 773 / 458 plus the trailing-newline display convention,
matching `REPORT.md`'s 2,179 / 773 / 458 exactly). **This is the opposite of
P-02 and P-03 and it narrows CF-12 sharply:** `REPORT.md` is not uniformly
stale — it is stale only for the two files that kept growing after it was
written. The three design tools were frozen at the time of the report and its
figures for them are authoritative. CF-12's remaining scope is the two business
files, both already re-derived. **CF-12's evidence is now complete.**

**No redaction was required.** Zero credentials, keys, tokens, connection
strings, OS account names, absolute local paths or buyer PII across all three
files; the only URLs are Google Fonts links and a placeholder website string.
The negative result is stated explicitly in the extract at §0.3. **One exposure
was found elsewhere and is NOT this task's to fix:**
`docs/requirements/extracts/AUDIT_STICKER.md:651` transcribes
`SHARED_DATA_PATH` **verbatim including the owner's OS account name**, in a
public repo. P-04 could write only three files and `AUDIT_STICKER.md` is not one
of them. This is CF-14's exposure recurring in a docs file rather than a legacy
file — flagged for the reviewer, not remediated.

All eight Parts complete, plus a Part 0 (provenance) and a Part 9 (closing).
Part 6 exceeds the P-03 standard: **nothing was rolled up at all.** Every
business-data and document-template literal is individually enumerated in both
languages (36 document-template pairs, 6 business-data pairs, 5 fused
literals, 18 English-only printed strings), and the Arabic-only UI chrome that
CF-42's standard would have permitted as a rollup — all 50 of it — is enumerated
individually as well.

**Four structural findings dominate the pass.** First, **the design family does
not divide the way `REPORT.md` §3.3 assumed.** LE, ST and CA touch no shared
folder, no `bb_filestore_v1`, no IndexedDB and no business entity; they hold one
or two `localStorage` keys each and nothing else. The sticker tool holds three
channels and eight shared keys. The real axis is *opted into the shared folder*
(`invoice-pro`, `bb-stock-costs`, `sticker`) versus *did not* (`label-editor`,
`stand`, `carton`) — a line that runs **through** the design family, not around
it. Second, **the coupling that does exist in these three is code, not data**: the
same eight-slot preset-bar component is copied into four files under four
distinct keys (`bblabel_pb`, `bbstand3_pb`, `bbcarton_pb`, `bbinv_pb`), crossing
the business/design boundary, with the copies drifted in language, error
reporting and export shape. Third, **`bb_presets` is a latent collision, not an
active one** — LE is its only writer, but the name is generic, unversioned and
sits in the shared `bb_*` namespace, and it is read and merged with no schema
validation (`LE:1760`). Fourth, **the 40 layout degrees of freedom divide
cleanly**: 27 MUST / 13 ARTIFACT, and the shape of the split is that *every*
substrate dimension is a MUST while *every* free-positioning and per-element
typography control is an ARTIFACT — the legacy set supports the frozen
template-driven decision rather than contradicting it.

**CF-22 is answered with an explicit verdict: overlapping-but-neither.** The
label editor is not a strict subset of the sticker tool and not a distinct class
of packaging output. It is a distinct **physical** output — a continuous
five-segment cruciform wrap strip that no sticker-tool mode can express — sharing
a substantially overlapping **content** model with the sticker tool's back label,
on markedly weaker infrastructure. The verdict rests on eleven `AUDIT_STICKER.md`
citations spot-checked against `legacy/balance-bites-sticker.html` under the
bounded-verification clause; **eleven of eleven hold on the substance the verdict
rests on, so no HALT arose.** One name-level defect was found in a citation the
verdict does **not** rest on and is recorded at §2.1: `AUDIT_STICKER.md` §3.4's
three `ColorPreset` seed names are wrong on all three — the sticker tool seeds
`Dark Gold`, `Obsidian Blue`, `Forest Night`, not "Balance Bites", "Dark Mode",
"Ocean Blue". Four delta questions depend on label-v3 behaviour not recorded in
`REPORT.md` §2.2 or `AUDIT_STICKER.md` §1.1/§1.2 and are marked unresolvable
rather than reasoned out.

**CF-49 answered per file: none of the three reads or writes `bb_color_presets`,
`bb_active_color_preset_id` or `bb_active_theme`** — zero occurrences in all
three, no field set, no id scheme, no theme engine of any kind. **The design
family contributes no third `ColorPreset` field set.** In establishing this, an
**artifact-versus-artifact conflict** surfaced and is recorded unresolved: CF-49
as landed states `bb-stock-costs.html` carries **six** colours, while
`AUDIT_STICKER.md` §C-3 states the sticker tool's set — `{id, name, bg, gold,
txt, mut, row, tot, grand}`, **seven** colour fields — is an "identical field
set" to `bb-stock-costs.html:1347-1350`. Both cannot hold as written. Reading
`bb-stock-costs.html` is forbidden by the P-04 prompt, so no winner was chosen.
The id divergence is separately confirmed and not in dispute: both business tools
seed `cp_def1`–`cp_def4`; the sticker tool seeds `cp_def1`–`cp_def3` only.

Evidence delivered for **CF-02** (complete site inventory — all 10 `innerHTML`
assignments, 7 unescaped and user-derived, 3 constant; grep-confirmed that
`document.write`, `insertAdjacentHTML`, `outerHTML`, `eval`, `new Function` and
`srcdoc` have **zero** occurrences in all three files, so the 7 are the complete
surface) and **CF-03** (complete site inventory — all 12 `catch` blocks: 3 truly
empty, 3 swallow-and-substitute, 5 reporting, 1 log-only; the 3 empty ones are
the same `_pbSav` function in three copies, and each is followed by an
unconditional success toast). Part 7 records **50 numbered defects plus the 2
markup defects**, and — new for this pass — an explicit §7.8 "NOT defects" list
so a later reader does not mistake a decision for a bug. **No carry-forward was
closed by this task**, per the prompt. P-04 verdict: PENDING.

**Prompt defects: none.** P-04's STOP block correctly separates halt conditions
from redact-and-continue conditions, which is what **CF-43** required and it
closes on this emission. The **CF-40 count check passed**: three rows supplied
(CF-44, CF-48, CF-49), three stated, ids matched exactly, with CF-44's gap
declared void by design in the prompt itself. **This is the first CF-landing
prompt in the sequence to execute with zero numbering or count defects**, which
is CF-40's own stated closure condition.

## Active carry-forwards
- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
- [ ] CF-02 — Unescaped innerHTML in all legacy tools. Owner: FEATURE_INVENTORY.md
      must-not-reproduce at P-07. Prior owner "every ported renderer" is void
      framing — nothing is ported. Evidence captured in EXTRACT_STOCK_COSTS.md
      Part 8.
      **P-04 addendum — evidence now COMPLETE for the design family.** All 10
      `innerHTML` assignments across the three design tools enumerated at
      EXTRACT_DESIGN_TOOLS.md §7.1: **7 unescaped and user-derived** (LE:1702,
      :1703, :2141; ST:699, :766; CA:380, :443) and 3 safe constant clears
      (LE:2134, ST:766, CA:440). No escape helper, sanitiser or allow-list exists
      in any of the three. `document.write`, `insertAdjacentHTML`, `outerHTML`,
      `eval`, `new Function` and `srcdoc`: **zero occurrences in all three**, so
      `innerHTML` is the complete sink surface. Reachability chain recorded: the
      JSON import path validates `data.state` for presence only, never `data.name`,
      and `data.name` is persisted and rendered as markup on every subsequent page
      load. Running total across the three extractions: 32 (stock-costs) + 14
      (invoice-pro) + 7 (design tools) = **53 unescaped sites**.
- [ ] CF-03 — Legacy catch(e){} swallowing. Owner: FEATURE_INVENTORY.md
      must-not-reproduce at P-07. Prior owner "every ported renderer" is void
      framing — nothing is ported. Evidence captured in EXTRACT_STOCK_COSTS.md
      Part 8.
      **P-04 addendum — evidence now COMPLETE for the design family.** All 12
      `catch` blocks across the three design tools enumerated at
      EXTRACT_DESIGN_TOOLS.md §7.2: **3 truly empty** (LE:1981, ST:708, CA:398),
      **3 swallow-and-substitute** (LE:1980, ST:707, CA:397), 5 reporting, 1
      log-only (LE:1761-1763). The 3 empty ones are the identical `_pbSav`
      function in three copies of the same preset-bar component, and each is
      followed by an **unconditional success toast** — so a `localStorage` quota
      failure is reported to the operator as `✓ تم حفظ` / `✓ Saved`. The 3
      substitute ones are the identical `_pbLG`, which converts an unreadable slot
      list into an empty one that the next write then makes permanent. Running
      total: 7+2+11 (stock-costs) + 3+2+5 (invoice-pro) + 3+0+3 (design tools).
- [ ] CF-04 — Older returns lack outAllocations; both shapes must render.
      Evidence complete. P-03 R4 confirms EXTRACT_STOCK_COSTS.md Part 4 on every
      point of fact, with two divergences and two completions. Owner: Gate 1 read,
      then DOMAIN_MODEL.md at P-07.
      **P-04 addendum — no design-tool bearing.** None of the three design tools
      references returns, `outAllocations`, or any business entity. Confirmed by
      exhaustive grep; see EXTRACT_DESIGN_TOOLS.md §8.2. The design family
      contributes nothing to this row in either direction.
- [ ] CF-05 — Print calibration unresolved until OD-5 signed
- [ ] CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED
      for the sticker tool: legacy/balance-bites-sticker.html carries the shared
      folder path (:1138), bb_filestore_v1, showDirectoryPicker, bb_stickers,
      BBLabelDB, bbbacklabel. Mechanism undocumented. Owner: **P-04 Part 8, closes
      at Gate 1.** Prior owner (DELTA_RUN_01.md Passes 3 and 4) is void, so this
      had no live owner.
      **P-04 ANSWER — re-derived per file; the claim must NOT simply be inverted.**
      LE, ST and CA each touch **no** shared folder, **no** File System Access API,
      **no** IndexedDB, **no** `bb_filestore_v1` and **no** business entity.
      Footprints in full: LE = `bb_presets` + `bblabel_pb`; ST = `bbstand3_pb`
      alone; CA = `bbcarton_pb` alone. So three of the four design tools are
      genuinely isolated and one is a full participant — the split is total on
      both sides, with no middle case. What §3.3 should have said is written out
      in six numbered points at EXTRACT_DESIGN_TOOLS.md §8.7; in short: **the set
      is neither independent islands nor a coupled system, and the axis §3.3 chose
      was wrong.** The real division is *tools that opted into the shared folder*
      (invoice-pro, bb-stock-costs, sticker) versus *tools that did not*
      (label-editor, stand, carton) — a line running **through** the design family.
      Three further corrections: "no shared runtime data" was false in both
      directions (a real channel exists AND it is defective — sticker-side writes
      never reach disk); namespace occupation is not data sharing and needs its own
      category (`bb_presets` at LE:1935 is a latent collision with one writer, no
      schema and no validation on read at LE:1760); and the family's real coupling
      is **code** — the same preset-bar component in four files under
      `bblabel_pb` / `bbstand3_pb` / `bbcarton_pb` / `bbinv_pb`, crossing the very
      boundary §3.3 treated as the axis of separation. Evidence complete; closes at
      Gate 1.
- [ ] CF-12 — REPORT.md §1 and inventory.json meta line counts are wrong by ~3,953
      lines (stock 5577→7084, invoice-pro 3498→4284, sticker 3701 unlisted;
      total 14529→~18482). Owner: reviewer, closes at Gate 1.
      bb-stock-costs.html verified at 7,083 (wc -l), 7,084 as displayed. Drift
      from REPORT.md is non-linear (+140 @ ~900, +336 @ ~2700, +1506 at
      bootstrap) — no offset repairs a citation. UNIFICATION.md and
      PHASE_PLAN.md inherit the stale figures; both are VOID, no action.
      **P-03 addendum:** balance-bites-invoice-pro.html verified at 4,283
      (`wc -l`), 4,284 as displayed — CF-12's figure confirmed, REPORT.md §2.1's
      3,498 falsified by 785 lines. Drift into this file is likewise non-linear:
      0 → +38 → +111 → +140 → +390 → +652 → +735 → +3035 across 34 re-derived
      citations. `REPORT.md` §2.1 also **omits `bb_invoice_payments` and
      `bb_returns` from its `MANAGED` list** and mis-states invoice-pro as the
      returns/payments producer. Both are content errors, not drift.
      **P-03 addendum, second part:** invoice-pro verified at 4,283 (`wc -l`),
      4,284 displayed; REPORT.md §2.1's 3,498 falsified by 785 lines. Two of three
      business figures authoritative. Closes at Gate 1 once P-04 supplies the three
      design-tool counts.
      **P-04 ANSWER — the three design-tool counts, and they are EXACT.**
      `balance-bites-label-editor- latest.html` = 2,179 (`wc -l`) / **2,180**
      displayed, against REPORT.md §2.4's 2,179 — **exact**.
      `balance-bites-stand.html` = 773 (`wc -l`) / **774** displayed, against
      REPORT.md §2.6's 773 — **exact**. `balance-bites-carton (2).html` = 458
      (`wc -l`) / **459** displayed, against REPORT.md §2.5's 458 — **exact**.
      **This overturns the working assumption.** REPORT.md is not uniformly stale;
      it is stale *only* for the two files that kept growing after it was written,
      and authoritative for the three that were frozen. Its citations into LE, ST
      and CA can be used directly. **CF-12's evidence is complete** — all five
      surviving tools now have a verified count (label-v3 is deleted and
      unverifiable). Closes at Gate 1.
- [x] CF-13 — CLOSED (P-01). RUNBOOK.md was uncommitted and carried stale/void
      steps contradicting current decisions (§1.1 backup, §1.3 PRIVATE +
      `master`, §2.4 backup diff). Superseded by `docs/method/B2S_PREPARE_PHASE.md`
      and archived at `docs/archive/2026-07/RUNBOOK.md` with an ARCHIVED banner.
- [ ] CF-14 — Public repo: owner's given name and local folder path are permanently
      in git history across 4 files. Not remediable by going private. Owner:
      RISK_REGISTER.md at P-05, plus a replacement OD at P-06. Prior owner OD-13
      is superseded — the repo is G7 SIGNED public by design, so this has had no
      live owner. Confirmed live by P-02 at bb-stock-costs.html:1178 and :902.
      **P-03 addendum:** `balance-bites-invoice-pro.html` contains **no**
      absolute path, OS account name or `file://` anchor — the exposure is
      confined to the files P-02 named and is not repeated in this tool.
- [ ] CF-22 — Label-editor vs sticker-tool capability delta. Owner: P-04.
- [x] CF-25 — CLOSED (confirmed by P-01). `.gitattributes` exists at repo root
      with the exact required content; `git add --renormalize .` verified to
      produce zero diff. No line-ending commit needed.
- [ ] CF-27 — Minor Pass 1 scope bleed. Noted, no action.
- [ ] CF-28 — Terminology collision: "customer" means tenant and buyer. Owner:
      GLOSSARY.md, P-05.
- [ ] CF-29 — 13 modules missing from the module map. Owner: SCOPE.md, P-06.
- [ ] CF-30 — Design Assistant has no OD. Owner: P-06.
- [ ] CF-31 — RLS correctness is an ungated gate today. Owner: SECURITY_MODEL.md, P-08.
- [ ] CF-32 — CSV import resequenced from void to post-DATA_MODEL feature. Owner:
      IMPORT_SPEC.md, P-10.
- [ ] CF-33 — `docs/method/DEV_OS.md` §3 (renamed from `BB_DEV_OS.md` by P-01)
      defines a parity gate that is void, but P-01 explicitly changes no rule
      substance so the void gate is still live text in an in-force document.
      Overridden in the new `CLAUDE_PROJECT_INSTRUCTIONS.md` Instructions field;
      the file itself still needs amendment and re-upload. Owner: reviewer,
      before Gate 2.
- [x] CF-34 — CLOSED (reviewer verdict on P-01; P-01 amendment A6). The P-00
      report correctly flagged an unresolved conflict between the canonical
      P-01 "author no document content" restriction and AGENTS.md §0/§9's
      mandatory session-end update of `SESSION_CONTEXT.md` and
      `DEVELOPMENT_JOURNAL.md`. Resolved: P-01's amended prompt explicitly
      authorizes and requires both updates.
- [x] CF-35 — CLOSED (reviewer verdict on P-01; P-01 amendment A7). The P-00
      report flagged that a platform-appended `Co-authored-by: Cursor` trailer
      could not be stripped without a blocked `git commit --amend`, in tension
      with an "exact commit message" instruction. Resolved: platform trailers
      are accepted; subject-line match is sufficient. No history rewrite
      performed or required.
- [x] CF-36 — CLOSED (P-01b). `B2S_PREPARE_PHASE.md` §2's decision register
      was stale: four PROPOSED and four DELEGATED items plus six missing ODs
      (C16-C19, E12, G12) raised in `VOCABULARY_DRAFT.md` §2.2. All eleven
      status changes applied and the six new rows added; opening line now
      reads "62 decisions, all signed. None open." The six new rows' Decision
      column cites the open question from `VOCABULARY_DRAFT.md` §2.2 rather
      than a resolution, and their Status column reads "SIGNED — see
      DECISIONS.md" — the actual reviewer-verdict resolution text for
      C16-C19/E12/G12 was not available to this task, per its own fallback
      instruction. Flagged, not fabricated.
- [x] CF-37 — CLOSED (P-01b). `docs/archive/2026-07/inventory.json` was
      invalid JSON after P-01's banner prepend. Banner reverted (verified with
      a Python `json.load` parse check — valid), and
      `docs/archive/2026-07/README.md` added to cover the whole archive
      directory, explicitly noting `inventory.json` carries no inline banner.
      The six archived `.md` files keep their banners unchanged.
- [x] CF-38 — CLOSED (P-01c). Raised by the P-01b reviewer verdict (recorded
      there only as "CF-38 new", no description landed in this file until
      now — inferred from context and closed in the same edit). The decision
      register's own header undercounted its row count: "56" pre-P-01b and
      "62" post-P-01b against an actual 73-row-then-79-row table. Root cause:
      the original count summed Groups A-F only, omitting Groups G and H.
      Fixed by correcting the header, the P-06 prompt, and the Gate 3
      checklist to "79", independently verified against the actual row count.
- [ ] CF-39 — `B2S_PREPARE_PHASE.md` §3/§4 now run together with no `---`
      separator. P-01c's instruction defined the replaced span as running
      "from [§3's] heading to the horizontal rule before `## 4.`," and the
      supplied replacement text had no trailing rule, so the separator was
      removed rather than reinstated unrequested. Every other section
      transition in the document keeps its `---`. Cosmetic only. Description
      inferred from the P-01c report — the reviewer verdict logged this as
      "CF-39 new" without landing wording here. Owner: reviewer, next light
      edit to `B2S_PREPARE_PHASE.md`.
- [ ] CF-40 — Session-tracking carry-forwards (CF-38, and now CF-39/CF-40
      themselves) are sometimes announced by a reviewer verdict as "new"
      without their descriptive text ever being supplied to the executing
      task. Each has had to be inferred from context and landed after the
      fact. Description inferred from the P-01c report — the reviewer
      verdict logged this as "CF-40 new" without landing wording here.
      Owner: reviewer, supply CF text alongside the "new" tag going forward.
      AMENDED after P-02. Full CF text must appear INSIDE the fenced prompt
      block that lands it, verbatim and copy-ready. Text placed in reviewer
      prose outside the fence does not reach a fresh window. Third occurrence.
      **P-03 addendum — FOURTH occurrence, in the same prompt that landed the
      amendment.** P-03's fenced block says "Land the **seven** carry-forward
      rows supplied below" and supplies **six** (CF-41, CF-42, CF-43, CF-45,
      CF-46, CF-47). **CF-44 is skipped and has no text anywhere in the prompt.**
      No CF-44 row was invented. The amendment is necessary but not sufficient:
      it fixed *where* the text goes without adding a count check.
      **AMENDED a second time after P-03.** The first amendment fixed SUPPLY; the
      fourth occurrence was an ARITHMETIC defect — a stated count of seven over a
      list of six, with CF-44 skipped. A prompt landing CF rows must state the
      count AND the explicit id list; the builder counts, compares, checks
      contiguity or a declared gap, and HALTS on mismatch. Does not close until a
      CF-landing prompt executes with zero numbering or count defects.
      **P-04 RESULT — the closure condition is met, for the first time.** P-04
      stated THREE rows and the explicit ids CF-44, CF-48, CF-49; supplied exactly
      three; ids matched exactly; the gap at CF-44 was **declared void by design
      inside the prompt** rather than left as a hole. Count check performed before
      landing anything: rows supplied = 3, stated = 3, ids matched = YES. Zero
      numbering or count defects. **Recommend closing at Gate 1** — P-04 cannot
      close it itself, as this task closes no carry-forward.
- [ ] CF-41 — B2S_PREPARE_PHASE.md §1's product-definition table gives the repo
      as github.com/Jovo-Jovi/b2s. The verified remote is
      github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF, branch main, public. The repo
      outranks the document. P-01b and P-01c both edited this file and neither
      corrected §1. Owner: the write task that lands CF-39 — P-12.
      *(Text supplied by the P-03 prompt and landed verbatim. This row was opened
      empty by P-02 because the P-02 trigger message omitted the text; it is now
      filled, not re-opened.)*
- [ ] CF-42 — EXTRACT_STOCK_COSTS.md Part 7 gives the Arabic-only remainder of
      501 literals as category inventories rather than individual rows.
      Acceptable for UI chrome; not acceptable for literals classified as
      business data or document template. Gate 1 check: if those are rolled up,
      P-02 reopens for that subset only. Owner: reviewer, Gate 1.
- [ ] CF-43 — The P-02 STOP block mixed halt conditions with redact-and-continue
      conditions under one heading, forcing the builder to resolve a reviewer
      defect mid-task. Corrected in P-03; must also be corrected in P-04.
      Owner: reviewer, closes on P-04 emission.
      **P-04 RESULT — condition met.** P-04's STOP block presents "HALT — stop
      work, report, do not proceed" and "REDACT AND CONTINUE — do not halt, this
      is pre-authorised" as two separately headed lists. No halt condition was
      triggered and the redact-and-continue path was exercised (negative result,
      stated explicitly). **Recommend closing at Gate 1** — P-04 closes no
      carry-forward itself.
- [ ] CF-44 — VOID. Never issued. Reviewer numbering error at the P-02 verdict:
      the number was skipped between CF-43 and CF-45, not lost. Reserved
      permanently so no future task invents content for it. No owner, no action.
- [ ] CF-45 — No tax, discount or freight calculation exists in
      bb-stock-costs.html. If invoice-pro also lacks them (P-03 R1),
      CALC_SPEC.md's money-side policy — tax basis, discount order, every money
      rounding rule — is fully owner-authored with no extraction backing,
      against a Gate 3 requirement of a rounding rule on every calculation.
      Owner: Step 11.
      **P-03 ANSWER — the condition is partly met, so this NARROWS rather than
      closes.** Invoice-pro has **no tax and no freight** (zero matches for
      `tax`/`VAT`/`ضريبة`/`freight`/`shipping`/`شحن`/`توصيل`), and **no money
      value is rounded anywhere** before storage, comparison or aggregation. It
      **does** have a discount: invoice-level, percent-based on the subtotal,
      unrounded, stored twice with the percent authoritative
      (`balance-bites-invoice-pro.html:2255-2257`, `:3093-3095`, `:2269-2270`).
      So of CF-45's four named items, **discount now has an extraction backing
      and tax, freight and every rounding rule do not.** Discount order against
      tax remains unanswerable from legacy because only one operand ever existed.
      **P-03 addendum, second part:** Confirmed and narrowed by P-03 R1/R2: no tax
      and no freight anywhere in either business tool, and no money value rounded
      anywhere before storage, comparison or aggregation. Discount is the sole
      money policy with a legacy precedent — invoice-level, percent on subtotal,
      unrounded, stored twice with the percent authoritative. CALC_SPEC.md's tax
      basis, freight treatment and every money rounding rule are fully
      owner-authored.
      **P-04 addendum — geometry was the last place a rounding precedent could
      exist, and it is nearly as bare.** Of the geometry calculations inventoried
      at EXTRACT_DESIGN_TOOLS.md §3.4, only **four** state any rounding rule:
      `Math.round` on the mm→px conversion (ST:462), `toFixed(2)` on the px→mm
      conversion (ST:641-642), `toFixed(2)` on the sticker tool's exact-mode page
      size (SK:2894-2901), and display-only `toFixed` in the conical-unwrap readout
      that is **not applied to the returned values**. Everything else — the entire
      conical unwrap, all seven shape-geometry expressions, every `@page` dimension
      in ST, and 8 of 41 proportional derivations — is **"none stated in source"**.
      Two further facts for CALC_SPEC.md: the two stated conversions are **not
      inverses** (a 100 mm round trip returns 100.01 mm, from a 0.013% constant
      mismatch plus an integer rounding step), and the family declares **four
      different px↔real-unit constants** with no agreement (3.78, 3.7795, 37.795,
      and "none exists" twice). **Conclusion: money, quantity AND geometry rounding
      are all owner-authored. There is no legacy precedent anywhere.**
- [ ] CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting
      accept/reject. None triaged. Owner: reviewer, Gate 1.
      **P-03 addendum:** EXTRACT_INVOICE_PRO.md §C.4 adds **fifteen** more, same
      status. Combined untriaged total is 25. Includes the unnavigable
      `outAllocations` resale trail at invoice-pro:2515-2525 — `toCustomerId` and
      `toInvoiceId` written by the producer, never read by the consumer.
      **P-04 addendum — no new findings list was opened.** EXTRACT_DESIGN_TOOLS.md
      deliberately has no §C.4. Its Part 7 carries 50 numbered defects plus 2
      markup defects, all classified in place as defects rather than left as
      untriaged findings, and §7.8 separately lists six behaviours that are
      explicitly NOT defects so the reviewer is not asked to triage decisions as
      bugs. **Untriaged total remains 25.** Part 7's 52 are owned by
      FEATURE_INVENTORY.md at P-07, not by this row.
- [ ] CF-47 — Costing is last-purchase-price-wins by unconditional overwrite
      (bb-stock-costs.html:2994-2999): one new purchase price retroactively
      restates COGS and profit for every closed month. Policy, not defect. B2S
      must decide retroactive restatement versus cost snapshot at movement time.
      Needs an OD. Owner: P-06, with the calculation at Step 11.
      **P-03 SHARPENS this.** Invoice-pro has no cost concept at all, but it
      **snapshots the sale price onto the invoice line at add time**
      (`balance-bites-invoice-pro.html:1600`), so a saved invoice is immune to
      later catalogue edits — while stock-costs resolves price live (`:3199`)
      and cost live (`:2994-2999`). **The two halves of margin already follow
      opposite temporal policies.** The OD is therefore not "snapshot or live for
      cost" but "which of the two existing, contradictory policies becomes the
      rule for both sides."
      **P-03 addendum, second part:** Sharpened by P-03: revenue is snapshotted at
      sale while cost is live, so the two halves of margin already follow opposite
      temporal policies. The OD is not "snapshot or live for cost" but which of two
      existing contradictory policies governs both sides.
      **P-04 addendum — the same temporal question exists on the packaging side,
      unnoticed.** LE's preset-bar records embed a **deep clone of the entire
      flavour library** (LE:1965-1975), so a saved Artwork is a snapshot; but LE's
      Mechanism-A library in `bb_presets` is resolved **live** at page load and
      merged over the built-ins with no validation (LE:1756-1760). The same content
      therefore exists in two keys under two temporal policies inside one tool, and
      loading a preset-bar slot silently replaces the live library with the
      snapshot. Whatever rule the OD sets for cost has a direct analogue for
      PackagingTemplate and its presets, and the legacy set is contradictory there
      too. Recorded so the OD is scoped to both halves rather than re-litigated at
      P-07.
- [ ] CF-48 — The producer of bb_invoice_payments is unidentified. P-03
      established invoice-pro as a strict consumer (Store.set is never called
      with that key); P-02 reported no payments producer. Payments are Release 1
      IN — full/partial/underpaid, cash/card/other, receipts. Gate 1 check: does
      either extract name the writer? If neither does, the payment workflow has
      zero legacy source and is fully owner-specified. Owner: reviewer, Gate 1;
      then DOMAIN_MODEL.md at P-07.
      **P-04 note — the design family is not the writer.** Zero occurrences of
      `bb_invoice_payments` in any of the three design tools, and none of them
      touches any business entity at all (EXTRACT_DESIGN_TOOLS.md §8.2). The
      sticker tool's key list at AUDIT_STICKER.md §D-1 does not include it either.
      **All six legacy tools are now accounted for and none is the producer**, so
      the Gate 1 check can be answered without further extraction: the payment
      workflow has zero legacy source and is fully owner-specified.
- [ ] CF-49 — bb_color_presets is written by both business tools with
      incompatible field sets: seven colours in invoice-pro versus six in
      bb-stock-costs, sharing only `bg` and `gold`, under identical ids
      cp_def1-cp_def4. Active collision on every theme save from either side.
      AUDIT_STICKER.md §C-3 records ColorPreset as shared with the business
      tools, so a third field set may exist. Owner: P-04 Part 8 supplies the
      design-tool field set; then DOMAIN_MODEL.md at P-07 canonicalises
      ColorRole / ColorValue.
      **P-04 ANSWER — the design-tool field set, per file.**
      `balance-bites-label-editor- latest.html`: does **not** read, does **not**
      write. `balance-bites-stand.html`: does **not** read, does **not** write.
      `balance-bites-carton (2).html`: does **not** read, does **not** write.
      Zero occurrences of `bb_color_presets`, `bb_active_color_preset_id` or
      `bb_active_theme` in all three; no field set, no id scheme, no theme engine.
      All three expose raw colour pickers bound directly to render sites with no
      named roles and no saveable palette — LE 5, ST 9+, CA 4 plus four named
      styles — persisted only inside their own preset records.
      **So no third field set exists in the design family.** The only design-side
      participant is the sticker tool, and per AUDIT_STICKER.md §C-3 its set is
      `{id, name, bg, gold, txt, mut, row, tot, grand}`.
      **UNRESOLVED CONFLICT, recorded and not adjudicated.** That sticker set has
      **seven** colour fields, yet §C-3 and §3.4 both state it is an "identical
      field set" to `bb-stock-costs.html:1347-1350` — while this row states
      bb-stock-costs carries **six**. Both cannot hold as written. Reading
      bb-stock-costs.html is forbidden by the P-04 prompt and the bounded clause
      permits opening the sticker tool only for the Part 2 verdict, so **no winner
      was chosen and no field list was invented.** For reconciliation at Gate 1 by
      a reader holding both extracts.
      **The id-COUNT divergence is confirmed:** both business tools seed
      `cp_def1`–`cp_def4`; the sticker tool seeds `cp_def1`–`cp_def3` only,
      verified by direct read at `sticker:1272-1276` (the `DEFAULTS` array has
      exactly three members).
      **SECOND DEFECT FOUND IN AUDIT_STICKER.md — name-level, recorded not fixed.**
      §3.4 transcribes the sticker tool's three seeds as `cp_def1` "Balance Bites",
      `cp_def2` "Dark Mode", `cp_def3` "Ocean Blue". Read directly at
      `sticker:1273-1275` they are **`Dark Gold`, `Obsidian Blue`, `Forest Night`**
      — **all three names are wrong.** §C-3's *field set* claim holds exactly; only
      §3.4's names are falsified. This is not a Part 2 halt condition (that verdict
      turns on capability, not preset names) but it matters here: §3.4 is also the
      sole source for the claim that the fourth, sticker-absent preset is "Warm
      Ivory", and a section wrong about the three names it could have checked is
      not authority for the one name it alone records. **The fourth preset's
      identity is therefore UNVERIFIED.** Owner: whoever reconciles item 1 at Gate
      1 should correct AUDIT_STICKER.md §3.4 at the same time.
      What turns on the field-set choice — larger set, smaller set, union, or
      intersection — is tabulated at EXTRACT_DESIGN_TOOLS.md §8.6, together with
      the observation that `row`, `tot` and `grand` are document-theme roles with
      no packaging meaning, so the packaging half will use a subset whichever way
      it is canonicalised.

## Environment quirks (never re-discover)
- Brave isolates IndexedDB per file:// origin. Legacy data is only visible from
  a tool file in its original folder.
- balance-bites-label-v3.html deleted permanently. REPORT.md §2.2 is the sole
  record of its behaviour. Do not infer beyond it.
- Browser-data backup deliberately skipped 2026-07-29 (owner decision). Design-tool
  presets (bbcarton_pb, bbstand3_pb, bb_presets, BBLabelDB) are accepted as
  potentially unrecoverable. Business data is unaffected — it lives as bb_*.json in
  the shared folder. P02 preset importer still sweeps these keys; empty results are
  expected and not a failure.
- PowerShell is the only configured shell for this workspace. For commands that
  need bash syntax (heredocs, `$(...)` command substitution, etc.), invoke
  git-bash directly at `C:\Program Files\Git\bin\bash.exe` rather than trying to
  translate the syntax into PowerShell.
- Refinement of the above, learned at P-03: PowerShell parses the git-bash
  argument string *before* bash sees it, so `<`, `$(...)` and nested double
  quotes are intercepted and fail with "The '<' operator is reserved" or an
  unterminated-quote error. Use `& 'C:\Program Files\Git\bin\bash.exe' -c '...'`
  with the whole script in **single** quotes, no inner single quotes, no `<`
  redirection and no `$(...)`. Pass filenames as arguments (`wc -l FILE`) rather
  than redirecting (`wc -l < FILE`). Chain with `&&` inside the single-quoted
  string. Four attempts were burned on this at P-03.
- Writing a very large deliverable in one `Write` call risks context exhaustion.
  P-03 wrote `EXTRACT_INVOICE_PRO.md` (~3,900 lines) incrementally: an initial
  `Write` ending in an HTML-comment sentinel, then successive `StrReplace` calls
  that swap the sentinel for `new content + sentinel`, with a final replace that
  drops it. Verify the sentinel is gone before committing.
- Learned at P-04: a repo-wide grep glob such as `legacy/*.html` will match files
  a task is explicitly scoped away from. Scope key-name and pattern searches to
  the exact files in the task's read set, or expect to have to declare an
  incidental out-of-scope match as a deviation. P-04 hit this once, on
  `_PBK =`, which returned a line from `balance-bites-invoice-pro.html`.
- Learned at P-04: `REPORT.md`'s line counts are **not** uniformly stale. They
  are exact for the three design tools and wrong only for the two business tools,
  which kept growing after the report was written. Do not apply a blanket
  "re-derive everything" assumption — check per file, because the answer differs.

## Frozen decisions in force
- Freeze point set 2026-07-29 (legacy/FREEZE.md, rewritten by P-01 — tools are
  RETIRING, not port targets).
- Decision register in `docs/method/B2S_PREPARE_PHASE.md` §2: 79 decisions,
  all SIGNED, none open (closed by P-01b / CF-36, header corrected by P-01c /
  CF-38). D10, E11, G10, G11 (was PROPOSED) and E2, E6, H1, H6 (was DELEGATED)
  are SIGNED; C16-C19, E12, G12 added SIGNED with real decision text (P-01c).
  The header now reads "79 decisions, all signed. None open." — matches an
  independently recomputed row count of 79. §3 now reads "Still open — none";
  its prior four items (D10, G10, E11, §5 sign-off) are each resolved
  elsewhere in the document. §5 (Release 1) is SIGNED 2026-07-30. OD-13
  (repository visibility) is superseded: the repo is now G7 SIGNED **public**
  by design, not a private/public toggle under owner discretion.
- Still open: none. `CALC_SPEC.md` (Step 11) remains the only owner-authored
  document; it blocks the build, not the freeze.

## Next action
**GATE 1.** The extraction sequence is complete. P-02, P-03 and P-04 have now
covered all five surviving legacy tools (label-v3 is permanently deleted and
`REPORT.md` §2.2 remains its sole record). All three extractions are awaiting
reviewer verdict; do not treat any of their findings as accepted until those
verdicts land.

**Gate 1 inherits eight decisions this sequence surfaced and could not make:**

1. **CF-49's field-set conflict.** CF-49 says `bb-stock-costs.html` carries six
   `ColorPreset` colours; `AUDIT_STICKER.md` §C-3 says the sticker tool's
   seven-colour set is identical to bb-stock-costs'. P-04 was forbidden from
   reading bb-stock-costs to adjudicate. One of the two artifacts is wrong, and
   whichever it is, `DOMAIN_MODEL.md` at P-07 cannot canonicalise `ColorRole`
   until it is settled.
2. **`REPORT.md`'s disposition, now with complete data.** Its counts are exact
   for the three design tools and wrong for the two business tools (−1,506 and
   −785, non-linearly). §2.1 additionally carries three content errors and §3.3's
   "independent islands" conclusion is falsified in the six ways set out at
   `EXTRACT_DESIGN_TOOLS.md` §8.7. No extraction task was scoped to edit it.
   Decide: correct in place, correct at a later task, or mark VOID.
3. **`AUDIT_STICKER.md:651` exposes the owner's OS account name verbatim** in a
   public repo, inside a `SHARED_DATA_PATH` transcription. P-04 could write only
   three files and this is not one of them. This is CF-14's exposure recurring in
   a docs file rather than a legacy file, and it is remediable — unlike the git
   history — because the file can simply be edited.
3b. **`AUDIT_STICKER.md` §3.4's `ColorPreset` names are wrong on all three.** The
   sticker tool seeds `Dark Gold`, `Obsidian Blue`, `Forest Night`
   (`sticker:1273-1275`, read directly), not "Balance Bites", "Dark Mode",
   "Ocean Blue". §C-3's field set is correct; only §3.4's names are not. Fix
   alongside item 1, and treat §3.4's "Warm Ivory" — its sole record of the
   fourth, sticker-absent preset — as unverified until someone reads
   `bb-stock-costs.html:1347-1350`.
4. **CF-40's closure.** Its stated condition — a CF-landing prompt executing with
   zero numbering or count defects — was met by P-04 for the first time.
5. **CF-43's closure.** Its stated condition — the corrected STOP block appearing
   in P-04 — was met.
6. **CF-11 and CF-12** both have complete evidence and both are marked as closing
   at Gate 1.
7. **CF-22** has an explicit verdict (overlapping-but-neither) and closes here.
8. **CF-48 can be answered without further extraction.** All six legacy tools are
   now accounted for and none writes `bb_invoice_payments`.

**Then P-05 onward.** `EXTRACT_DESIGN_TOOLS.md` seeds `CONTENT_MODEL.md` (§3.2),
`TEMPLATE_MODEL.md` (§3.1, §3.3), `PRINT_CONTRACT.md` (§3.4b, §3.5, §4),
`BRAND_CONFIG.md` (§5) and `FEATURE_INVENTORY.md` (§7). Note for whoever authors
`TEMPLATE_MODEL.md`: §3.3's 40 degrees of freedom carry a MUST/ARTIFACT judgement
each, but **the judgements are the extractor's reading of the evidence, not a
signed decision.** The template model itself is the reviewer's to design.
