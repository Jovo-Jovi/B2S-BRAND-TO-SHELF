# DEVELOPMENT JOURNAL

Append-only. One line per session: `Date | Model | Phase/Task | Files | Issues | Next`

2026-07-29 | Standard | pre-P00 / record skipped browser-data backup | SESSION_CONTEXT.md | none | DELTA_RUN_01 Pass 1
2026-07-29 | Standard | PRE-P00 / repo freeze + private GitHub push | SESSION_CONTEXT.md | none | DELTA_RUN_01 Pass 1
2026-07-29 | Standard | PRE-P00 / session-zero SESSION_CONTEXT (CF-11..14, OD-13) | SESSION_CONTEXT.md | none | DELTA_RUN_01 Pass 1
2026-07-29 | Standard | PRE-P00 / FREEZE.md + RUNBOOK.md | legacy/FREEZE.md, RUNBOOK.md | none | push + DELTA_RUN_01 Pass 1
2026-07-30 | Standard | PREPARE Step 3 / P-01 repo restructure | see P-01 report | CF-34, CF-35 flagged by P-00 resolved by amendment; stub-count arithmetic discrepancy (21 vs 23) flagged, not silently corrected | reviewer verdict on P-01, then P-02

Session summary: greenfield pivot confirmed — parity against the six retiring
legacy tools is void (OD B1 CLOSED), replaced by the four-standard acceptance
model in B2S_PREPARE_PHASE.md §7. Repo renamed balance-bites-unified ->
B2S-BRAND-TO-SHELF on branch main (P-00, prior session). P-01 restructured the
tree into docs/requirements/, docs/requirements/extracts/, docs/archive/2026-07/
and docs/product/; archived stale/void method docs, RUNBOOK.md and the old
Claude Project Instructions; renamed BB_DEV_OS.md -> DEV_OS.md,
RETURNS_ADDENDUM.md -> RETURNS_REQUIREMENTS.md, and .cursor/rules/bb-*.mdc ->
b2s-*.mdc; landed VOCABULARY_DRAFT.md and the new CLAUDE_PROJECT_INSTRUCTIONS.md;
created 23 stub files. The decision register in B2S_PREPARE_PHASE.md §2 holds
56 items — most SIGNED, four DELEGATED, and four (D10, E11, G10, G11) still
PROPOSED pending the owner's confirmation of §3's open items; "56 signed ODs"
in the P-01 prompt is therefore not yet exactly true of repo state and is
recorded here as reported, not silently corrected.

2026-07-30 | Standard | PREPARE Step 3 / P-01b (CF-36, CF-37 fixes) | docs/archive/2026-07/inventory.json, docs/archive/2026-07/README.md (new), docs/method/B2S_PREPARE_PHASE.md, docs/method/PROJECT_RECONFIG.md (new), SESSION_CONTEXT.md | register's own row count (79) still does not match its "62" header line even after this fix — pre-existing discrepancy, flagged not corrected; Sec.3 "Still open - 4 items" now contradicts the updated Sec.2 and was left untouched (out of P-01b's stated scope); six new OD rows (C16-C19, E12, G12) use the literal fallback "SIGNED — see DECISIONS.md" because the actual reviewer-verdict resolution text was not supplied to this task | reviewer verdict on P-01b, then P-02

Session summary: P-01's reviewer verdict PASSED, closing CF-13, CF-25, CF-34,
CF-35, and crediting the 21-vs-23 stub-count discrepancy to the amendment's
own arithmetic rather than to execution. P-01b then closed CF-37 (reverted
the banner on inventory.json so it parses as valid JSON again, added an
archive-level README.md covering the directory instead) and CF-36 (signed
D10, E11, G10, G11, E2, E6, H1, H6 and added C16-C19/E12/G12 to
B2S_PREPARE_PHASE.md Sec.2, per the exact status changes specified — no
other section touched). Landed the untracked project-reconfiguration record
at docs/method/PROJECT_RECONFIG.md, content unchanged. All four commits
(three P-01, one P-01b) pushed to origin/main; remote confirmed to contain
docs/product/, docs/archive/, and docs/requirements/.

2026-07-30 | Standard | PREPARE Step 3 / P-01c (CF-38 fix, OD text, close Sec.3) | docs/method/B2S_PREPARE_PHASE.md, SESSION_CONTEXT.md | CF-38 was referenced by the P-01b verdict only as "new", with no description ever landed in SESSION_CONTEXT.md — this task inferred its content from context (the header/row-count mismatch it exists to fix) and both added and closed it in the same edit | reviewer verdict on P-01c, then P-02

Session summary: P-01b's reviewer verdict PASSED, closing CF-36 and CF-37 and
logging CF-38 (the register header undercounting its own row count). P-01c
closed CF-38: root cause confirmed as the original "56" count summing Groups
A-F only and omitting G and H (true total 73 pre-existing, 79 with the six
vocabulary-pass rows). Corrected the header, the P-06 authoring-prompt line,
and the Gate 3 checklist to "79 ODs", independently recomputed via a regex
count over the register's own rows (79, exact match — the task's stop
condition was not triggered). Replaced Sec.3 "Still open — 4 items" with
"Still open — none", since D10, G10 and E11 are now SIGNED per P-01b and the
Release 1 scope is signed by this task. Set Sec.5's heading to "SIGNED
2026-07-30", added CreditNote to the R1 IN list, and added Shipment (R1 at
data level, R2 UI) to the OUT-R2 list, which previously omitted it entirely.
Replaced all six C16-C19/E12/G12 placeholder Decision cells ("SIGNED — see
DECISIONS.md") with the supplied resolution text. Added a stock-creation
invariant to Sec.7 naming StockMovement as StockLevel's one write path. One
deviation from the literal instruction: replacing Sec.3 "from its heading to
the horizontal rule before Sec.4" removed that horizontal rule per the
instruction's own boundary, and the supplied replacement text did not include
a new one — Sec.3/Sec.4 now run together without the "---" separator every
other section transition in this document uses. Flagged, not silently
patched with an unrequested separator.

2026-07-30 | Standard | PREPARE Step 3 / record P-01c PASS verdict | SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | CF-39 and CF-40 were announced by the verdict only as "new", same gap as CF-38 before it — descriptions inferred from the verdict's own "two flags, both mine" line and this task's prior self-reported deviations, then landed; verdict named a "P-02 opener below" that was not actually present in the message, so P-02 was not started | request the P-02 opener text, then run P-02 in a new conversation

Session summary: P-01c's reviewer verdict PASSED outright, with zero non-PASS
classifications — the two items it flagged were credited as correct
self-reporting by the executing task, not corrections against it. Logged
CF-39 (missing Sec.3/Sec.4 "---" separator, a direct consequence of the
literal replacement boundary the P-01c instruction specified) and CF-40 (a
recurring pattern of reviewer verdicts announcing new CFs by number only,
without descriptive text, requiring each to be inferred after the fact — as
happened with CF-38 and now these two). No document edits were required by
this task beyond the session-tracking files. The verdict's "Next prompt: P-02,
in a new conversation — opener below" was not followed by any opener text in
the message actually received, so P-02 was not started; this is recorded
as a gap to raise with the user rather than assumed away.

2026-07-30 | Heavyweight | PREPARE Step 3 / P-02 requirements extraction from bb-stock-costs.html | docs/requirements/extracts/EXTRACT_STOCK_COSTS.md (new), SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | Verified line count 7083, not REPORT.md's 5577 (wrong by 1506) — CF-12's 7084 reconciles as the trailing-newline convention; AUDIT_STICKER.md Sec.3.2.a's "~319 lines" drift estimate holds only locally, measured drift is +140 to +1506 and non-constant; absolute path with the owner's OS account name at :1178 and :902 REDACTED, never transcribed; CF-41 text was not supplied in the trigger message and was not inferable, so the row was opened explicitly empty rather than fabricated (CF-40 recurring, third occurrence) | P-03 in a new conversation, carrying the CF-41 text and a decision on who corrects REPORT.md's void citations

Session summary: First requirements extraction of the retiring tool set.
Read legacy/bb-stock-costs.html completely in 15 sequential chunks, no
sampling; the final chunk reached line 7083 (`</html>`). Targeted re-reads
followed the sequential pass to verify exact field lists and expressions
before transcription — every file:line emitted was read in this session, and
no line number was inherited from REPORT.md, UNIFICATION.md or PHASE_PLAN.md.

All eight Parts complete. Part 1: 14 entities with exact stored field lists,
11 relationships with cardinality and delete behaviour, 11 places one concept
is modelled more than once, a text relationship diagram, and a full vocabulary
table. Part 2: 26 calculations, each with plain-language intent, exact
expression, named inputs, rounding, order of operations, edge cases and the
BUSINESS-INVARIANT versus THIS-BUSINESS-POLICY split; Sec.2.26 lists every
calculation where the source states no rounding rule, which is nearly all of
them — the only value-level rounding in the tool is roundQty on quantities.
Part 3: 11 workflows with abandonment states. Part 4: the complete Return
entity, per-line structure, both dispositions, outAllocations, the derived
three-way invoice grouping, and an alignment table against
RETURNS_REQUIREMENTS.md. Part 5: batch and traceability are absent — stated
plainly with the evidence, as a requirement B2S adds rather than a gap in the
extraction. Part 6: 11 hardcoded-value tables plus 16 enumerated single-tenant
assumptions. Part 7: bilingual inventory, exhaustive by classification. Part 8:
28 defects plus 8 behaviours explicitly recorded as requirements so the new
build does not "fix" them.

Carry-forward evidence delivered for CF-02, CF-03, CF-04, CF-11, CF-12 and
CF-28. No carry-forward was closed — closure is the reviewer's. Ten new
findings are listed in the extract's Sec.C.4 for the reviewer to accept or
reject; none was opened as a carry-forward by this task.

Three deviations, all self-reported in the task report: Part 7 is exhaustive by
classification rather than one row per literal (501 Arabic literals — every
data-key, bilingual and English-only string is enumerated individually, the
Arabic-only remainder as complete category inventories); the redaction
STOP-AND-FLAG was handled by redacting and continuing rather than halting,
since the condition names redaction as the required action and halting would
have discarded a completed read; and CF-41 was opened with no text because none
was supplied.

---

## 2026-07-31 | Opus (heavyweight) | PREPARE Step 6 · P-03 — requirements extraction: balance-bites-invoice-pro.html

Files: `docs/requirements/extracts/EXTRACT_INVOICE_PRO.md` (new),
`SESSION_CONTEXT.md`, `DEVELOPMENT_JOURNAL.md`. Read-only on `legacy/`;
`EXTRACT_STOCK_COSTS.md` read, not modified; no design tool read.

**Verified line count: 4,283** (`wc -l`, 222,321 bytes, trailing byte confirmed
`\n`), **4,284 as displayed**. Supports CF-12's 4,284; falsifies `REPORT.md`
§2.1's 3,498 by 785 lines (−18.3%). No HALT condition met. Read completely in
**11 sequential chunks**; the final chunk reached line 4283 (`</html>`).

CORRECTION 2's non-linearity prediction confirmed: 34 `REPORT.md` §2.1 citations
re-derived, drift running 0 → +38 → +111 → +140 → +390 → +652 → +735 → **+3035**.
No offset repairs a citation. Three substantive §2.1 content errors also found:
its `MANAGED` list omits `bb_invoice_payments` and `bb_returns`; it calls
invoice-pro the returns/payments "data producer" when it is a strict consumer;
and its Buyer and Invoice field lists each omit one field.

**No redaction required.** No credential, key, token, connection string, OS
account name or absolute local path; no buyer PII seeded in source. Only URLs
are three identical Google Fonts links (`:7`, `:1886`, `:2155`). Output file
greps clean — three `REDACTED` hits, all prose describing the sweep, zero spans.

All ten Parts complete. Part 1: 11 entities with complete typed field lists, 12
relationships, 9 duplicate-modelling findings, diagram, vocabulary with CF-28
evidence. Part 2: **22 calculations**, each with an explicit rounding statement
and the invariant-vs-policy split. Part 3: 16 workflows plus 6 named-but-absent,
each with its abandonment states. Part 4: returns in full, both `outAllocations`
shapes, three disposition variants, and the fourteen conditions a renderer must
handle. Part 5 (Payments, replacing P-02's Batch): the entity is **one string
read from a foreign file**; 15 requirements answered, 12 of them absent. Part 6:
8 tables plus 11 tenancy findings. Part 7: satisfies CORRECTION 3 — every
business-data and document-template literal individually enumerated, plus all
validation messages and English-only strings; only Arabic-only UI chrome rolled
up. Part 8: 26 defects plus 8 behaviours explicitly recorded as requirements.
Part 9: 16 IDENTICAL, 13 DIVERGENT, 3 ONE-SIDED sets, with R1–R4 each answered.

Four findings dominate. **(1)** Invoice-pro never writes `bb_returns` or
`bb_invoice_payments` — it is a strict consumer, which corrects R4's premise.
**(2)** The `outAllocations` consumer is identified at `:2515-2525`, closing a
question P-02 left open; `toCustomerId`/`toInvoiceId` are written and never read.
**(3)** `bb_color_presets` is written by **both** tools with incompatible field
sets (7 colours vs 6, sharing only `bg` and `gold`) under identical ids — an
active collision on every theme save. **(4)** Revenue is snapshotted at sale
(`:1600`) while cost is live (`bb-stock-costs.html:2994-2999`), so the two halves
of margin already follow opposite temporal policies; this sharpens CF-47.

R1: no tax, no freight; discount exists and is fully specified. R2: no money
rounded anywhere before storage — the only `Math.round` is a chart bar width.
R3: no cost concept exists here at all. R4: answered on the corrected basis;
P-02's Part 4 confirmed on every point of fact.

Carry-forward evidence delivered for CF-02 (14 sites), CF-03 (12 sites), CF-04
(both shapes + 14 renderer conditions) and CF-28 (the collision is **latent** —
the Tenant has no noun in this tool, which is why it was never noticed). Six
supplied rows landed verbatim (CF-41, CF-42, CF-43, CF-45, CF-46, CF-47); CF-12,
CF-14 and CF-40 amended in place as instructed. **No carry-forward closed.**
Fifteen new findings listed in the extract's §C.4, none opened as a
carry-forward.

Issues: **the prompt says "seven carry-forward rows" and supplies six — CF-44 is
skipped and has no text anywhere.** No CF-44 row was invented. This is CF-40's
**fourth** occurrence, inside the very prompt that amended CF-40 to prevent it;
recorded as a P-03 addendum on that row. Also logged: git-bash invocation from
PowerShell needs single-quoted `-c` with no `<`, no `$(...)` and no inner single
quotes (four attempts burned), and the chunked-write-with-sentinel technique used
to produce a ~3,900-line deliverable without context exhaustion. Both recorded as
permanent environment quirks.

Deviations from the canonical prompt: **one.** PART 9 R4 asserts invoice-pro is
the returns data producer; the code shows the opposite, so R4 is answered on a
corrected premise with the correction stated rather than answered as written.
Every done-when criterion met.

Next: P-04. Verdict: PENDING.

---

## 2026-07-31 | Opus (heavyweight) | PREPARE Step 7 · P-04 — requirements extraction: the three remaining design tools

Files: `docs/requirements/extracts/EXTRACT_DESIGN_TOOLS.md` (new),
`SESSION_CONTEXT.md`, `DEVELOPMENT_JOURNAL.md`. Read-only on `legacy/`;
`AUDIT_STICKER.md` and `REPORT.md` read, not modified; no business tool read.

**Three verified line counts, all EXACT against `REPORT.md`.**
`balance-bites-label-editor- latest.html` **2,180** displayed / 2,179 `wc -l` vs
REPORT.md §2.4's 2,179. `balance-bites-stand.html` **774** / 773 vs §2.6's 773.
`balance-bites-carton (2).html` **459** / 458 vs §2.5's 458. No HALT condition
met. Read completely in **4 + 2 + 1 = 7 sequential chunks**; final chunks reached
2180, 774 and 459, each `</html>`.

**This overturns the working assumption and completes CF-12.** `REPORT.md` is
not uniformly stale — it is stale only for the two business files that kept
growing after it was written, and authoritative for the three design tools that
were frozen. Its LE/ST/CA citations can be used directly. All five surviving
tools now have a verified count.

**No redaction required.** Zero credentials, keys, tokens, connection strings,
OS account names, absolute local paths or buyer PII across all three files; the
only URLs are Google Fonts links and a placeholder website string. Output greps
clean: the sole `C:\` in the deliverable is the deliberately redacted
`SHARED_DATA_PATH` structure carrying `<REDACTED>` in place of the account-name
span, and the account name itself appears nowhere in the file.

All eight Parts complete, plus Part 0 (provenance) and Part 9 (closing). Part 1:
three tools with complete typed field lists on every stored record. Part 2:
CF-22 answered — **overlapping-but-neither**, on eleven `AUDIT_STICKER.md`
citations spot-checked against the sticker tool, **eleven of eleven holding on
the substance the verdict rests on**, with one name-level defect found in a
citation the verdict does not rest on (below).
Part 3: seven physical output types, 106 content slots, **40 degrees of freedom
each carrying a justified MUST/ARTIFACT judgement (27/13)**, every geometry
calculation with inputs, expression, units and an explicit rounding statement
including "none stated in source", and five informal die-line surrogates against
zero real die-lines. Part 4: 11 `@page` rules, **10 of 11 zero-margin**. Part 5:
the configurable/hardcoded table plus 15 single-tenant assumptions. Part 6:
**nothing rolled up at all** — 36 document-template pairs, 6 business-data pairs,
5 fused literals, 18 English-only printed strings and all 50 Arabic-only UI
chrome literals individually enumerated, exceeding the P-03 standard. Part 7: 50
numbered defects plus 2 markup defects, and a new §7.8 listing six behaviours
that are explicitly NOT defects. Part 8: CF-11 and CF-49 answered per file.

**Four structural findings.** The design family does **not** divide the way
`REPORT.md` §3.3 assumed — LE, ST and CA touch no shared folder, no
`bb_filestore_v1` and no business entity, while the sticker tool has three
channels and eight shared keys, so the real axis runs **through** the design
family rather than around it. The coupling that does exist in these three is
**code, not data**: one preset-bar component copied into four files under four
distinct keys, crossing the business/design boundary. `bb_presets` is a **latent**
collision — one writer, but a generic unversioned name in the shared namespace,
merged on read with no validation. And the 40 degrees of freedom split so that
**every substrate dimension is a MUST and every free-positioning and
per-element-typography control is an ARTIFACT**, which supports the frozen
template-driven decision rather than contradicting it.

Carry-forward evidence delivered for CF-02 (complete inventory: all 10
`innerHTML` sites, 7 unescaped; no other HTML sink exists in any of the three),
CF-03 (complete inventory: all 12 `catch` sites, 3 empty, 3
swallow-and-substitute), CF-11, CF-12, CF-22 and CF-49. **CF count check passed
before landing anything: rows supplied = 3, stated = 3, ids CF-44/CF-48/CF-49
matched = YES**, with CF-44's gap declared void by design in the prompt. Three
rows landed verbatim; CF-02, CF-03, CF-04, CF-11, CF-12, CF-40, CF-45, CF-46 and
CF-47 amended in place as instructed. **No carry-forward closed.** No new
findings list opened — Part 7 classifies in place, so the untriaged total under
CF-46 remains 25.

Issues: **`docs/requirements/extracts/AUDIT_STICKER.md:651` transcribes
`SHARED_DATA_PATH` verbatim including the owner's OS account name, in a public
repo.** P-04 could write only three files and that is not one of them, so it is
flagged for the reviewer rather than remediated — CF-14's exposure recurring in a
docs file, and unlike git history it is trivially fixable. Second: **CF-49's
field-set count conflicts with `AUDIT_STICKER.md` §C-3** — CF-49 says
bb-stock-costs carries six `ColorPreset` colours, §C-3 says the sticker tool's
seven-colour set is identical to bb-stock-costs'. Reading bb-stock-costs is
forbidden by this prompt, so the conflict is recorded unresolved for Gate 1 and
no winner was chosen. Third: **`AUDIT_STICKER.md` §3.4's three `ColorPreset` seed
names are wrong on all three** — read directly at `sticker:1273-1275` they are
`Dark Gold`, `Obsidian Blue`, `Forest Night`, not "Balance Bites", "Dark Mode",
"Ocean Blue". §C-3's field set is correct; only §3.4's names are not. Not a Part
2 halt (that verdict turns on capability, not preset names), but §3.4 is also the
sole record of the fourth, sticker-absent preset's name, so that name is now
treated as unverified. Two environment quirks recorded permanently: a repo-wide
grep glob will match files the task is scoped away from (hit once, on `_PBK =`),
and `REPORT.md`'s staleness must be checked per file rather than assumed.

Deviations from the canonical prompt: **three, all declared in the report.** One,
a `legacy/*.html` glob returned a single incidental line from
`balance-bites-invoice-pro.html`; the file was not read, and the line is recorded
in §8.5 because suppressing it would hide a finding that materially changes the
coupling picture. Two, a marked **P-04 ANSWER** block was appended to CF-49,
whose own text names P-04 Part 8 as the supplier of the design-tool field set —
the verbatim row is intact above it. Three, two environment quirks were added to
`SESSION_CONTEXT.md` under AGENTS.md §9, beyond the fields the prompt enumerated.
Four, **a second commit was required.** After the first commit was pushed, a
re-check of spot-check #4 falsified `AUDIT_STICKER.md` §3.4's three preset names,
which the deliverable had transcribed as fact. Amending was forbidden by the
prompt and the commit was already pushed, so the correction landed as a second
commit against the same three files rather than leaving a known-false claim in a
requirements-evidence artifact. Every done-when criterion met.

Next: GATE 1. Verdict: PENDING.

---

## 2026-07-31 | Sonnet (standard) | PREPARE Step 7b · P-04b — mechanical corrections and ledger update

Files: `docs/method/B2S_PREPARE_PHASE.md`, `docs/requirements/extracts/AUDIT_STICKER.md`,
`SESSION_CONTEXT.md`, `DEVELOPMENT_JOURNAL.md`. No file under `legacy/` touched;
no extract other than `AUDIT_STICKER.md` touched.

**Four mechanical corrections landed.** CF-39: reinstated the `---` horizontal
rule between `B2S_PREPARE_PHASE.md` §3 and §4, matching every other section
transition in the file. CF-41: corrected §1's Repo row from
`github.com/Jovo-Jovi/b2s` to `github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF`.
CF-14: redacted the owner's OS account name out of `AUDIT_STICKER.md:651`'s
`SHARED_DATA_PATH` transcription, replacing only the account-name segment with
`<REDACTED>` and leaving the rest of the path structure intact. CF-50:
annotated (not rewritten) `AUDIT_STICKER.md` §3.4 with a correction block
directly beneath the original three-seed-name claim, stating the verified
names (`Dark Gold`, `Obsidian Blue`, `Forest Night`), confirming §C-3's
field-set and id-scheme claims are unaffected, and marking the fourth,
sticker-absent preset name as unverified. §C-3 itself was not touched.

**Account-name search performed as instructed.** A repo-wide search for the
account-name string, run after the `:651` redaction, found six remaining
file:line occurrences in two groups and none elsewhere: (a) under `docs/` —
`docs/archive/2026-07/inventory.json:51`, `docs/archive/2026-07/inventory.json:52`,
`docs/requirements/extracts/REPORT.md:218` (two occurrences on one line) — left
unfixed, per scope; (b) under `legacy/`, immutable — `legacy/bb-stock-costs.html:902`,
`legacy/bb-stock-costs.html:1178`, `legacy/balance-bites-sticker.html:1138`; (c)
anywhere else — none. No remediation performed beyond `:651`; reporting only,
per the prompt.

**SESSION_CONTEXT.md ledger updated** after a count check performed before any
edit (closures supplied 3, stated 3; new rows supplied 2, stated 2; amendments
supplied 9, stated 9; ids matched exactly — no mismatch, no halt). Closed
CF-12, CF-40 and CF-43 with their verbatim closing text. Landed CF-50 and
CF-51 as new rows. Amended CF-02, CF-03, CF-11, CF-14, CF-22, CF-42, CF-45,
CF-46 and CF-49 in place with their supplied append text, changing nothing
else in each row. Header updated to phase = PREPARE Step 7b complete, last
task = P-04b, verdict PENDING, next action = GATE 1; every other row carried
forward unchanged.

Issues: none — all four files stayed within the exactly-four-file write scope,
`legacy/` was not touched, no git history operation was performed, and no rule,
decision or requirement substance was changed, only the four named mechanical
corrections and the ledger text supplied verbatim.

Next: GATE 1. Verdict: PENDING.

---

## 2026-07-31 | Sonnet (standard) | PREPARE Step 7c · P-04c — mechanical corrections, round two

Files: `docs/requirements/extracts/REPORT.md`, `docs/archive/2026-07/inventory.json`,
`docs/method/PROJECT_RECONFIG.md`, `docs/method/B2S_PREPARE_PHASE.md`,
`docs/requirements/extracts/AUDIT_STICKER.md`, `docs/archive/2026-07/README.md`,
`tools/backup-browser-data.js` -> `docs/archive/2026-07/backup-browser-data.js`,
`SESSION_CONTEXT.md`, `DEVELOPMENT_JOURNAL.md`. No file under `legacy/` touched;
no stub under `docs/product/` touched; no extract other than `REPORT.md` and
`AUDIT_STICKER.md` touched.

**CF-52: account-name redaction.** `REPORT.md:218`'s two occurrences (the
`SHARED_DATA_PATH` value and the `file:///` cross-link) and
`docs/archive/2026-07/inventory.json:51` (`sharedFolderPath`) and `:52`
(`crossLink`) each had only the account-name segment replaced with
`<REDACTED>`; every other character, including the two stale line citations
on `REPORT.md:218`, was left untouched. `inventory.json` re-verified as valid
JSON with a Python `json.load` parse after the edit. A repeat repo-wide
case-insensitive search found exactly three remaining occurrences, all under
`legacy/` (`bb-stock-costs.html:902` and `:1178`,
`balance-bites-sticker.html:1138`) — none elsewhere.

**CF-53: `PROJECT_RECONFIG.md` stub.** Confirmed byte-identical to
`CLAUDE_PROJECT_INSTRUCTIONS.md` before editing (same git blob SHA, 16,465
bytes each). Replaced the file's entire content with the supplied STATUS stub
in the P-01 form, recording that the true reconfiguration record was never
committed and this path instead received a duplicate of the instructions file.
`CLAUDE_PROJECT_INSTRUCTIONS.md` itself was not touched.

**CF-54: stub-count correction.** `B2S_PREPARE_PHASE.md` P-12 step 1 changed
from "Every one of the 20 stubs must now be authored" to "Every one of the 23
stubs must now be authored — 21 under docs/product/ and 2 under
docs/method/"; nothing else in P-12 changed. P-01's prompt and done-when were
left untouched as executed history; an `AS-BUILT` line was appended
immediately after P-01's "Do NOT" block instead, in the Dev OS as-built form,
recording the true 23-stub count. The Gate 3 checklist was checked and does
not reference a stub count anywhere — no edit made there.

**CF-56: second falsified-preset-name location.** `AUDIT_STICKER.md`'s
`:610-611` table rows (attributing the sticker tool's seed names to
`theme.presets.dark.*` / `theme.presets.ocean.*`) were left intact and
visible; a correction blockquote was inserted immediately below the table
identifying the true source lines (`cp_def2`/`cp_def3` inside
`ColorPresetMgr.DEFAULTS`, key `bb_color_presets`) and noting the
`theme.presets.*` identifier occurs nowhere in the source.

**CF-50: superseded UNVERIFIED claim corrected.** The P-04b correction
blockquote's sentence marking the fourth preset name ("Warm Ivory") as
UNVERIFIED was replaced with the supplied text confirming it by direct read
at `bb-stock-costs.html:1349`, since CF-49's resolution (landed in this same
ledger update) independently confirmed it. No other sentence in that
blockquote was touched; the original §3.4 row is still intact.

**CF-58: orphaned tool archived.** `git mv tools/backup-browser-data.js
docs/archive/2026-07/backup-browser-data.js` — history preserved, no banner
added (executable JavaScript, same rationale as `inventory.json`). One line
appended to `docs/archive/2026-07/README.md` recording the archival, the
no-banner rationale, and the abandoned 2026-07-29 workflow it served. `tools/`
is now empty; no `.gitkeep` created.

**SESSION_CONTEXT.md ledger updated** after a count check performed before any
edit (new rows supplied 8, stated 8, ids CF-52..CF-59 matched; amendments
supplied 4, stated 4, ids CF-12/CF-14/CF-49/CF-50 matched; closures supplied
0, stated 0 — no mismatch, no halt). Landed CF-52 through CF-59 as new rows
verbatim. Amended CF-12 (residual line-count closure), CF-14 (docs/ half
closed by CF-52), CF-49 (resolved on the facts — no six-versus-seven
divergence) and CF-50 (Warm Ivory confirmed) in place with their supplied
append text. Added the git-bash commit-workaround environment quirk. Header
updated to phase = PREPARE Step 7c complete, last task = P-04c, verdict
PENDING, next action = GATE 1; every other row carried forward unchanged,
nothing closed.

Issues: one self-corrected slip — an intermediate edit introduced inconsistent
leading whitespace into the pre-existing CF-14 and CF-51 continuation lines
while inserting new text nearby; caught before commit and fixed with a
follow-up edit restoring the original six-space indentation, verified against
`git diff`. No rule, decision or requirement substance was changed at any
point.

Next: GATE 1. Verdict: PENDING.

---

## 2026-07-31 | Sonnet (standard) | PREPARE Step 7d · P-04d — memory guard restructure

Files: `SESSION_CONTEXT.md`, `docs/method/CARRY_FORWARDS.md` (new),
`docs/method/PRECEDENTS.md` (new), `AGENTS.md`,
`.cursor/rules/b2s-devos.mdc`, `docs/method/DEV_OS.md`,
`DEVELOPMENT_JOURNAL.md`. Exactly the seven authorised paths touched; no file
under `legacy/`, `docs/product/`, `docs/requirements/` or `docs/archive/`
touched.

**CF-55 actioned: the ledger was split out of `SESSION_CONTEXT.md`.** Counted
44 carry-forward rows in the old "Active carry-forwards" section (34 open,
10 closed) before any edit. Moved the entire section — every row, every
continuation line, every appended amendment — verbatim into the new
`docs/method/CARRY_FORWARDS.md`, extracted mechanically with `sed` and
diffed byte-for-byte against the original span to avoid any transcription
risk. Row count in the new file reconciled to 44 exactly; no row was
reworded, reordered, renumbered or closed.

**`docs/method/PRECEDENTS.md` created**, landing the eleven supplied
procedural rulings (PR-01 through PR-11) verbatim, then moving the nine
"Environment quirks" bullets out of `SESSION_CONTEXT.md` verbatim (diffed
byte-for-byte, identical), then appending the two new supplied bullets on
the `codeload.github.com` fallback read path and the `git add`
missing-pathspec failure mode (PR-11).

**`SESSION_CONTEXT.md` rewritten in full** per the supplied template: state,
done-steps table, an open-carry-forward-ids-only list (34 lines, derived
from `docs/method/CARRY_FORWARDS.md`'s 34 rows still marked `[ ]`, each
line's owner taken from that row's own "Owner:" text where one exists), and
frozen decisions in force, including this restructure's own sign-off. Byte
size 64,723 → 6,202. Four of the 34 open rows (CF-01, CF-05, CF-27, CF-44)
carry no explicit "Owner:" field in the source row; each is recorded here as
"owner: none stated" rather than inventing one.

**`AGENTS.md` §0 and §9 replaced in full** with the supplied text — §0 now
names both `SESSION_CONTEXT.md` and `PRECEDENTS.md` as mandatory reads and
`CARRY_FORWARDS.md` as an on-demand read; §9 now lists the four session-end
files in order. No other section changed. `.cursor/rules/b2s-devos.mdc`
mirrored to the same effect in its own compact style, YAML frontmatter
untouched, no other rule in the file changed.

**`docs/method/DEV_OS.md` §6 replaced in full**, from the "The memory guard"
heading through the horizontal rule immediately before "## 7.", which is
confirmed present after the edit — this is CF-39's failure mode from P-01c
and it did not recur here.

Issues: none. The row-count reconciliation in Task 1 passed on the first
attempt; no HALT condition was triggered. No credential, key, token,
account name, absolute local path or buyer PII was encountered in any of
the seven files, so no REDACT-AND-CONTINUE action was needed either. Report
hygiene grep run against the report text before submission, per PR-10.

Next: GATE 1. Verdict: PENDING.

---

## 2026-07-31 | Sonnet (standard) | PREPARE Step 7e · P-04e — sync committed project instructions

Files: `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`,
`docs/method/CARRY_FORWARDS.md`, `DEVELOPMENT_JOURNAL.md`. Exactly the three
authorised paths touched; `docs/method/PROJECT_RECONFIG.md` confirmed
untouched and still the STATUS stub under CF-53; `SESSION_CONTEXT.md` not
touched, per this task's scope.

**Count check (PR-04) passed before any edit:** stated 2 closures (CF-55,
CF-59) and 1 new row (CF-60); the prompt's own groups held exactly 2 and 1;
ids matched exactly. No halt.

**Task 1:** replaced `CLAUDE_PROJECT_INSTRUCTIONS.md`'s "## How to open every
session" section (originally lines 145-150) with the reviewer-supplied
repository-fetch text, ending immediately before "## Acceptance is a gate."
One placement judgement made and declared, not silently absorbed: the
reviewer-supplied block's trailing bullet ("You never emit a prompt that
contradicts a precedent") is written in the "You never..." form of the
"## What you never do" list, not in the prose form of the surrounding
session-opener text, and appears with no heading transition of its own. Landed
it at the end of "## What you never do" (Task 2's target) instead of inside
the session-opener section, matching that list's existing bullet form as Task
2 instructs, rather than transcribing it into a section it does not belong to.

**Task 2:** the same bullet appended to the end of "## What you never do",
verbatim, matching the list's existing `- **You never ...**` form.

**Task 3:** §3.5 "Never upload as knowledge" — replaced only the clause
"it changes every session and is pasted at the top of each conversation" and
"the fresh paste" with text stating the reviewer fetches `SESSION_CONTEXT.md`
directly from the repository per PR-09 and that uploading it as a knowledge
file would guarantee a stale copy competing with the live one. No other
sentence or word in §3.5 changed.

**Task 4:** `docs/method/CARRY_FORWARDS.md` — count check (2 closures, 1 new
row) passed before editing. Closed CF-55 and CF-59 with their supplied
verbatim closing text appended below each original row (rows kept intact,
marked `[x]`); landed CF-60 verbatim as a new row at the end of the ledger.
CF-60 itself only *describes* normalising CF-01/CF-05/CF-27/CF-44 to explicit
`Owner:` fields as a future reviewer task before Gate 3 — this task did not
perform that normalisation, since Task 4 only authorised closing two rows and
landing one.

**Task 5 — reported, not actioned:** `SESSION_CONTEXT.md` was outside this
task's writable set. Its open-carry-forward-id list is now stale by two rows
(CF-55 and CF-59 both close here but still appear as open in
`SESSION_CONTEXT.md`'s list). Updating it is named as the next task's first
action.

**PR-10 report hygiene grep run** against this report and the diff before
submission — no OS account name, credential, key, or absolute local path
found.

Issues: none beyond the Task 1/Task 2 bullet-placement judgement above, which
is declared rather than silently resolved. No history operation performed.

Next: land `SESSION_CONTEXT.md`'s two stale open-id rows (CF-55, CF-59) as
the first action, then GATE 1. Verdict: PENDING.

---

## 2026-08-01 | Opus (heavyweight) | PREPARE Gate 1 · P-02-FIX — Gate 1 corrections and rules-file rewrite

**The session halted before its first edit and was resumed.** TASK 4 and TASK 5
both referred to "reviewer-supplied text, supplied verbatim in this task's
message", and neither payload was in the message. PR-04 forbids inventing text
for a missing id, and TASK 5 ordered the count check before ANY edit, so the
whole task was gated. Reported with the tree clean; the reviewer supplied both
payloads plus three prompt corrections, and the run proceeded. This produced
**PR-12 — a prompt is self-contained**, landed this session.

Count check on the supplied ledger text: closures 2 (CF-48, CF-57), new 12
(CF-61–CF-72, contiguous, CF-60 was the prior highest), amendments 3 (CF-42,
CF-49, CF-12). All three groups matched their stated counts and id lists.

**HF-1 confirmed by direct read.** `bb-stock-costs.html:1346-1350` carries
`{id, name, bg, gold, txt, mut, row, tot, grand}` — seven hex values. The
extract's §1.1.11 named six, four of them wrong in two different ways: `panel`,
`ink` and `line` occur nowhere in the source, and `muted` is a wrong name for
the real field `mut`. Corrected under PR-07: the original claim stays visible
and the correction sits below it. §6's "6 hex values each" corrected to seven.

**CF-42 was larger than the prompt described.** §7.5 rolls up TEN categories,
not six. Eight stay rolled up; two required individual enumeration. §7.5.a now
lists **150** document-template literals with file:line from
`bb-stock-costs.html:4647-5960`, and §7.5.b lists **31** business-data labels
from the specific disposition and label lines. The superseded rollups are
annotated, not deleted. Two findings fell out: a character-level corruption at
`:5645` where a Latin `t` sits inside `مرtجع كامل`, shipping broken text on
every printed sales report with a full return; and the absence of any resource
bundle outside the invoice template, with `الإجمالي` and `المنتج` each
re-declared at four separate sites.

**CF-63 recovered all three orphaned findings.** Every one of the three `§C.4`
references pointed at an identifiable finding — none pointed at nothing — so
§C.4 now exists in `EXTRACT_DESIGN_TOOLS.md` with F-1 through F-3.

**AGENTS.md was actively misinstructing** and is rewritten across §2, §4, §5,
§8 and the Stack block, mirrored into `.cursor/rules/b2s-devos.mdc` with its
frontmatter preserved. The rules file is now clean of parity, `PARITY_MATRIX.md`,
the migration importer and every stack name. AGENTS.md retains two hits that the
prompt's own "change no other section" clause put out of reach — declared in the
report rather than silently fixed.

Files: `docs/requirements/extracts/EXTRACT_STOCK_COSTS.md`,
`docs/requirements/extracts/EXTRACT_DESIGN_TOOLS.md`, `AGENTS.md`,
`.cursor/rules/b2s-devos.mdc`, `SESSION_CONTEXT.md`,
`docs/method/CARRY_FORWARDS.md`, `docs/method/PRECEDENTS.md`, this file.
Nothing under `legacy/` or `docs/product/` was written.

Issues: the initial halt, above. Two done-when criteria unmet on AGENTS.md,
both blocked by the change-no-other-section clause. TASK 2's scope grew from one
category to two on the reviewer's correction.

Ledger: 43 open, 14 closed, 57 total. `SESSION_CONTEXT.md`'s open-id list
rebuilt from the ledger and verified equal id-for-id.

Next: P-05. Verdict: PENDING.

2026-08-01 | Standard | PREPARE / P-05-PRE (defer enforcement mechanism, CF-73..75) | AGENTS.md, .cursor/rules/b2s-devos.mdc, docs/method/CARRY_FORWARDS.md, SESSION_CONTEXT.md | §2's `components/ui`/`components/shared` bullet also carried a forbidden term in both files — not named in TASKS 1-3 but required by the done-when's zero-forbidden-term criterion, so fixed in the same style as TASK 3 and declared here as a deviation | P-05-LAND

Session summary: count check (PR-04) passed before any edit — 3 closures
(CF-42, CF-61, CF-63), 3 new (CF-73, CF-74, CF-75), 1 amendment (CF-67), all
matching stated counts and id lists. AGENTS.md §3 replaced in full: the CI-guard
table (`check-no-hardcoded-brand` etc.) is now a "signed-by" table (D6/D7, G11,
E11, C14/G6, CF-02, CF-65) with enforcement deferred to `ARCHITECTURE.md` after
Gate 3 — no guard name, folder path or library is invented. §6's px↔mm bullet
now says "owned by the print engine" instead of naming `src/print/`. §7's first
sentence now calls it "the shared component library" with its location "fixed
at Gate 3" instead of naming `components/ui/`/`components/shared/`. Mirrored
into `.cursor/rules/b2s-devos.mdc` in the file's existing compact-bullet style;
frontmatter untouched. Deviation: §2's "Touching `components/ui/` or
`components/shared/`" bullet in both files was not named by TASK 1-3 but still
contained a forbidden term, so it was generalised to "Touching the shared
component library" in both files, consistent with TASK 3's wording — this is
CF-75's own subject matter (P-02-FIX's report had already flagged these two
hits as out of reach under a stricter change-no-other-section clause). Grep for
`src/`, `components/ui`, `components/shared`, `zod`, `Vite`, `IndexedDB`,
`preset` (case-insensitive) returns zero matches in both files. CF-42, CF-61,
CF-63 closed in the ledger (checkbox flipped to `[x]`, closure text appended
inside each row, original claim never deleted — PR-07). CF-67 amended:
duplicated "Owner: DOMAIN_MODEL.md" removed, nothing else in the row touched.
CF-73 (corrupted Arabic "full return" string, bb-stock-costs.html:5645),
CF-74 (report engine has no resource bundle; two strings re-declared eight
times) and CF-75 (this task's own subject — folder paths and `zod` in
always-on rules ahead of ARCHITECTURE.md) landed as new open rows.
`SESSION_CONTEXT.md`'s open-id list rebuilt from the ledger: 43 before, 43
after (3 closed out, 3 new in — net zero), verified id-for-id against the
ledger. Ledger totals: open 43, closed 17, total 60. Done-steps table gained
the P-02-FIX commit hash (`a95cfb3`, previously a placeholder) and a new
P-05-PRE row. Next action set to P-05-LAND.

2026-08-01 | Standard | PREPARE / P-05-LAND (land PRODUCT_BRIEF, GLOSSARY, SCOPE; promote DECISIONS; archive VOCABULARY_DRAFT) | docs/product/PRODUCT_BRIEF.md, docs/product/GLOSSARY.md, docs/product/SCOPE.md, docs/product/DECISIONS.md, docs/archive/2026-08/VOCABULARY_DRAFT.md, docs/archive/2026-08/README.md, docs/method/B2S_PREPARE_PHASE.md, docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md | The nine-path write list omitted docs/method/B2S_PREPARE_PHASE.md, which TASK 4c explicitly required editing (heading-only) to mark the register PROMOTED; treated as a prompt inconsistency, not scope invention, and edited per the explicit TASK 4c instruction — a tenth (eleventh with the journal) path was touched against a stated count of nine (ten with the journal) | P-06

Session summary: three reviewer-authored documents supplied at repo root
(`docs/PRODUCT_BRIEF.md`, `docs/GLOSSARY.md`, `docs/SCOPE.md`) copied
verbatim over the three `docs/product/` stubs — byte-for-byte identical by
`cmp`, none retaining "STATUS: not authored". `VOCABULARY_DRAFT.md` moved by
`git mv` to `docs/archive/2026-08/` (rename detected, history intact),
banner prepended, no other line touched; `docs/archive/2026-08/README.md`
created. 28 remaining references to `VOCABULARY_DRAFT.md` found and reported
by file:line across 9 distinct files (`docs/archive/2026-08/README.md`,
the moved file itself, `docs/product/GLOSSARY.md`, the untracked
`docs/GLOSSARY.md`, `DEVELOPMENT_JOURNAL.md`, `docs/method/CARRY_FORWARDS.md`,
`docs/requirements/extracts/EXTRACT_DESIGN_TOOLS.md`,
`docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`,
`docs/requirements/extracts/EXTRACT_INVOICE_PRO.md`); none fixed, per TASK 3.
The 79-row decision register at `B2S_PREPARE_PHASE.md` lines 48-170 (heading
to the line before the `---` at :171, boundaries verified before extraction)
was extracted mechanically with `sed -n '48,170p'`, never retyped, and
assembled into `docs/product/DECISIONS.md` behind the specified header;
`diff` against the current file's row span (post heading-edit) returned no
difference, confirming the rows are identical apart from the two headers.
`B2S_PREPARE_PHASE.md`'s heading alone changed to "## 2. Decision register —
PROMOTED" plus the specified blockquote; all 79 rows below it untouched.
`DECISIONS.md` row count verified at 79 by pattern grep. `CARRY_FORWARDS.md`
count check (PR-04) passed before editing: 3 closures (CF-28, CF-29, CF-30),
1 new (CF-76), 0 amendments, all ids matched against open rows. CF-28..30
closed `[x]` with the supplied closure text appended, never replacing the
original claim; CF-76 landed as a new open row. `PRECEDENTS.md` §1 gained
PR-13 (a write task states its push, and its report proves it — origin:
P-05-PRE landed correctly but was never pushed). `SESSION_CONTEXT.md`'s
open-id list rebuilt from the ledger: 43 before, 41 after (3 closed out, 1
new in), verified id-for-id; the P-05-PRE done-steps row's placeholder
commit hash filled in as `445d1c9`, confirmed via `git log`; next action set
to P-06.

2026-08-01 | Standard | PREPARE / P-06a-LAND (land DOMAIN_MODEL; repair stale VOCABULARY_DRAFT refs) | docs/product/DOMAIN_MODEL.md, docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md, docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | none | P-06b (TENANCY_MODEL and SECURITY_MODEL)

Session summary: `docs/product/DOMAIN_MODEL.md` replaced in full by
`Copy-Item` from `~/Desktop/b2s-inbox/DOMAIN_MODEL.md` (staged outside the
working tree per PR-14), verified byte-identical by SHA256 (both
13,421 bytes) — `STATUS: not authored` confirmed gone. Entity-count
verification run programmatically (PR-15) before landing: all nine tiers and
the §1 total matched exactly — 9, 9, 2, 9, 6, 5, 14, 18, 15, total 87. No
mismatch, so no HALT. `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`'s six
stale `VOCABULARY_DRAFT.md` references repaired: the false "occupies slot 1
provisionally" sentence deleted (GLOSSARY.md already holds slot 1); "is
binding" line re-pointed to `GLOSSARY.md`; the `§1.15` citation re-pointed to
`GLOSSARY.md` §5; the three table/list references in Part 3 swapped to
`GLOSSARY.md`; and `material`, `recipe`, `batch` added to the forbidden-word
list with the Recipe/Batch PascalCase-only carve-out appended. Grep for
`VOCABULARY_DRAFT` in that file returns zero. `CARRY_FORWARDS.md` count check
(PR-04) passed before editing: 7 closures (CF-49, CF-64, CF-65, CF-66, CF-67,
CF-68, CF-76), 0 new, 2 amendments (CF-70, CF-74), all ids matched against
open rows. The seven closures were flipped to `[x]` with the supplied closure
text appended, original claims never deleted (PR-07); CF-70 and CF-74
amended in place, left open. `PRECEDENTS.md` §1 gained PR-14 (reviewer drafts
stage outside the working tree) and PR-15 (a stated count is verified against
its own list before landing), bringing the precedent total to 15.
`SESSION_CONTEXT.md`'s open-id list rebuilt from the ledger: 41 before, 34
after (7 closed out, 0 new in), verified id-for-id; header, done-steps row and
next action updated; next action set to P-06b.

2026-08-01 | Standard | PREPARE / P-06b-LAND (land TENANCY_MODEL and SECURITY_MODEL; close CF-31, CF-77) | docs/product/TENANCY_MODEL.md, docs/product/SECURITY_MODEL.md, docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md, docs/method/CARRY_FORWARDS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | none | CALC_SPEC.md (Step 11), owner-authored, last blocking document before Gate 3

Session summary: `docs/product/TENANCY_MODEL.md` (9,981 bytes) and
`docs/product/SECURITY_MODEL.md` (11,139 bytes) copied in full from the
staging folder (PR-14), each verified byte-identical by SHA-256 against its
source, neither containing `STATUS: not authored`, both valid UTF-8 with no
BOM. PR-15 three-way count check run before landing: `DOMAIN_MODEL.md` §1's
stated total (87) matched the sum of its own nine §2 tier subtotals
(9+9+2+9+6+5+14+18+15 = 87), which matched `SECURITY_MODEL.md` §3 principle
P5's "87 entities, 4 properties" — all three identical, no HALT.
`SECURITY_MODEL.md` §4's heading, "## 4. What closes the gate — CF-31",
confirmed as the tenant-isolation guarantee's closing section before citing it
in the CF-31 closure text. `CARRY_FORWARDS.md` count check (PR-04) passed
before editing: 3 rows touched (CF-31 closed, CF-53 amended and left open,
CF-77 opened and closed as a new row), ids matched, CF-77 verified absent
beforehand as the next free id after CF-76. The instruction-copy inventory
(Task 5) found one file beyond the reviewer's three known candidates: an
untracked `docs/method/REVIEWER_CHAT_INSTRUCTIONS.MD` (11,825 bytes) carrying
its own variant of the reviewer instructions body, with no byte-identical
match to any other candidate — the three actual copies (this file, the
`docs/method/` original, and the `docs/archive/2026-07/` copy) are the "three
copies of one document" CF-53's amendment names; `docs/method/PROJECT_RECONFIG.md`
was re-confirmed as a stub, not a copy, and left untouched. CF-53's table was
filled with the three copies and nothing was retired, renamed or deleted.
`docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md` §3.2 through §3.7 (lines 278-318
of the pre-edit file, 17,809 bytes) removed and replaced with a single
current-state §3.2 naming the six actually-attached files (post-edit: 17,212
bytes); §3.1's closing paragraph annotated "Historical" per the supplied text.
`SESSION_CONTEXT.md`'s open-id list rebuilt from the ledger: 34 before, 33
after (1 closed out — CF-31; CF-77 opens and closes within this task and so
never appears), verified id-for-id; header, "Where we are", done-steps row,
frozen decisions and next action all updated per the supplied text verbatim.

2026-08-01 | Standard | PREPARE / P-07-LAND (land CALC_SPEC; close CF-45, CF-62, CF-70, CF-79) | docs/product/CALC_SPEC.md, docs/product/TENANCY_MODEL.md, docs/method/CARRY_FORWARDS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | none | GATE 3 on the blocking set, pending owner signature on CS-15 and on whether the Gate 3 CALC_SPEC.md item covers the R2 rows

Session summary: `docs/product/CALC_SPEC.md` (28,696 bytes) copied in full
from the staging folder (PR-14), verified byte-identical by SHA-256 against
its source (`72DE09C5...404F3` both sides), not containing
`STATUS: not authored`, valid UTF-8 with no BOM. PR-15 self-count check run
programmatically before landing, all three passing: §4's 25 Release 1 rows
counted by `### R1-nn — ` heading match, contiguous R1-01 through R1-25;
§1's fifteen forks counted by `**CS-nn · ` heading match, contiguous CS-01
through CS-15 (CS-01–CS-14 signed, CS-15 open); §5's eight identities
counted by `| Innn |` row match, contiguous I1 through I8. No mismatch, no
HALT. CF-79 repair applied to `docs/product/TENANCY_MODEL.md`: four bare
`GLOSSARY.md` §5 nouns in reviewer-authored prose corrected in place — "Every
asset" and "Asset storage" re-pointed to `MediaAsset`, and two uses of "line"
(one of which also called a `Tenant` an "account") re-pointed to `BrandLine`
— each old string found exactly once before editing, nothing else touched;
byte size 9,981 → 10,019. Three prior false positives (module names at :82,
the human-activity sense of "design" at :95, the signed feature name "Design
Assistant" at :96) confirmed still present and untouched. CF-78 working-tree
check: `git status --porcelain docs/archive/` returned empty — the path is
clean, HEAD matches origin/main, and the 4,599-versus-4,596-byte reading from
P-06b-LAND is recorded as a measurement artefact rather than a live
divergence; no restore action was needed. `CARRY_FORWARDS.md` count check
(PR-04) passed before editing: 6 rows touched — CF-45, CF-62 and CF-70 closed
`[x]` with supplied closure text appended (PR-07, originals intact); CF-47
amended and left open; CF-78 and CF-79 landed as new rows, both closed in
this same task, verified as the next two free ids after CF-77. `CF-79` also
flipped `[x]` on landing, since it opens and closes within this task. Since
CF-78 closed here rather than remaining open, `SESSION_CONTEXT.md`'s
open-id list rebuilds from 33 to **30**, not the 31 a mid-open CF-78 would
have produced — CF-45, CF-62 and CF-70 removed, CF-78 never added (it opens
and closes within this task, matching CF-77's own pattern at P-06b-LAND).
Rebuild verified id-for-id against the ledger's remaining `[ ]` rows. Header,
"Where we are", done-steps row, two new frozen-decision bullets (CS-01
through CS-14 signed / CS-15 open; the Gate 3 `CALC_SPEC.md` scope question
unsigned) and next action all updated per the supplied text.

2026-08-02 | Standard | PREPARE / record P-07-LAND PASS verdict; log CF-80, CF-81, CF-82 | SESSION_CONTEXT.md, docs/method/CARRY_FORWARDS.md, DEVELOPMENT_JOURNAL.md | none | GATE 3 on the blocking set, pending owner signature on CS-15 and on whether the Gate 3 CALC_SPEC.md item covers the R2 rows

Session summary: reviewer verdict PASS on P-07-LAND, every ledger item
confirmed independently — copy verification, all three PR-15 self-counts, the
CF-79 four-point repair, the CF-78 clean-tree finding (reviewer notes git's
own content hash as authoritative over either measurement), the six ledger
operations, and the 30-open-id rebuild via symmetric-difference-empty against
the ledger. Acceptance ledger and tenant-isolation check both N/A, as
expected for a document-landing task. Three new carry-forwards logged by the
review, landed with exactly the text supplied — id, one-line description and
owner, no elaboration added, consistent with the standing discipline against
inventing carry-forward content (CF-40): CF-80 (done-steps table integrity),
CF-81 (copy-verification measurement is tool-dependent; owner names a future
`PRECEDENTS.md` entry, PR-16, not yet written), CF-82 (11 open rows name an
owner that has already run). All three owned by a future pre-Gate-3
reconciliation task or a future precedent-landing task, not this session.
`SESSION_CONTEXT.md` updated: header verdict pending → PASS, P-07-LAND's
done-steps row verdict → PASS with commit `9079a2e` filled in, three new ids
(CF-80, CF-81, CF-82) appended to the open list, 30 → 33. No hard failure; no
carry-forward closed by this recording session.

Next: GATE 3 on the blocking set. Verdict: PASS (P-07-LAND).

2026-08-02 | Standard | PREPARE / P-08-PRE: sign OD-H7 and CS-15; amend Gate 3; HALT before carry-forward reconciliation | docs/product/DECISIONS.md, docs/method/B2S_PREPARE_PHASE.md, docs/product/CALC_SPEC.md, docs/method/DEV_OS.md, SESSION_CONTEXT.md | Task 6 HALTED — CF-80/81/82 already exist | resolve the Task 6 halt, then Gate 3

Session summary: Tasks 1-5 of the P-08-PRE reconciliation prompt completed and
self-verified. Task 1: OD-H7 landed in `DECISIONS.md`'s Group H table and in
full in a new §3, register total 79 -> 80, verified by counting every `| A-H
digit |` row programmatically (80). Task 2: `B2S_PREPARE_PHASE.md` §2 and §3
updated to 80 with the OD-H7 sentence appended to §3; the `79` inside the P-06
prompt body (:964) and `2,179 lines` (:825) deliberately left untouched, as
instructed; the GATE 3 section replaced verbatim with the amended
blocking-set-only checklist, deferring the other thirteen documents to their
own module gates. Task 3: CS-15 signed in the header, §1 opening and its own
block, and R1-19's Policy line updated; the PR-15 self-count re-run unchanged
at 25 R1 headings / 15 CS headings / 8 identity rows. Task 4: a VOID blockquote
inserted below `docs/method/DEV_OS.md` §3's heading, byte size 11,744 -> 12,076
(+332 bytes), no other line touched. Task 5: a repo-wide case-insensitive grep
for the owner's OS account name (`git grep -n -i` over tracked files) returned
zero hits outside `legacy/`, where two files carry it under the FREEZE and are
covered by CF-14 — consistent with a CF-52 closure, held pending Task 6.

Task 6 HALTED at its first instruction. Task 6a's stated premise — "highest
existing id is CF-79" — is false: `CARRY_FORWARDS.md`:854-859 already carries
open one-line stub rows for CF-80, CF-81 and CF-82, landed by the prior
verdict-recording commit (`a61359a`, before this session), and
`SESSION_CONTEXT.md`'s own open-id list already named all three. This matches
the prompt's own STOP CONDITION verbatim ("CF-80, CF-81 or CF-82 already
exists"), so per standing practice (PR-04, PR-15: HALT on mismatch, do not
resolve it, do not land a partial set) none of Task 6's 18 ledger operations
were applied, `CARRY_FORWARDS.md` was not touched, Task 7's PR-16/PR-17 were
not appended (both cite CF-80/CF-81 as their origin and read cleanest landed
together with the ledger fix), and Task 8's owner-amendment and open-id-rebuild
steps (8c) were not performed since they depend on Task 6. Task 8's remaining
parts — header, done-steps row, frozen-decisions bullets, next action — were
done for what is independently true this session; the four `<this commit>`
shas and stale `pending` verdicts named by Task 8b belong to CF-80, which is
itself inside the halted Task 6, so that repair was also deferred. No
carry-forward was closed or amended in `CARRY_FORWARDS.md` this session.
Reported to the user for a decision: treat CF-80/81/82 as pre-opened stubs to
flesh out and close, or return to the reviewer for a corrected prompt.

2026-08-02 | Standard | PREPARE / record P-08-PRE PASS verdict; log CF-83, CF-84 | SESSION_CONTEXT.md, docs/method/CARRY_FORWARDS.md, DEVELOPMENT_JOURNAL.md | none | a corrected carry-forward reconciliation task, then GATE 3

Session summary: reviewer verdict PASS on P-08-PRE — Tasks 1-5 confirmed by
independent re-derivation (80-row count, Gate 3 section text, CS-15 signed in
all three places and R1-19, DEV_OS.md byte delta, and a broader CF-52 re-grep
finding only the placeholder `<REDACTED>` in three path-shaped matches, zero
real occurrences); Task 6's HALT graded as correct execution, not a failure,
because its own stated premise was false and `SESSION_CONTEXT.md`'s 33 open
ids already matched the ledger id-for-id; Tasks 7-9's dependent portions
correctly skipped. Two new carry-forwards logged by the review, landed with
exactly the text supplied, no elaboration added, consistent with the standing
discipline against inventing carry-forward content (CF-40): CF-83 (reviewer
state assertions are not stamped to a commit) and CF-84 (a verdict-logged
carry-forward is opened as a stub, then re-opened as new by the next prompt —
this session's own CF-80/81/82 collision, now generalised as the failure
class it is). Both owned by future `PRECEDENTS.md` entries PR-18 and PR-19,
not yet written, not this session's to author. `SESSION_CONTEXT.md` updated:
header verdict HALT -> PASS, P-08-PRE's done-steps row verdict -> PASS, two
new ids appended to the open list (33 -> 35), next action re-scoped to a
corrected reconciliation task that lands CF-80/81/82 as the pre-opened stubs
they are rather than re-verifying them as free. No carry-forward closed by
this recording session; CF-80/81/82's disposition remains for that task.

2026-08-01 | Standard | PREPARE / P-08-PRE-FIX: close CF-80 to CF-82, reconcile 18 rows, land PR-16 to PR-19 | docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | state-assertion drift (below) | GATE 3 verdict

Session summary: resumed P-08-PRE's Tasks 6-9 with Task 6's premise corrected
by the reviewer — CF-80, CF-81 and CF-82 are amend-and-close, not create,
because commit a61359a had already opened them as one-line stubs before the
original Task 6 ran, and the builder correctly halted on that contradiction.
Re-verifying this prompt's own state assertions (stamped to commit d49d025)
against actual HEAD (d8e2ce6) found a second instance of the exact drift this
task's own PR-18/PR-19 describe: the reviewer's PASS verdict on P-08-PRE had,
between d49d025 and d8e2ce6, already logged CF-83 and CF-84 as open stubs, so
the true highest id was CF-84 (not CF-82) and the true open count was 35 (not
33). Reported to the user, who confirmed proceeding with Task A's 18 ids
unaffected and the open-id rebuild adjusted to actual reality. TASK A: 18
ledger rows edited in `docs/method/CARRY_FORWARDS.md`, verified by count and
by id-list diff — 3 amend-and-closed keeping their original stub line
verbatim (CF-80, CF-81, CF-82), 4 status changes (CF-04 and CF-27 VOID, CF-33
and CF-52 CLOSED), 11 owner amendments appended without touching claim text
(CF-01, CF-05, CF-11, CF-14, CF-22, CF-44, CF-46, CF-50, CF-56, CF-58, CF-72).
TASK B: PR-16 (verification measurements are commanded, not chosen), PR-17 (a
prompt never hands the builder a value it cannot know), PR-18 (reviewer state
assertions are stamped and re-verified) and PR-19 (a carry-forward named in a
verdict is already open) appended to `docs/method/PRECEDENTS.md`. TASK C:
`SESSION_CONTEXT.md` header set to Gate 3 ready / P-08-PRE-FIX / pending; the
three remaining `<this commit>` done-steps rows repaired with real shas found
by `git log --oneline --all` — P-05-LAND `4f176a9`, P-06a-LAND `6e98cf5`,
P-06b-LAND `67fa868` (matching the prompt's own stated value) — verdicts set
to PASS; P-04d, P-04e, P-02-FIX and P-05-PRE left `pending`, no verdict
invented for any of them; a P-08-PRE-FIX done-steps row appended pending its
own commit sha. Open-id list rebuilt as a delta: the seven closed/void ids
deleted, the eleven owner amendments' text replaced after `— owner:` with
nothing else touched, landing at 28 open ids (not the prompt's stated 26,
per the state-assertion drift above) — verified identical, id-for-id, against
the ledger's own open rows by diff. Frozen-decisions entry appended for
PR-16 through PR-19; next action re-pointed at the GATE 3 verdict, no other
item outstanding. The stale `## Where we are` narrative paragraph describing
the Task 6 halt as unresolved was left untouched, as it falls outside Task C's
enumerated C1-C5 edits; flagged in the report as a residual inconsistency for
the next task or the reviewer to clear.

2026-08-01 | Standard | PREPARE, Gate 3 / G3-FIX: close Gate 3 hard failure; 15 rounding rules; PR-20 | docs/product/CALC_SPEC.md, docs/method/B2S_PREPARE_PHASE.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | none — all four state assertions re-verified identical to the reviewer's stamped values (28 open/41 closed/highest CF-84; 28 open ids matching id-for-id; CALC_SPEC 25/15/8; PR-16 through PR-19 present, PR-20 absent) | GATE 3 RE-RUN

Session summary: Gate 3 returned one HARD FAIL and one doc correction. FINDING
1 — 15 of `CALC_SPEC.md`'s 25 Release 1 rows (R1-04, R1-08, R1-09, R1-10,
R1-13, R1-14, R1-15, R1-16, R1-17, R1-18, R1-20, R1-21, R1-22, R1-23, R1-25)
carried no `Rounding:` line, against the Gate 3 item requiring one on every
row. All 15 supplied lines inserted verbatim immediately before each block's
`Edge:` line (R1-09 has no `Edge:`, so before its `Assertion:` line instead),
matching the existing field alignment; the 10 rows that already had a
`Rounding:` line were left untouched. Verified: all 25 R1 blocks now carry a
`Rounding:` line (26 total matches including the §0 template row), and the
three self-counts — 25 `### R1-nn`, 15 `**CS-nn ·`, 8 `| Inn |` — are
unchanged. FINDING 2 — the Gate 3 checklist in `B2S_PREPARE_PHASE.md` still
required `SCOPE.md` to cover "14 modules", a figure inherited from the
pre-CF-29 module map in §4.3 of the same file; corrected to 22, matching
`SCOPE.md` §1 (precedence slot 2, outranking this file's slot 13). §4.3 itself
left untouched, as it is the historical map CF-29 was raised against, and the
same "14 modules" phrase inside §5 Release 1 prose was left alone — it is a
different sentence, not the Gate 3 item. PR-20 (ceremony is budgeted by
subject, not applied uniformly — full ceremony is reserved for money, tenant
isolation, print, schema and `BrandConfig`; document hygiene batches into the
next task touching the file) appended to `docs/method/PRECEDENTS.md`, landing
the ruling the owner asked for after four consecutive turns spent on ledger
bookkeeping. `SESSION_CONTEXT.md`'s `## Where we are` paragraph replaced
verbatim as supplied, header updated, a G3-FIX done-steps row appended with
its commit column left for the post-commit fill (PR-17), a PR-20
frozen-decisions bullet added, and next action re-pointed at the Gate 3
re-run. No carry-forward row opened, closed or amended — none was authorised
by this task, and none of the two findings maps to an existing or new CF id.
The open-id list is untouched, byte-for-byte, at its existing 28 ids.

2026-08-01 | Standard | PREPARE Gate 3 / G3-CLOSE (repo protections, CF-85, PR-21, BRANCHING.md) | docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, docs/method/BRANCHING.md (new), SESSION_CONTEXT.md | none | GATE 3 VERDICT by the reviewer

Session summary: all five re-verified state assertions held with zero
divergence (28 open / 41 closed, highest id CF-84; SESSION_CONTEXT's 28 open
ids reconciled id-for-id; PR-16 through PR-20 present, PR-21 absent;
`docs/method/BRANCHING.md` absent; CF-85 absent — no stub existed) before any
write began. Task 1 ran the three `gh api` calls against
`Jovo-Jovi/B2S-BRAND-TO-SHELF` and read each back: `security_and_analysis`
returned `secret_scanning: enabled` and `secret_scanning_push_protection:
enabled`; `/branches/main/protection` (set via a JSON-file `--input`, not a
heredoc, after a heredoc attempt through git-bash under PowerShell failed
parsing per the standing quirk) returned `allow_force_pushes: false`,
`allow_deletions: false`, `enforce_admins: false`, and no
`required_pull_request_reviews` — the review-free configuration the owner
signed; `vulnerability-alerts` PUT and GET both returned HTTP 204, confirming
enabled. The secret-scanning alerts endpoint returned a genuine `[]` (HTTP
200, not a disabled-endpoint error) because scanning had just been turned on
with nothing yet to find — reported as an honest 0 under PR-21, distinct from
CF-85's historical "disabled on this repository" reading. CF-85 did not exist
as a stub, so it was created new, directly closed (G3-CLOSE), carrying both
the EXPANDED evidence text and the CLOSED text supplied verbatim. PR-21 (the
absence of a check is never reported as a passing check) appended to
`docs/method/PRECEDENTS.md`. `docs/method/BRANCHING.md` created verbatim as
supplied — one branch per phase, exit gate on the branch before merge, one
consolidated PR per phase with the owner merging, deletion only on verified
containment. `SESSION_CONTEXT.md` header, done-steps row (commit column left
for the post-commit fill per PR-17), frozen-decisions bullets and next action
updated; the open carry-forward id list was left untouched at its existing 28
ids because CF-85 was never present in it. No carry-forward other than CF-85
was opened, closed or amended.

2026-08-01 | Sonnet (standard) | BUILD entry / P-09-LAND-FIX2: land ARCHITECTURE, 11 ADRs, BUILD_PHASES; supersede the prepare runbook; docs-integrity CI; CF-86/87/88; open phase/01-foundation | docs/product/ARCHITECTURE.md, docs/product/ADR.md, docs/method/BUILD_PHASES.md, docs/method/B2S_PREPARE_PHASE.md, .github/workflows/docs-integrity.yml, scripts/check_stated_counts.py, scripts/check_ledger.py, scripts/check_credentials.py, scripts/check_done_steps_shape.py, docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md, DEVELOPMENT_JOURNAL.md | three halts, all self-caught before any commit: a negative placeholder scan would have fired on PR-17's own quotation of the anti-pattern it documents (CF-87); the shape-assertion fix that replaced it was itself asserted as universal from a sample of the done-steps table, missing four pre-convention em-dash rows (CF-88); and a bare `service_role` credential match fired on the architecture's own policy prose in three landed documents, corrected to a shape assertion before commit | GATE VERDICT on this report, then P01-T01

Session summary: Gate 3's three reviewer-authored documents landed from
`~/Desktop/b2s-inbox` by copy, never retyped — `ARCHITECTURE.md` (6,451 bytes,
sha256 `b1f53b8f…`), `ADR.md` (8,255 bytes, `3a5631dd…`), `BUILD_PHASES.md`
(5,059 bytes, `f88b3f72…`) — byte-identical source-to-destination, valid UTF-8,
no BOM. PR-15 self-counts held: 11 contiguous ADR entries (ADR-001–011), 8
contiguous build phases (P01–P08), `ARCHITECTURE.md` §2 citing exactly those 11
ids and no other. `B2S_PREPARE_PHASE.md` received the SUPERSEDED blockquote
below its H1 (60,583 → 60,970 bytes), §9 and §10 left standing as still-in-force.

The docs-integrity workflow went through three corrections before it passed
locally, each one a halt on the reviewer's own state assertion rather than a
builder defect, and each is now a landed precedent. First: the original step 5
was a negative scan for `<this commit>`/`<fill post-commit>` — guaranteed to
fail on four historical quotations of the CF-80 defect, including
`PRECEDENTS.md`'s own PR-17 entry, whose entire purpose is to quote the
anti-pattern it prevents. Halted before authoring anything (CF-87). Second: the
replacement — a positive shape assertion requiring a backticked sha in every
done-steps row but the last — was itself a universal asserted from the table's
tail; four rows predating the one-task-one-commit convention (P-00, P-01,
P-01b, P-01c) carry a bare em-dash. Halted again on the same task, both times
before committing (CF-88). Third, caught by the builder without a round trip:
the credential scan's literal `service_role` match fired on legitimate policy
prose in `ADR.md`, `ARCHITECTURE.md` and `B2S_PREPARE_PHASE.md` — three
documents that discuss the privileged key precisely to state why it must never
appear in code. Rewritten as a shape assertion (keyword, then `:`/`=`, then a
20+ character token) that a synthetic self-test confirmed catches an
assignment-shaped fake, a JSON-shaped fake, a JWT-shaped fake and a PEM header,
while leaving both benign policy sentences untouched. A separate, purely
mechanical bug — the scanner's own variable name and dict key spelling the
literal target substring, so the script matched itself — was found and fixed
in the same pass.

Landed: `.github/workflows/docs-integrity.yml` (checkout with `fetch-depth: 0`,
then four dependency-free Python 3 scripts under `scripts/`, run in order,
none skippable) — stated-count check mechanising PR-15 across `DOMAIN_MODEL.md`,
`DECISIONS.md`, `CALC_SPEC.md` and `ADR.md`, plus the per-row `Rounding:`
presence check; ledger reconciliation between `SESSION_CONTEXT.md`'s open ids
and `CARRY_FORWARDS.md`'s open rows, with an owner-field check; the corrected
shape-based credential scan; and the corrected done-steps shape assertion. All
four verified locally against the current tree before commit, individually
reported per PR-21, all passing. CF-86 landed OPEN — the G3-CLOSE secret-scan
`[]` reading meant "not finished", not "clean", owner the P01 entry checklist.
CF-87 and CF-88 landed CLOSED in the same task that opened them, per PR-19/PR-20.
PR-22 (assert shape, not forbidden strings) and PR-23 (a universal is verified
over the whole set, never a sample) appended to `PRECEDENTS.md` §1; the
`gh api --input -` heredoc quirk appended to §2. `SESSION_CONTEXT.md` updated in
full: header, `Where we are`, the new done-steps row with its commit column left
for the post-commit fill (PR-17), a legend declaring the em-dash as a well-formed
value, open-id count to 29 (CF-86 added, reconciled id-for-id against the
ledger), frozen decisions, next action pointed at P01-T01 with CF-86 first.

2026-08-02 | Sonnet (standard) | BUILD P01-T01: entry checklist (CF-86 closed); Next.js App Router skeleton, locale shell, ci.yml with 3 guards | package.json, tsconfig.json, next.config.ts, eslint.config.mjs, proxy.ts, vitest.config.mts, app/[locale]/layout.tsx, app/[locale]/page.tsx, app/[locale]/dictionaries.ts, app/[locale]/dictionaries/en.json, app/[locale]/dictionaries/ar.json, app/globals.css, __tests__/shell.test.tsx, .github/workflows/ci.yml, scripts/check-no-runtime-cdn.mjs, scripts/check-no-hardcoded-literals.mjs, scripts/check-service-import.mjs, .gitignore, docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md | none | P01-T02: DATA_MODEL.md, MODULE_SPEC.md, Supabase staging/production, tenancy-spine schema with RLS, generated types + drift job, remaining six guards, RLS test harness

Session summary: Task A1 re-read
`repos/Jovo-Jovi/B2S-BRAND-TO-SHELF/secret-scanning/alerts` (open and
`state=resolved`) — both `[]` — against `security_and_analysis.secret_scanning
.status: "enabled"` and `secret_scanning_push_protection.status: "enabled"`.
A definite zero, scanning fully enabled: closes CF-86, superseding the
G3-CLOSE reading taken seconds after enablement, before the historical
backfill had concluded. The other three state assertions re-verified exactly:
ledger 29 open / 44 closed / highest CF-88; `SESSION_CONTEXT.md`'s 29 open ids
reconciled id-for-id; `phase/01-foundation` 0 ahead / 0 behind `main`; no
`package.json`, `node_modules` or `app/` anywhere pre-task; exactly one
workflow (`docs-integrity.yml`) and four `scripts/` checks pre-task. All four
docs-integrity checks re-ran clean on the branch. `.gitignore` already covered
`.env*` and `node_modules/`; no A3 change needed.

Framework: Next.js 16.2.12, App Router, TypeScript 5.9.3 strict, React
19.2.8, zod 4.4.3 (unused), eslint-config-next 16.2.12, vitest 4.1.10 as the
test runner — no other dependency added. Next.js 16 deprecated `middleware.ts`
in favour of `proxy.ts` (identical semantics, network-boundary file renamed);
`proxy.ts` is what actually lands, named as a deviation from the prompt's
literal word "middleware" since the framework itself moved the convention out
from under it mid-cycle. Locale routing and message catalogs follow Next's own
documented (non-library) i18n guide verbatim: `app/[locale]/layout.tsx` is the
root layout (no `app/layout.tsx` — every route is under `[locale]`, so nothing
else is required by the framework), `app/[locale]/dictionaries.ts` plus
`app/[locale]/dictionaries/{en,ar}.json` are the catalogs, `proxy.ts` detects
locale from `Accept-Language` (hand-rolled, no library) and 307-redirects `/`
to `/en` or `/ar` before route resolution — verified live: `curl` against a
built `next start` shows `Location: /ar` for `Accept-Language: ar`, `/en` for
`en` and for no header at all (default). The built `en.html`/`ar.html` carry
`<html lang="en" dir="ltr">` / `<html lang="ar" dir="rtl">` and every visible
string (`title`, `h1`, `p`) sources from the dictionary — zero literals in the
component tree. `app/globals.css` holds ten CSS custom properties (spacing,
radius, font-size, line-height) and no rule consumes one. The smoke test calls
the async layout function directly and renders the result with
`react-dom/server`'s `renderToStaticMarkup` rather than `@testing-library/react`
+ jsdom, both because Next's own Vitest guide states RTL cannot render async
Server Components today and because it avoids three dependencies beyond the
allowed set; Vite's esbuild transform picks up `tsconfig.json`'s
`"jsx": "react-jsx"` automatically, so no `@vitejs/plugin-react` was needed
either. `vitest.config.mts` (not `.ts`) avoids an ESM/CJS config-loader warning
without touching `package.json`'s module type.

Three guards landed under `scripts/` as dependency-free Node ESM, each proven
by introducing the exact violation the guard names, confirming the failure,
then reverting: `check-no-runtime-cdn` (external `<script>`/`<link>` — failed
on a `cdn.example.com` tag, reverted), `check-no-hardcoded-literals` (hex
colour / Arabic literal / URL / phone-shaped digits / currency-beside-amount,
scanning `app/` and `proxy.ts`, exempting `dictionaries/` — failed on
`#ff0000`, reverted), `check-service-import` (ADR-005's quarantine at
`server-only/`, which ARCHITECTURE.md §4 names and which this task creates no
target for, so it passes vacuously by construction rather than by omission,
per PR-21 — failed on a fabricated `../../server-only/client` import,
reverted). Six guards remain outstanding, each owned by the phase that lands
its target: `check-data-boundary` (P01, with the schema and its access
boundary), `types-drift` (P01, with generated types), `check-zod-coverage`
(P02, at the first real mutation boundary — provisioning), `check-enum-keys`
(P02, at the first enumeration — `Role`/`MovementReason`-shaped values),
`check-print-containment` (P06, with the print engine), and the
HTML-injection-sink lint rule (P06, where tenant-authored content first
becomes rendered markup — the template/print surface, not the P01 shell,
which has no such sink).

`.github/workflows/ci.yml` lands `install → lint → typecheck → unit → guards →
build` as sequential `needs`-chained jobs, each restoring `node_modules` from
an `actions/cache@v6` entry keyed on `package-lock.json`'s hash with
`fail-on-cache-miss: true` on every job but `install` — a cache miss fails the
job outright rather than silently proceeding with no dependencies installed,
satisfying "no job skips silently." No job in this workflow depends on a
secret yet. Locally, every step the workflow runs was executed directly and
passed: `npm run lint` (0 errors, 1 pre-existing warning
in `docs/archive/2026-07/backup-browser-data.js`, out of this task's scope),
`npm run typecheck`, `npm test` (2/2), the three guards, `npm run build`
(Turbopack, static `/en` and `/ar`, proxy compiled). Pushed commit `085a862`
to `origin/phase/01-foundation` (1 ahead / 0 behind `main`), which triggered
both workflows: `docs-integrity` — job `integrity` **success**; `ci` — `install`
**success**, `lint` **success** (same pre-existing warning, no error), `typecheck`
**success**, `unit` **success**, `guards` **success** (all three checks passed
in-pipeline), `build` **success**. Six jobs, six successes, nothing skipped.

CF-89 landed and closed in the same edit, per PR-19: `check_credentials.py`'s
shape-assertion rewrite (JWT pattern, connection-string pattern, PEM header,
keyword-beside-a-long-token) was already the code on this branch as of
`3918cf4` — the fix shipped in P-09-LAND-FIX2 but its ledger row was never
written. This task supplies the row this task did not create the fix for.

---

2026-08-02 | Opus (heavyweight) | BUILD P01-T02: one Supabase environment (ADR-012), Platform-tier schema with RLS, three clients, generated types, two guards proven | docs/product/DATA_MODEL.md, docs/product/MODULE_SPEC.md, docs/product/ADR.md, docs/product/ARCHITECTURE.md, docs/method/BRANCHING.md, supabase/schema.sql, supabase/config.toml, supabase/.gitignore, supabase/migrations/ (7 files), lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/server-only/service.ts, types/database.ts, scripts/check-service-import.mjs, scripts/check-data-boundary.mjs, scripts/check_credentials.py, .github/workflows/ci.yml, package.json, package-lock.json, .gitignore, docs/method/CARRY_FORWARDS.md, docs/method/PRECEDENTS.md, SESSION_CONTEXT.md | HALTED on Task B as instructed — the organisation's plan allows two active projects and both slots were held, so two could not be created and one treated as both is what the prompt forbade. The owner resumed with ADR-012, a single environment. Seven findings opened rather than fixed silently (CF-92 to CF-98), one a credential-scanner false positive on the exact form ADR-005 requires, one four unrecorded Dependabot alerts the push surfaced | T03: the isolation suite against the live project, on this branch, before the phase gate

**The halt, and what replaced two environments.** Task B asked for a staging and
a production project. Creating the second failed on the organisation's active-project
limit: two slots, both already held. The prompt's stop condition was explicit —
"do not create a single project and treat it as both" — so the task halted with the
owner action named. The owner's resumption signed **ADR-012**: one project, named
`b2s-production`, in **eu-central-2**, Postgres 17.6. Naming the survivor production
is the reversible direction, because adding staging later costs nothing while
promoting staging to production costs a data migration. ADR-012 supersedes only
ADR-006's two-environment clause; one authoritative SQL source and verbatim
migration splitting stand unchanged. The honest cost is recorded in the ADR and in
CF-92: there is no environment in which to rehearse a destructive migration, and
the isolation suite may run against production **only while it holds zero real
tenants**. The reinstatement trigger is a row count, not a judgement. The existing
`b2s-staging` project was renamed rather than replaced, so no data moved.

**The schema, and what the live catalog says about it.** `supabase/schema.sql`
(19,654 bytes) implements `DATA_MODEL.md` §1 to §4, then is split verbatim in source
order into seven migrations — extensions and enums, tables, indexes, helper
functions, the active-owner trigger, RLS with its policies, grants. Stated exactly,
because the loose version of this claim is the CF-86 trap: `schema.sql` carries seven
`-- ===== migration:` markers and `supabase/migrations/` holds seven files, and from
the first marker onward the concatenation of all seven is byte-identical to the
source — 18,496 characters on both sides, compared with a case-sensitive equality,
not a length check. What the migrations do *not* carry is `schema.sql`'s 19-line,
1,036-character provenance header, which documents the source and is not a statement.
Applied through the CLI; `supabase_migrations.schema_migrations` lists versions
`20260802120001` through `20260802120007` with names matching the seven committed
filenames one for one, no more and no fewer. Read back from `pg_class`, `pg_policy` and `pg_policies` rather than from
the file, which is the distinction the task exists to make:

| Table | RLS | Policies | Commands, and `WITH CHECK` where one can exist |
|---|---|---|---|
| `tenant` | on | 2 | SELECT own, SELECT operator |
| `member` | on | 3 | SELECT self, SELECT colleague, UPDATE self **with check** |
| `membership` | on | 3 | SELECT tenant, INSERT owner **with check**, UPDATE owner **with check** |
| `operator` | on | 1 | SELECT operator only — no INSERT, UPDATE or DELETE policy at all |
| `consent_grant` | on | 4 | SELECT owner, SELECT operator, INSERT owner **with check**, UPDATE revoke **with check** |
| `activity_event` | on | 3 | SELECT tenant, SELECT operator, INSERT **with check** — no UPDATE, no DELETE |

Sixteen policies over six tables, zero tables with RLS on and no policy. All six
policies with a write side carry `WITH CHECK`; the ten read policies carry `USING`
alone because PostgreSQL rejects `with check` on a `for select` policy — a select
produces no candidate row to check. The alternative that satisfies §5 rule 3
literally is one `for all` policy per table, and it was rejected because `for all`
covers DELETE and §3.6 requires `activity_event` to carry no DELETE policy at all.
That absence *is* the immutability, so the rule's wording gives way, not the schema.
Recorded as CF-93 item 7.

**`membership.role` is unwritable by grant, not by trust.** The catalog shows
`authenticated` holding INSERT and SELECT on `membership.role` and **no UPDATE**;
UPDATE exists only on `accepted_at`, `archived_at` and `status`. A policy that
inspected the caller's intent would have been the wrong mechanism. This only works
because the migration first revokes everything: a Supabase project grants `anon` and
`authenticated` broad table privileges by default privilege, so a new table arrives
with table-wide UPDATE already granted and a column-scoped grant on top of it is
decoration. `anon` now holds nothing at all. Recorded in `PRECEDENTS.md`, because
every later migration that adds a table must repeat the revoke.

**Three helper functions where §2 specified two.** `current_tenant_id()` and
`is_operator()` are as specified. `is_current_tenant_owner()` is structurally
required and not invented scope: §3.3 restricts `membership` writes to owners, and a
policy on `membership` cannot read `membership` without PostgreSQL raising "infinite
recursion detected in policy for relation membership". All three are `security
definer` and `stable`; the trigger function is `security definer` and volatile.
Five §4 indexes live, each mapped to its stated reason, plus six primary keys, two
unique keys and the §3.3 partial unique index on live memberships.

**Clients, types, guards.** `lib/supabase/` holds the three constructions:
`client.ts` and `server.ts` act as the member and carry the publishable key,
`server-only/service.ts` is the sole construction of the privileged client and
imports `server-only` so a client-bundle reach fails at compile time. `types/database.ts`
(15,024 bytes) is generated from the live project and hand-edited never. Both new
guards were proven by injecting a violation into `app/[locale]/page.tsx` and
reverting it with `git checkout --`: `check-service-import` exited 1 on
`FAIL: import of the privileged client quarantine at app\[locale]\page.tsx:24`, then
OK over 3 files under `[app]`; `check-data-boundary` exited 1 on
`FAIL: Supabase client constructed outside lib\supabase`, then OK over 8 files under
`[app, lib, __tests__, proxy.ts]` with all 3 import sites inside the boundary. Both
name the roots that do not exist yet rather than passing silently over them, and both
fail if their own target directory disappears (PR-21). `types-drift` regenerates from
the live schema and diffs; its first step fails loudly and by name when either secret
is absent, which is its current state and its specified behaviour, not a defect.

**Deviations and gaps, stated rather than smoothed.** The prompt's "seven Platform-tier
tables" cannot be built: §3 enumerates six tables and states that `role` is an enum
and explicitly not a table. Built as six and one, with the divergence and five other
specification gaps recorded as CF-93 — none resolved by invention, each implemented on
the narrowest available reading. `check_credentials.py` failed on
`serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY`, because an environment-variable
name is a 37-character token by shape; the value side now rejects an environment
indirection and the fix was re-proven against bare, quoted and JSON-shaped fakes before
the fixture was deleted (CF-97). It is the fourth instance of the CF-87/88/89 class and
the first to fire on code rather than prose. Two owner actions remain before the phase
gate, both in CF-95: the Vercel GitHub App is unauthorised on the repository, so the
linked project deploys nothing, and neither drift secret is set. `ARCHITECTURE.md` §6's
"the RLS suite runs against staging" is annotated rather than rewritten, since staging
no longer exists. Locally green before commit: lint 0 errors (1 pre-existing warning in
`docs/archive/`), typecheck clean, 2/2 tests, four guards OK, build emitting `/en` and
`/ar`, and all four `docs-integrity` checks passing with 34 open ids reconciling
id-for-id.

**The push surfaced a fifth finding.** `23a6929..f29c0d9` was accepted — push
protection did not reject it, which is the only evidence that matters for "no
credential in the commit" — but the remote's response carried four open Dependabot
alerts on the default branch: `postcss` three times and `sharp` once, 3 high and 1
moderate, all transitive through Next.js and declared in no `package.json`. They have
been open since G3-CLOSE enabled alerts and were never recorded. Bumping them is a
dependency change, which AGENTS.md requires flagging rather than doing, so they are
CF-98 and the ledger closes at 35 open ids.

**Both workflows concluded, and the red is the specification.** `docs-integrity` —
job `integrity` **success**. `ci` — `install` **success**, `lint` **success** (same
pre-existing archive warning), `typecheck` **success**, `unit` **success**, `guards`
**success** with all four guard steps green in-pipeline, `types-drift` **failure** at
its first step `Require the drift secrets`, and `build` **skipped** as the
consequence of that failure. This is D4 working: the job fails loudly and by name
when the secret is absent instead of skipping into a green tick. It also means `ci`
stays red on every push to this branch until the owner sets both secrets, T03's push
included, and that `build` is not exercised in CI until then although it passes
locally. Recorded on CF-95 rather than left for the reviewer to rediscover.
