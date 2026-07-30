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
