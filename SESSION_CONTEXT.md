# SESSION CONTEXT
Updated: 2026-07-31 · By: agent · Phase: PREPARE Step 6 · Last task: P-03 · Verdict: PENDING

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

## Active carry-forwards
- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
- [ ] CF-02 — Unescaped innerHTML in all legacy tools; every ported renderer escapes
- [ ] CF-03 — Legacy catch(e){} swallowing; ported paths surface errors
- [ ] CF-04 — Older returns lack outAllocations; both shapes must render
- [ ] CF-05 — Print calibration unresolved until OD-5 signed
- [ ] CF-11 — REPORT.md §3.3 "design tools are independent islands" is FALSIFIED
      for the sticker tool: legacy/balance-bites-sticker.html carries the shared
      folder path (:1138), bb_filestore_v1, showDirectoryPicker, bb_stickers,
      BBLabelDB, bbbacklabel. Mechanism undocumented. Owner: Pass 1 §3.1/§3.2
      documents it; Pass 3 rewrites §3.3; Pass 4 verifies.
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
- [ ] CF-46 — EXTRACT_STOCK_COSTS.md §C.4 lists ten findings awaiting
      accept/reject. None triaged. Owner: reviewer, Gate 1.
      **P-03 addendum:** EXTRACT_INVOICE_PRO.md §C.4 adds **fifteen** more, same
      status. Combined untriaged total is 25.
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
P-04, in a new conversation per the reviewer's own sequencing rule (one task per
window). P-02 and P-03 are both complete and both awaiting reviewer verdict; do
not treat either extraction's findings as accepted until those verdicts land.

Five things the P-04 opener should carry:

1. **The corrected STOP block.** CF-43 requires P-02's conflated halt /
   redact-and-continue block to be replaced in P-04 exactly as it was in P-03.
   CF-43 closes on P-04 emission, so omitting it re-opens it.
2. **A CF count check.** CF-40 has now recurred four times, most recently inside
   the very prompt that amended it (P-03 said "seven rows" and supplied six,
   skipping CF-44). State the row count and the exact CF numbers, and supply
   every one of them verbatim inside the fenced block.
3. **CF-44's text, or an explicit statement that CF-44 does not exist.** The
   number is currently a hole in the sequence with no wording anywhere.
4. **A decision on `REPORT.md`.** Its `bb-stock-costs.html` and
   `balance-bites-invoice-pro.html` citations are now both measured as
   non-linearly drifted and its §2.1 carries three content errors (the omitted
   `MANAGED` keys, the "data producer" mis-statement, and the 3,498 line count).
   Both P-02 and P-03 were scoped to one new file and could not edit it. Decide
   whether P-04 corrects it in place, a later task does, or it is marked VOID.
5. **The `bb_stickers` / `bb_label_templates` link is P-04's alone.** P-03
   searched `balance-bites-invoice-pro.html` and found **zero** occurrences of
   either, so CF-11's remaining side rests entirely on the design tools.
   `AUDIT_STICKER.md` §3.4's `templateKey` overload likewise has no
   invoice-pro-side counterpart.
