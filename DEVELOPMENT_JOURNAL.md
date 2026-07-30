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
