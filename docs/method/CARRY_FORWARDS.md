# CARRY-FORWARD LEDGER — B2S

The full carry-forward register: open, closed and amended. `SESSION_CONTEXT.md`
carries only the open ids; this file carries the text.

Read this file when your task names a carry-forward, when you are landing,
amending or closing rows, or at a gate. Rows are append-and-amend: a closed
row is marked `[x]` and keeps its text, never deleted. Amendments append to
the row rather than replacing it, so the history of a finding survives.

Numbering is permanent. CF-44 is VOID and reserved — see its row.

---

- [ ] CF-01 — Reinstate deferred Dev OS security/migration rule layer at P10
      AMENDED (P-08-PRE-FIX) — owner: ARCHITECTURE.md, immediately after Gate 3
      — the P10 it named does not exist in this plan
      AMENDED (P01-T05-FIX) — the owner has passed. `ARCHITECTURE.md` was
      authored at `3918cf4` and Gate 3 closed on 2026-08-01, so "immediately
      after Gate 3" names a moment already gone and this row has had no live
      owner since. Owner: **the P02 entry checklist**, reinstating the deferred
      rule layer subject by subject as each arrives, rather than in one pass —
      the layer was deferred because its mechanism was undecided, and mechanisms
      are decided one at a time.
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
      P-04 Part 7 enumerated every unescaped innerHTML site and every empty
      catch(e){} site across the three design tools. Evidence now complete across
      all five read tools. Owner unchanged: FEATURE_INVENTORY.md must-not-reproduce
      at P-07.
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
      P-04 Part 7 enumerated every unescaped innerHTML site and every empty
      catch(e){} site across the three design tools. Evidence now complete across
      all five read tools. Owner unchanged: FEATURE_INVENTORY.md must-not-reproduce
      at P-07.
- [x] CF-04 — Older returns lack outAllocations; both shapes must render.
      Evidence complete. P-03 R4 confirms EXTRACT_STOCK_COSTS.md Part 4 on every
      point of fact, with two divergences and two completions. Owner: Gate 1 read,
      then DOMAIN_MODEL.md at P-07.
      **P-04 addendum — no design-tool bearing.** None of the three design tools
      references returns, `outAllocations`, or any business entity. Confirmed by
      exhaustive grep; see EXTRACT_DESIGN_TOOLS.md §8.2. The design family
      contributes nothing to this row in either direction.
      CF-04 — VOID (P-08-PRE-FIX). The requirement was that both `outAllocations`
      shapes must render, which mattered only to a port. No legacy return data
      is imported: OD-B7 accepts total legacy data loss and OD-A5 excludes
      legacy migration in favour of CSV import. `DOMAIN_MODEL.md` D6 replaces
      the concept with `ReturnAllocation`. There is no second shape.
- [ ] CF-05 — Print calibration unresolved until OD-5 signed
      AMENDED (P-08-PRE-FIX) — owner: PRINT_CONTRACT.md, authored just-in-time
      per OD-H7; the measurement is B2S_PREPARE_PHASE.md Step 15
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
      ANSWERED by P-04 Part 8 §8.7 with six numbered corrections. REPORT.md §3.3
      chose the wrong axis: the real division is tools that opted into the shared
      folder (invoice-pro, bb-stock-costs, sticker) versus tools that did not
      (label-editor, stand, carton) — a line running through the design family,
      not around it. Closes at Gate 1 on read. One element of §8.5 rests on an
      incidental glob hit from invoice-pro.html and is confirmed at Gate 1 against
      EXTRACT_INVOICE_PRO.md.
      AMENDED (P-08-PRE-FIX) — owner: the REPORT.md annotation task, before
      Gate 3
      AMENDED (P01-T05-FIX) — the owner has passed: "before Gate 3" names a gate
      that closed on 2026-08-01. Owner: **the `REPORT.md` annotation task at
      P02**, batched with CF-72 per PR-20 — one task, one round trip, both rows.
- [x] CF-12 — REPORT.md §1 and inventory.json meta line counts are wrong by ~3,953
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
      and CA can be used directly.       **CF-12's evidence is complete** — all five
      surviving tools now have a verified count (label-v3 is deleted and
      unverifiable). Closes at Gate 1.
      **CF-12 — CLOSED (P-04).** Design-tool counts verified exact against REPORT.md:
      label-editor 2,179, stand 773, carton 458 (wc -l). REPORT.md is stale only
      for the two business files that kept growing after it was written
      (5,577→7,083 and 3,498→4,283) and accurate for the three frozen design
      tools. REPORT.md uses the wc -l convention; CF-12's original corrected
      figures used the displayed convention. Residual, no action: the sticker
      tool's count was never independently verified; AUDIT_STICKER.md is its
      record and no live document carries a wrong figure.
      RESIDUAL CLOSED. balance-bites-sticker.html verified by reviewer direct read
      at 3,700 (wc -l) / 3,701 displayed, matching REPORT.md §1 under the displayed
      convention. bb-stock-costs.html re-verified at 7,083 and
      balance-bites-invoice-pro.html at 4,283. Every legacy line count is now
      independently confirmed. No residual.
      Third drift profile recorded. invoice-pro citation drift in REPORT.md §2.1
      is 0, +38, +111, +140, +390, +652, +735, +3035 — non-linear, like
      stock-costs. See CF-72 for the owner of re-derivation.
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
      P-04 found a live exposure in CURRENT content, not only in history:
      AUDIT_STICKER.md:651 transcribed SHARED_DATA_PATH verbatim with the owner's
      OS account name in a public repo. Redacted by P-04b. The same value remains
      in bb-stock-costs.html:1178 and :902, which legacy/FREEZE.md forbids
      modifying, so the exposure cannot be fully removed while legacy/ is
      preserved verbatim in a public repo. The OD at P-06 chooses between four
      options: (a) accept permanently, (b) make the repo private, which
      contradicts G7 SIGNED public-by-design, (c) rewrite history and redact
      legacy/, which violates the freeze, (d) move legacy/ out of the public
      repo. Owner unchanged: RISK_REGISTER.md at P-05, replacement OD at P-06.
      The docs/ half is closed by CF-52. Three occurrences remain
      under legacy/ — bb-stock-costs.html:902 and :1178,
      balance-bites-sticker.html:1138 — which legacy/FREEZE.md forbids modifying.
      The four-option OD at P-06 is unchanged.
      AMENDED (P-08-PRE-FIX) — owner: RISK_REGISTER.md, authored just-in-time per
      OD-H7; its gate is the pre-relaunch audit, B2S_PREPARE_PHASE.md §10
- [ ] CF-22 — Label-editor vs sticker-tool capability delta. Owner: P-04.
      ANSWERED by P-04 Part 2: overlapping-but-neither. The label editor is a
      distinct physical output — a continuous five-segment cruciform wrap strip
      no sticker-tool mode can express — sharing a substantially overlapping
      content model with the sticker tool's back label, on weaker infrastructure.
      Verdict rests on 11 of 11 AUDIT_STICKER.md citations spot-checked and
      holding. Closes at Gate 1 on read.
      AMENDED (P-08-PRE-FIX) — owner: reviewer — verify closure against
      EXTRACT_DESIGN_TOOLS.md Part 2 at the TEMPLATE_MODEL.md authoring
- [x] CF-25 — CLOSED (confirmed by P-01). `.gitattributes` exists at repo root
      with the exact required content; `git add --renormalize .` verified to
      produce zero diff. No line-ending commit needed.
- [x] CF-27 — Minor Pass 1 scope bleed. Noted, no action.
      CF-27 — VOID (P-08-PRE-FIX). Recorded as "no action" when raised,
      against a Pass 1 that belonged to the port. Nothing depends on it.
- [x] CF-28 — Terminology collision: "customer" means tenant and buyer. Owner:
      GLOSSARY.md, P-05.
      CF-28 — CLOSED (P-05). GLOSSARY.md §2 resolves it on evidence: nine cited
      sites in bb-stock-costs.html show `customers` meaning the TENANT in the
      shared-folder path (:1178, :902) and the BUYER everywhere else (:1182,
      :3264, :3265, :3276-3277, :3320, :3389, :3411). Resolved as `Tenant` and
      `Buyer`; the word "customer" is retired entirely and appears on the §5
      enforcement list.
- [x] CF-29 — 13 modules missing from the module map. Owner: SCOPE.md, P-06.
      CF-29 — CLOSED (P-05). SCOPE.md §1 carries all 22 modules plus the Operator
      Console, each traced to at least one signed decision, each with a stated
      boundary naming what it does NOT own, and each with an R1/R2/R3
      assignment. §4 adds seven cross-cutting invariants binding every module.
- [x] CF-30 — Design Assistant has no OD. Owner: P-06.
      CF-30 — CLOSED (P-05). The Design Assistant OD exists and is signed as G12:
      R3, paid tier, may read brand config, template metadata and product names
      only, never buyer, invoice, payment or financial data. Carried into
      SCOPE.md module 21 with that boundary stated.
- [x] CF-31 — RLS correctness is an ungated gate today. Owner: SECURITY_MODEL.md, P-08.
      CF-31 — CLOSED (P-06b-LAND). The gate now has a document.
      `SECURITY_MODEL.md` §4 states the tenant-isolation guarantee in testable
      terms and names the evidence that closes it, so isolation is no longer a
      standard asserted in the acceptance model with nothing behind it. The
      original framing — "RLS correctness" — named a mechanism before there was
      a document to state the guarantee in; §4 states it as a property of the
      platform and its evidence, which is what a gate can be run against. Every
      gate touching data access cites §4 from here. The standard remains
      non-waivable by OD.
- [ ] CF-32 — CSV import resequenced from void to post-DATA_MODEL feature. Owner:
      IMPORT_SPEC.md, P-10.
- [x] CF-33 — `docs/method/DEV_OS.md` §3 (renamed from `BB_DEV_OS.md` by P-01)
      defines a parity gate that is void, but P-01 explicitly changes no rule
      substance so the void gate is still live text in an in-force document.
      Overridden in the new `CLAUDE_PROJECT_INSTRUCTIONS.md` Instructions field;
      the file itself still needs amendment and re-upload. Owner: reviewer,
      before Gate 2.
      CF-33 — CLOSED (P-08-PRE-FIX). `docs/method/DEV_OS.md` §3 carries a VOID
      banner naming OD-B1 and the four-standard model that replaced it,
      landed by P-08-PRE Task 4.
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
      AMENDED (P01-T05-FIX) — the owner has passed in the sense that matters: it
      named no moment, and none arrived. `B2S_PREPARE_PHASE.md` is superseded as
      a sequencing plan by `BUILD_PHASES.md` and nothing is going to edit it
      lightly. Owner: **the next write task that touches
      `B2S_PREPARE_PHASE.md`, which is the P08 pre-relaunch audit** — its §9 and
      §10 remain in force and P08 runs the §10 audit, so that is the one moment
      the document is opened for writing again. Batched there per PR-20.
- [x] CF-40 — Session-tracking carry-forwards (CF-38, and now CF-39/CF-40
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
      **CF-40 — CLOSED (P-04).** Closure condition was a CF-landing prompt executing
      with zero numbering or count defects. P-04 reported rows supplied 3,
      stated 3, ids matched, check run before landing. The stated-count plus
      explicit-id-list plus halt-on-mismatch mechanism is retained as standing
      practice, not as an open item.
- [ ] CF-41 — B2S_PREPARE_PHASE.md §1's product-definition table gives the repo
      as github.com/Jovo-Jovi/b2s. The verified remote is
      github.com/Jovo-Jovi/B2S-BRAND-TO-SHELF, branch main, public. The repo
      outranks the document. P-01b and P-01c both edited this file and neither
      corrected §1. Owner: the write task that lands CF-39 — P-12.
      *(Text supplied by the P-03 prompt and landed verbatim. This row was opened
      empty by P-02 because the P-02 trigger message omitted the text; it is now
      filled, not re-opened.)*
- [x] CF-42 — EXTRACT_STOCK_COSTS.md Part 7 gives the Arabic-only remainder of
      501 literals as category inventories rather than individual rows.
      Acceptable for UI chrome; not acceptable for literals classified as
      business data or document template. Gate 1 check: if those are rolled up,
      P-02 reopens for that subset only. Owner: reviewer, Gate 1.
      Two peers now exist. P-03 met the standard, enumerating every business-data
      and document-template literal and rolling up only Arabic-only UI chrome.
      P-04 exceeded it, enumerating all 50 Arabic-only UI chrome literals
      individually although a rollup was permitted. P-02 remains the only extract
      with a category rollup over 501 literals. Gate 1 check unchanged.
      DECIDED at Gate 1. §7.5 carries TEN category rollups, not six. Eight stay
      rolled up as permitted — navigation, table headers, status and empty
      states, stat-card labels, validation messages, confirmation prompts,
      success toasts, tooltips. TWO must be individually enumerated because
      CF-42's standard names both: 'Business-data labels (Arabic only)' and
      'Document templates (Arabic only) — report engine'. Enumerated by
      P-02-FIX. Closes on that verdict.
      **CF-42 — CLOSED (P-02-FIX).** §7.5.a enumerates 150 document-template
      literals (:2893), §7.5.b enumerates 31 business-data labels (:3077), both
      with file:line. Eight permitted rollups retained with pointers, not
      deleted.
- [x] CF-43 — The P-02 STOP block mixed halt conditions with redact-and-continue
      conditions under one heading, forcing the builder to resolve a reviewer
      defect mid-task. Corrected in P-03; must also be corrected in P-04.
      Owner: reviewer, closes on P-04 emission.
      **P-04 RESULT — condition met.** P-04's STOP block presents "HALT — stop
      work, report, do not proceed" and "REDACT AND CONTINUE — do not halt, this
      is pre-authorised" as two separately headed lists. No halt condition was
      triggered and the redact-and-continue path was exercised (negative result,
      stated explicitly). **Recommend closing at Gate 1** — P-04 closes no
      carry-forward itself.
      **CF-43 — CLOSED (P-04).** The P-04 prompt was emitted with the corrected STOP
      block separating HALT conditions from REDACT-AND-CONTINUE conditions.
- [ ] CF-44 — VOID. Never issued. Reviewer numbering error at the P-02 verdict:
      the number was skipped between CF-43 and CF-45, not lost. Reserved
      permanently so no future task invents content for it. No owner, no action.
      AMENDED (P-08-PRE-FIX) — owner: none — void, retained as a numbering
      record. Exempt from the reachable-owner test by its VOID status
- [x] CF-45 — No tax, discount or freight calculation exists in
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
      P-04 Part 3.4 closes the last avenue: only four calculations in the entire
      design family state any rounding rule, and the conical unwrap, all seven
      shape-geometry expressions and every stand @page dimension are explicitly
      'none stated in source'. Geometry was the last place a legacy rounding
      precedent could have existed. CALC_SPEC.md's tax basis, freight treatment
      and every money and geometry rounding rule are owner-authored with
      effectively no legacy source.
      CF-45 — CLOSED (P-07-LAND). The absence is now a specification.
      `CALC_SPEC.md` R1-06 through R1-08 author tax from nothing — per
      `InvoiceLine`, rate stored on the line, computed on the discounted net,
      both inclusive and exclusive modes (CS-04, CS-05, CS-06). Freight is
      excluded from Release 1 by CS-07, on the grounds that no signed decision
      in the register mentions it. Discount was never absent — it existed in
      invoice-pro and is R1-03. §7 records all three absences permanently, so
      no future reader mistakes an authored number for a ported one.
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
      P-04 produced no §C.4-equivalent findings block; confirm at Gate 1. Count
      stands at 25 pending that confirmation.
      AMENDED (P-08-PRE-FIX) — owner: reviewer — adjudicate the ten findings at
      the FEATURE_INVENTORY.md authoring, which is where accepted findings land
      AMENDED (P01-T05-FIX) — the owner names a task rather than a moment, and
      the task now has one. Owner: **the `FEATURE_INVENTORY.md` authoring, P08**
      — the document is authored just-in-time there per ARCHITECTURE §7 and
      BUILD_PHASES P08, and that is where the 25 untriaged findings are
      adjudicated.
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
      AMENDED (P-07-LAND). The structural half is foreclosed:
      `CALC_SPEC.md` R1-05 stores `InvoiceLine.netValue` at issue, so no later
      price change can restate an issued `Invoice`, which is the mechanism by
      which last-purchase-price-wins restated closed months. The costing method
      itself — the choice between last price, weighted average, FIFO or standard
      cost — belongs to `Component` cost update on purchase, deferred to R2 in
      `CALC_SPEC.md` §6. Owner: the R2 amendment to `CALC_SPEC.md`, one step
      ahead of the Costing module.
- [x] CF-48 — The producer of bb_invoice_payments is unidentified. P-03
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
      CF-48 — CLOSED (Gate 1). Producer identified: `PaymentMgr` at
      bb-stock-costs.html:3123-3145, writing via Store.set. invoice-pro reads
      only (:1967) and lists the key in MANAGED (:1064).
      EXTRACT_STOCK_COSTS.md §1.1.9 already stated "this tool writes it" — the
      P-03 report characterised P-02 as silent; the extract was not.
- [x] CF-49 — bb_color_presets is written by both business tools with
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
      ANSWERED for the design half by P-04 Part 8: label-editor, stand and carton
      each have zero occurrences of bb_color_presets, bb_active_color_preset_id
      and bb_active_theme — no field set, no id scheme, no theme engine; all three
      bind raw colour pickers directly to render sites. The design family
      contributes NO third field set. STILL OPEN: EXTRACT_STOCK_COSTS.md gives
      bb-stock-costs six colours while AUDIT_STICKER.md §C-3 says the sticker
      tool's seven-colour set is identical to it — both cannot hold. Resolvable
      by reading EXTRACT_STOCK_COSTS.md's field list against §C-3; no new
      extraction required. The id count divergence (three seeds against four) is
      confirmed; the fourth preset's name is unverified per CF-50. Owner:
      reviewer at Gate 1, then DOMAIN_MODEL.md at P-07.
      RESOLVED ON THE FACTS by reviewer direct read. There is NO
      six-versus-seven field-set divergence. All three tools carry an identical
      seven-value record {id, name, bg, gold, txt, mut, row, tot, grand}, verified
      at sticker:1273-1275, bb-stock-costs:1346-1349, invoice-pro:1258. The 'six'
      originated in EXTRACT_STOCK_COSTS.md:2542 ('6 hex values each'), which is
      falsified; that same extract's §1.1.11 at :456-474 is correct and names all
      four built-ins correctly — the extract contradicts itself internally.
      AUDIT_STICKER.md §3.4's same-field-set claim is TRUE. The real divergences
      are two: (1) seed count — sticker seeds 3, both business tools seed 4
      including cp_def4 'Warm Ivory'; (2) cp_def1 carries an identical id AND an
      identical name 'Dark Gold' while 6 of its 7 values differ — sticker
      bg #060603, txt #e8dfc8, mut #7a6f58, row #0e0d0a, tot #0e0d0a,
      grand #0e0d0a against business bg #0a0804, txt #e8e0cc, mut #6b5e3a,
      row #12100a, tot #12100a, grand #1e1a0f; only gold #c9a84c matches.
      cp_def2 and cp_def3 are byte-identical across all three. Whichever tool
      seeds an empty store first silently defines 'Dark Gold' for the others.
      Two follow-ons: EXTRACT_STOCK_COSTS.md:2542's count needs a Gate 1
      annotation decision, and the canonicalisation of ColorRole / ColorValue
      remains DOMAIN_MODEL.md at P-07.
      CORRECTED AGAIN at Gate 1. The earlier amendment stated
      EXTRACT_STOCK_COSTS.md §1.1.11 was correct. Its four BUILT-IN NAMES are
      correct; its FIELD LIST is fabricated — see CF-61. The seven-value record
      and the two real divergences (sticker seeds 3 against 4; cp_def1 identical
      in id and name but differing on 6 of 7 values) are unchanged and confirmed
      against all three sources.
      CF-49 — CLOSED (P-06a). DOMAIN_MODEL.md D7: one BrandTheme entity with a
      fixed, semantically named ColorRole set, one ColorValue per role. The
      legacy collision — same key, same ids, same names, different values,
      three writers, first-seeder-wins — is structurally impossible.
- [ ] CF-50 — AUDIT_STICKER.md §3.4 names the three bb_color_presets seeds
      "Balance Bites", "Dark Mode", "Ocean Blue". P-04's direct read gives
      `Dark Gold`, `Obsidian Blue`, `Forest Night` — all three falsified. §3.4
      is also the sole record of a fourth, sticker-absent preset name, now
      UNVERIFIED. §C-3's seven-colour field set and cp_def1-cp_def4 id scheme
      are correct and unaffected. AUDIT_STICKER.md is the only record of the
      sticker tool, so an uncorrected false claim propagates into P-05 and P-07.
      Annotated by P-04b, never rewritten. Owner: Gate 1 — do not treat §3.4's
      naming claims as evidence; then P-07.
      'Warm Ivory' is CONFIRMED correct at bb-stock-costs.html:1349,
      not unverified. P-04b's annotation was corrected by P-04c. Only the three
      sticker seed names were ever false. Second location annotated under CF-56.
      AMENDED (P-08-PRE-FIX) — owner: the AUDIT_STICKER.md annotation task,
      before Gate 3
      AMENDED (P01-T05-FIX) — the owner has passed: "before Gate 3" names a gate
      that closed on 2026-08-01. Owner: **the `AUDIT_STICKER.md` annotation task
      at P08**, batched with CF-56 per PR-20. P08 is where that record is next
      needed, because `FEATURE_INVENTORY.md` is authored there and
      `AUDIT_STICKER.md` is its only source for the sticker tool.
- [ ] CF-51 — Prompt-template defect: "one commit" combined with "do not amend
      or rewrite history" forbids any post-push correction, forcing a choice
      between two explicit instructions. P-04 hit this and correctly landed a
      second commit. Corrected standing rule: one commit for the deliverable; a
      corrective follow-up commit is permitted, must be declared, and must carry
      a subject line stating what it corrects. Third template defect after CF-40
      and CF-43. Owner: reviewer, standing; applied from P-04b onward.
- [x] CF-52 — The owner's OS account name appears in mutable public files beyond
      AUDIT_STICKER.md:651. Locations: REPORT.md:218 (two occurrences on one
      line — a SHARED_DATA_PATH value and a file:/// cross-link),
      docs/archive/2026-07/inventory.json:51 (sharedFolderPath) and :52
      (crossLink). Redacted by P-04c. Three immutable occurrences remain under
      legacy/ (bb-stock-costs.html:902 and :1178, balance-bites-sticker.html:1138)
      and are covered by CF-14's OD. Owner: reviewer, closes on P-04c verdict.
      CF-52 — CLOSED (P-08-PRE-FIX). P-08-PRE Task 5's repo-wide grep returned
      zero occurrences in any mutable current file, independently confirmed by
      the reviewer with a broader pattern: three files carry the path shape and
      in `docs/requirements/extracts/REPORT.md` and
      `docs/archive/2026-07/inventory.json` the name segment is the literal
      placeholder `<REDACTED>`. The remaining occurrence is inside `legacy/`,
      which is frozen and covered by CF-14.
- [ ] CF-53 — docs/method/PROJECT_RECONFIG.md was byte-identical to
      docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md (same blob SHA). SESSION_CONTEXT
      recorded P-01c as landing the reconfiguration record there; it landed a
      copy of the instructions instead, so the record was never committed and its
      content is unrecoverable. Replaced with a STATUS stub by P-04c rather than
      invented or deleted. Owner: reviewer — decide at P-12 whether the record is
      re-authored or the stub stands.
      AMENDED (P-06b-LAND) — inventory only, nothing retired. Every file in the
      working tree, tracked or untracked, that is or contains a copy of the
      project instructions, enumerated at this commit:

      | Path | Bytes | Tracked | First H1 line |
      |---|---|---|---|
      | `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md` | 17,212 | Tracked | `# B2S — CLAUDE PROJECT RECONFIGURATION` |
      | `docs/archive/2026-07/CLAUDE_PROJECT_INSTRUCTIONS.md` | 4,599 | Tracked | `# Claude Project Instructions — paste this verbatim` |
      | `docs/method/REVIEWER_CHAT_INSTRUCTIONS.MD` | 11,825 | Untracked | none — opens directly with instruction body text, no title line |

      Three copies of one document is the CF-53 shape, and this row now carries
      the evidence rather than the suspicion. The naming of the `docs/method/`
      copy is confirmed by the owner before anything is retired or renamed.
      Owner unchanged: reviewer, decide at P-12.
      AMENDED (P01-T04) — **the three-copy question is settled, and the answer is
      that there are not three copies of one document; there are three documents
      with three distinct roles.** Stated so no later reader re-opens it:
      `AGENTS.md` is the builder charter, in force on the builder surface;
      `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md` is the historical record of
      the reconfiguration at the greenfield pivot, kept because the pivot is the
      reason the retiring tools are evidence rather than a port target; and
      `docs/method/REVIEWER_CHAT_INSTRUCTIONS.md`, landed by this task under
      CF-96, is the live reference for the reviewer surface. Each now opens by
      naming its own role, so the roles cannot be inferred wrongly from
      similarity of content. What remains for P-12 is unchanged and is the
      original CF-53 finding: `docs/method/PROJECT_RECONFIG.md` holds a STATUS
      stub where a lost record should be, and the reviewer decides whether it is
      re-authored or the stub stands. The duplication half of this row is closed;
      the lost-record half is what keeps it open.
- [ ] CF-54 — Stub count stated three ways: 22 in P-01's done-when, 20 in P-12's
      prompt, 23 actual (21 under docs/product/, 2 under docs/method/). Same
      defect class as CF-38's 56-versus-79. P-12 corrected and P-01 annotated
      as-built by P-04c. Owner: reviewer, verify at Gate 3.
      AMENDED (P01-T05-FIX) — **a twelfth stale owner, found by the check this
      task landed rather than by the gate that ordered it.** The P01 exit gate
      reported eleven open rows naming an owner whose moment had passed, and
      P01-T05-FIX was told to retarget those eleven. Verified over the whole set
      per PR-23, there are twelve: this row's owner is "reviewer, verify at
      Gate 3", and Gate 3 closed on 2026-08-01. It is retargeted here rather
      than left, because leaving it would land `check_ledger.py`'s new
      reachable-owner assertion red on the very commit that introduces it. The
      divergence from the prompt's stated count is declared in the task report.
      Owner: **the P08 pre-relaunch audit**, batched with CF-39 per PR-20. P08 is
      where the document set is audited in full and `ACCEPTANCE.md` is authored,
      and the stub count is only meaningful against a finished document set —
      under OD-H7 it changes at every phase that authors a just-in-time document.
- [x] CF-55 — SESSION_CONTEXT.md is 58,233 bytes and grows every task, because
      the full carry-forward ledger including all appended amendment text lives
      inside the file that must be pasted at the start of every session. It is
      now larger than DEV_OS.md and DEV_OS_REFERENCE.md combined. Proposed
      remedy: move the ledger to docs/method/CARRY_FORWARDS.md; SESSION_CONTEXT.md
      retains state, next action, environment quirks and open CF ids by
      reference. Requires an AGENTS.md §0/§9 amendment, so it is NOT actioned by
      P-04c. Owner: owner signature, then a dedicated task.
      CF-55 — CLOSED (P-04d). Ledger moved to docs/method/CARRY_FORWARDS.md,
      precedents and environment quirks to docs/method/PRECEDENTS.md.
      SESSION_CONTEXT.md went from 64,723 to 6,202 bytes; mandatory per-session
      reading from 64,723 to 13,885 across two files. 44 rows reconciled
      exactly, none reworded, reordered, renumbered or closed by the move.
      AGENTS.md §0/§9, .cursor/rules/b2s-devos.mdc and DEV_OS.md §6 amended to
      match. Signed 2026-07-31.
- [ ] CF-56 — The falsified sticker preset names appear at two locations in
      AUDIT_STICKER.md. P-04b annotated §3.4 (:994) only. The rows at :610-611
      attribute the same names to `theme.presets.dark.*` and
      `theme.presets.ocean.*` — an identifier that occurs zero times in the
      source. Those lines are cp_def2 and cp_def3 inside ColorPresetMgr.DEFAULTS
      under key bb_color_presets. Annotated by P-04c. Owner: reviewer, closes on
      P-04c verdict.
      AMENDED (P-08-PRE-FIX) — owner: the AUDIT_STICKER.md annotation task,
      before Gate 3 — same task as CF-50
      AMENDED (P01-T05-FIX) — as CF-50: "before Gate 3" has passed. Owner:
      **P08, the same task as CF-50** — one annotation pass over
      `AUDIT_STICKER.md` closes both locations, and splitting them would annotate
      the same file twice.
- [x] CF-57 — Extraction density drifted across the three passes:
      EXTRACT_STOCK_COSTS 174 KB from a 347 KB source (50%), EXTRACT_INVOICE_PRO
      231 KB from 222 KB (104%), EXTRACT_DESIGN_TOOLS 228 KB from 197 KB (116%).
      Two extracts are larger than the files they extract. Gate 1 check: is the
      expansion added analysis (typed field lists, invariant-versus-policy
      columns, spot-check tables) or transcription? Owner: reviewer, Gate 1.
      CF-57 — CLOSED (Gate 1). Density drift is added analysis, not
      transcription: 22 numbered calculations with invariant/policy blocks, a
      16-item reconciliation, 40 justified degrees of freedom, an 11-row
      spot-check table. EXTRACT_STOCK_COSTS at 50% is the low outlier,
      consistent with HF-1 and CF-42 both landing in that file. No action.
- [ ] CF-58 — tools/backup-browser-data.js serves the browser-data backup
      workflow abandoned by owner decision 2026-07-29, with design-tool presets
      accepted as potentially unrecoverable. Orphaned. Archived by P-04c to
      docs/archive/2026-07/ rather than deleted. Owner: reviewer, closes on
      P-04c verdict.
      AMENDED (P-08-PRE-FIX) — owner: owner decision, retire or keep; landing at
      the next repo-maintenance task
- [x] CF-59 — The reviewer surface can read the public repo directly
      (api.github.com, raw.githubusercontent.com) and has begun doing so:
      P-04b's verdict and the CF-49/CF-50/CF-56 resolutions were produced by
      direct read, not from pasted reports. This changes the verification loop —
      the reviewer now verifies against the artifact rather than against a
      description of it, and can run exhaustiveness checks by grep. It does not
      change write access or the builder's role. It needs a signed decision, and
      a standing discipline that every verdict states what was fetched and which
      commands were run. Owner: OD at P-06.
      CF-59 — CLOSED (P-04d). Reviewer direct repository read SIGNED 2026-07-31 and
      landed as PR-09 in docs/method/PRECEDENTS.md, with the codeload fetch
      pattern and the api.github.com rate-limit quirk recorded in §2. The
      committed project instructions are synced by P-04e. Formal method OD to
      be recorded in DECISIONS.md at P-06.
- [x] CF-60 — Four open rows carry no explicit `Owner:` field: CF-01, CF-05,
      CF-27, CF-44. Not a substantive gap — CF-01's owner is P10 and CF-05's is
      Step 15, both stated in prose rather than as a field; CF-27 is
      noted-no-action; CF-44 is void by design. But the Gate 3 checklist requires
      "No open carry-forward without a named owner" and a checklist cannot read
      prose. Normalise all four to explicit `Owner:` fields, inventing no owner —
      where none exists, write the reason. Owner: reviewer, before Gate 3.
      CF-60 — CLOSED (P01-T05-FIX). The prior owner, "reviewer, before Gate 3",
      passed on 2026-08-01. Retargeted to this task and closed rather than
      re-owned, because its subject is done and was verified row by row here:
      CF-01 carries `owner: ARCHITECTURE.md…` and now a P02 owner, CF-05 carries
      `owner: PRINT_CONTRACT.md…`, CF-27 is CLOSED and VOID so the requirement —
      "no **open** carry-forward without a named owner" — does not reach it, and
      CF-44 carries `owner: none — void, retained as a numbering record`, which
      is this row's own instruction to write the reason where no owner exists.
      **What this row could not catch is the failure that produced the P01 gate's
      D1.** It asked whether an owner field existed, never whether it pointed
      anywhere, so eleven rows passed it while naming a gate or a phase already
      behind us. `scripts/check_ledger.py` now asserts both: an open row names an
      owner, and that owner does not name a gate or phase-exit gate already
      recorded as run in `SESSION_CONTEXT.md`'s done-steps table. VOID rows are
      exempt by the status CF-44 already declares.
- [x] CF-61 — HARD FAILURE at Gate 1. EXTRACT_STOCK_COSTS.md §1.1.11 stated a
      fabricated typed field list for `bb_color_presets`: `bg, panel, ink, muted,
      gold, line`. Four names are wrong — `panel`, `ink` and `line` do not occur
      in the source at all, and `muted` is the wrong name for `mut`. The true
      record is `{id, name, bg, gold, txt, mut, row, tot, grand}`, seven hex
      values, at bb-stock-costs.html:1346-1350. §6 at :2542 compounded it with
      "6 hex values each". Corrected by P-02-FIX. Four other entity blocks were
      spot-checked against source and are exact, so the defect is bounded, not
      systemic. Owner: closes on the P-02-FIX verdict.
      **CF-61 — CLOSED (P-02-FIX).** §1.1.11 now states the seven-value record;
      §6's row corrected to 7 hex values. Gate 1 hard failure cleared.
- [x] CF-62 — Payments have no legacy source. The stored shape is
      `{invoiceId: {status:'paid'|'pending', updatedAt}}` — a binary flag, no
      amount, no payment type, no partial state, no receipt. Release 1 requires
      full/partial/underpaid, cash/card/other and receipt attachment (OD-C12).
      Every one of those is owner-specified with nothing to harvest. A
      declared/actual mismatch also exists: the doc comment at :3121 promises
      `paidDate`, the code writes `updatedAt`. Owner: CALC_SPEC.md and
      DOMAIN_MODEL.md.
      CF-62 — CLOSED (P-07-LAND). `CALC_SPEC.md` R1-11 through R1-14 author the
      whole payment surface from nothing: amount, method, date, optional
      `Receipt`, outstanding as `Invoice.total` less payments less credit notes
      per OD-C16, overpayment accepted and carried negative per CS-13, and state
      derived from outstanding rather than stored. The legacy binary flag, where
      absence was indistinguishable from unpaid, is not reproduced in any form.
- [x] CF-63 — EXTRACT_DESIGN_TOOLS.md references "§C.4" at :1073, :1240 and
      :2015, each saying a finding is recorded there. No §C.4 heading exists in
      the file, so three findings have no destination. Recovered by P-02-FIX.
      Owner: closes on the P-02-FIX verdict.
      **CF-63 — CLOSED (P-02-FIX).** §C.4 landed in EXTRACT_DESIGN_TOOLS.md at
      :3221 with three recovered findings, each citing its referring line.
- [x] CF-64 — `WRITE_KEYS` in bb-stock-costs.html:1180 contains
      `bb_label_templates`, which that tool only ever reads (:6016). Mirroring
      therefore overwrites the sticker tool's template catalogue with whatever
      the local store holds — including an empty array on a fresh profile. The
      sharpest cross-tool destruction path in the family. Requirement: B2S needs
      an explicit producer/consumer declaration per collection, enforced.
      Owner: DOMAIN_MODEL.md.
      CF-64 — CLOSED (P-06a). DOMAIN_MODEL.md D1 and invariant 4: every collection
      has exactly one owning module, single-writer, declared. All other modules
      read through a declared interface and can never write.
- [x] CF-65 — Arabic display strings are used as stored primary keys in at least
      two enumerations (EXTRACT_STOCK_COSTS §6.6, §7.4; EXTRACT_INVOICE_PRO
      F-14). Translating the UI would become a data migration, which directly
      contradicts OD-D6 and OD-D7. Requirement: every enumeration stores a
      language-neutral key; display text lives in `TranslationEntry`.
      Owner: DOMAIN_MODEL.md and DATA_MODEL.md.
      CF-65 — CLOSED (P-06a). DOMAIN_MODEL.md invariant 2: identity is a generated
      key, never a natural key. No name, code or Arabic string is ever an
      identifier or an enumeration value. Resolves D11 and D12 with it.
- [x] CF-66 — `Return.amount` carries two incompatible meanings depending on
      write path (EXTRACT_STOCK_COSTS §2.11, §4.6, §8.14). Owner: DOMAIN_MODEL.md.
      CF-66 — CLOSED (P-06a). DOMAIN_MODEL.md D2: ReturnLine carries two explicit
      fields, returnedValue and writeOffValue, both always present. The single
      path-dependent amount field is gone.
- [x] CF-67 — The inventory ledger switches from production-derived to
      invoice-derived consumption the moment one invoice exists
      (EXTRACT_STOCK_COSTS §2.17, §8.7) — a behavioural cliff, not a gradual
      change. Owner: DOMAIN_MODEL.md; the stock-creation invariant in
      B2S_PREPARE_PHASE.md §7 already forecloses it, so this is confirmation
      evidence.
      AMENDED (P-05-PRE). Removed a duplicated "Owner: DOMAIN_MODEL.md" that
      appeared twice in this row. No other change.
      CF-67 — CLOSED (P-06a). DOMAIN_MODEL.md §5.2 and §5.3: StockLevel is derived
      from StockMovement with exactly one write path, and only four
      confirmation events create stock. The production-derived versus
      invoice-derived cliff has no mechanism to occur.
- [x] CF-68 — Unmarked return dispositions default in OPPOSITE directions across
      the two retiring tools (EXTRACT_INVOICE_PRO F-9). The same legacy row
      yields two different stock and money outcomes depending on which tool reads
      it. Owner: DOMAIN_MODEL.md and CALC_SPEC.md.
      CF-68 — CLOSED (P-06a). DOMAIN_MODEL.md D3: an unstated ReturnDisposition is
      an error, not a default. Both legacy defaults are rejected; on import the
      row fails with an ImportRowError naming the missing field.
- [ ] CF-69 — Invoice history is capped at 100 records with silent destruction
      (EXTRACT_INVOICE_PRO F-10, §8.2). Every historical figure the owner has
      seen is silently truncated. Owner: FEATURE_INVENTORY.md must-not-reproduce.
- [x] CF-70 — Returns are valued at list price against a discounted invoice total
      (EXTRACT_INVOICE_PRO F-13, §2.9). Every net-revenue figure the business has
      relied on is overstated by the discount on returned lines. The highest-value
      money finding in the whole extraction. Owner: CALC_SPEC.md — it must state
      the return valuation basis explicitly.
      AMENDED (P-06a). DOMAIN_MODEL.md D13 supplies the structural half: discount
      is allocated across InvoiceLine records at issue and stored per line, so
      Invoice.total equals the sum of InvoiceLine.netValue exactly, and a
      return values against the line's actual net value rather than list price.
      The allocation method and its rounding-remainder rule remain
      owner-authored. Owner: CALC_SPEC.md, now its highest-value row.
      CF-70 — CLOSED (P-07-LAND). Structure and arithmetic are both settled.
      `DOMAIN_MODEL.md` D13 allocates invoice-level discount across
      `InvoiceLine` records at issue; `CALC_SPEC.md` R1-04 states the method
      (proportional to gross, CS-08) and the remainder rule (largest remainder
      with a stated tie-break, CS-09); R1-15 values a `Return` against the
      stored `netValue` rather than list price (CS-10); CS-11 gives the tranche
      that exhausts a row the residual, so a fully returned row credits exactly
      its `netValue`. Identities I3, I5 and I7 in §5 are the assertable form.
      The worked example quantifies what was being lost: 81.90 on the correct
      basis against 91.00 on the legacy basis, a 9.10 overstatement on one row
      of one `Invoice`.
- [ ] CF-71 — A parse failure is indistinguishable from an empty collection
      (invoice-pro:1199), and the next save writes the empty result over real
      data (EXTRACT_INVOICE_PRO F-15). Owner: FEATURE_INVENTORY.md
      must-not-reproduce.
- [ ] CF-72 — Every `bb-stock-costs.html` and `balance-bites-invoice-pro.html`
      citation in REPORT.md needs re-derivation before use. Drift is non-linear
      in both files: +140 to +1506 in stock-costs, 0 to +3035 in invoice-pro.
      UNIFICATION.md and PHASE_PLAN.md inherit the same stale numbers and are
      VOID, so no action there. Owner: annotate REPORT.md at P-05; never cite an
      unverified REPORT.md line number.
      AMENDED (P-08-PRE-FIX) — owner: the REPORT.md annotation task, before
      Gate 3 — same task as CF-11
      AMENDED (P01-T05-FIX) — the owner has passed: "before Gate 3" names a gate
      that closed on 2026-08-01. Owner: **the `REPORT.md` annotation task at
      P02**, batched with CF-11 per PR-20 — one task, one round trip, both rows.
- [ ] CF-73 — bb-stock-costs.html:5645 contains `مرtجع كامل` — a Latin `t`
      where `ت` belongs. Every printed sales report containing a full return
      has shipped corrupted text, invisibly, for the life of the tool. This is
      the strongest evidence for OD-D6/D7: a translation resource makes this a
      one-line fix and a grep-able defect class, while an inline literal makes
      it undetectable. Owner: FEATURE_INVENTORY.md must-not-reproduce, and
      UX_PRINCIPLES.md as the worked justification for the no-literals rule.
- [ ] CF-74 — The report engine has no resource bundle outside the invoice
      template. `الإجمالي` is re-declared at bb-stock-costs.html:5652, :5743,
      :5746, :5798 and `المنتج` at :5651, :5712, :5757, :5782. Eight
      declarations of two strings. Requirement: one resource key per string,
      one declaration site. Owner: DOMAIN_MODEL.md and UX_PRINCIPLES.md.
      AMENDED (P-06a). DOMAIN_MODEL.md invariant 2 settles the storage half — no
      Arabic string is ever an identifier, and TranslationEntry is the only
      home for display text. The single-declaration-site requirement remains.
      Owner: UX_PRINCIPLES.md.
- [ ] CF-75 — AGENTS.md and .cursor/rules/b2s-devos.mdc carried folder paths
      (`src/data/adapters/`, `src/print/`, `components/ui/`,
      `components/shared/`) and a named library (`zod`) in always-on rules,
      ahead of ARCHITECTURE.md. Rewritten by P-05-PRE to state principle and
      defer mechanism. When Gate 3 closes, restore the enforcement column with
      real guard names and paths.   Owner: ARCHITECTURE.md, immediately after
      Gate 3.
      AMENDED (P01-T05-FIX) — the owner has passed. Gate 3 closed on 2026-08-01
      and `ARCHITECTURE.md` was authored at `3918cf4`, so the condition this row
      was waiting on is met: the rules files can now cite real guard names and
      real paths because a document defines them. Owner: **the P02 entry
      checklist**. Both always-on rules files are restored in one pass, or they
      drift from each other — `AGENTS.md` and `.cursor/rules/b2s-devos.mdc` are
      the same rules in two activation syntaxes and changing one alone is a
      defect by `AGENTS.md`'s own preamble.
- [x] CF-76 — GLOSSARY.md changed eight things against VOCABULARY_DRAFT.md, each
      forced by extract evidence: a sixteenth collision (`preset` names both a
      colour theme and a print margin set); `PrintPreset` renamed `PrintProfile`
      as its consequence; `BrandTheme` added as an entity the draft had no term
      for; `BillOfMaterials` renamed `Recipe` because `وصفة` is the owner's word
      and collides with nothing; `material` added to the enforcement list;
      `MovementReason` gained `opening_balance` and `stocktake`, which existed
      only as sentinel strings in a supplier text field; `ReturnDisposition`
      value `expired` renamed `writeOff` because the identifier and its Arabic
      label `تالف` (damaged) disagreed; and an Arabic column added throughout.
      Any downstream document drafted against the draft's vocabulary must be
      re-checked. Owner: DOMAIN_MODEL.md at P-06.
      CF-76 — CLOSED (P-06a). All eight GLOSSARY.md changes are carried into
      DOMAIN_MODEL.md: BrandTheme is an entity (D7), Recipe and RecipeLine are
      catalog entities, PrintProfile is the print tier's name, and
      ReturnDisposition uses writeOff. No downstream document was drafted
      against the superseded draft vocabulary.
- [x] CF-77 — `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md` §3.2 through §3.7
      describe the knowledge-file set as a rotation plan in the future tense —
      "add now", "keep for now, remove at Gate 1", "the second rotation — after
      Gate 1", "resulting knowledge set". That plan has since been executed and
      then diverged from. Gate 1 has passed and the attached set is now six
      files: `docs/method/DEV_OS.md`, `docs/method/DEV_OS_REFERENCE.md`,
      `AGENTS.md`, `docs/method/B2S_PREPARE_PHASE.md`,
      `docs/product/GLOSSARY.md` and `docs/product/DOMAIN_MODEL.md`. That is
      not the set §3.6 predicted, and `VOCABULARY_DRAFT.md` has been dropped
      entirely. Six sections of the document that configures the reviewer
      surface describe a state that no longer exists. Verified against the
      reviewer surface's own attached set, 2026-08-01. Owner: P-06b-LAND.
      CF-77 — CLOSED (P-06b-LAND). §3.2 through §3.7 replaced by a single
      current-state §3.2 that states the set instead of scheduling it, and
      carries forward §3.5's live rule — `SESSION_CONTEXT.md` is never attached
      — as the "not attached, fetched instead" paragraph. §3.1 is left standing
      as the historical removal record and is annotated as such. No rotation
      plan survives in the file.
- [x] CF-78 — `docs/archive/2026-07/CLAUDE_PROJECT_INSTRUCTIONS.md` measured
      4,599 bytes with SHA-256 beginning 1F5D5F07 in the working tree during
      P-06b-LAND, against 4,596 bytes and C21A6FD5 on origin/main. Three bytes
      is exactly the width of a UTF-8 BOM, and PRECEDENTS.md §2 records that
      `Set-Content -Encoding UTF8` on PowerShell 5.1 writes one. Harmless at
      rest; it becomes a BOM-in-archive commit the first time that directory is
      staged. Owner: P-07-LAND Task 4, then reviewer if unresolved.
      CF-78 — CLOSED (P-07-LAND). `git status --porcelain docs/archive/`
      returned empty at this commit — the working tree carries no divergence
      from HEAD for this path, and HEAD is up to date with origin/main. The
      4,599-versus-4,596 byte reading recorded during P-06b-LAND was a
      measurement artefact between two read methods, not a live BOM drift
      surviving in the committed file. No restore action was needed or taken.
- [x] CF-79 — Four bare `GLOSSARY.md` §5 nouns in reviewer-authored prose in
      `TENANCY_MODEL.md`: "Every asset" and "Asset storage" for `MediaAsset`,
      and two uses of "line" for `BrandLine`, one of which also called a
      `Tenant` an "account". Found by the P-06b-LAND builder's
      redact-and-continue sweep and correctly reported rather than edited. The
      glossary binds the reviewer as tightly as it binds the builder, and these
      are the reviewer's defects. Owner: P-07-LAND.
      CF-79 — CLOSED (P-07-LAND). All four corrected in place. Three further
      hits in the same sweep were examined and rejected as false positives:
      module names at :82, the human-activity sense of "design" at :95, and the
      signed feature name "Design Assistant" at :96. `SECURITY_MODEL.md` had
      zero hits.
- [x] CF-80 — Done-steps table integrity. Owner: the pre-Gate-3 reconciliation
      task.
      EXPANDED (P-08-PRE-FIX). The done-steps table in `SESSION_CONTEXT.md`
      carried the literal string `<this commit>` in four consecutive rows —
      P-05-LAND, P-06a-LAND, P-06b-LAND, P-07-LAND — because the reviewer's
      prompt template supplied a value the builder cannot know: the sha does not
      exist until after the commit. Eight rows also read `pending` in the Verdict
      column, four for tasks the reviewer had since passed. The running record
      degraded exactly where it is meant to be strongest. Same class as CF-51.
      CF-80 — CLOSED (P-08-PRE-FIX). P-07-LAND was repaired by the verdict
      recording at a61359a; the remaining three sha placeholders are replaced
      with real short shas from `git log`, and their verdicts set to PASS. Rows
      whose verdict the reviewer has not issued in a recoverable record are left
      `pending` and named in the report — a verdict invented to tidy a table is
      worse than a blank one. PR-17 prevents recurrence.
- [x] CF-81 — Copy-verification measurement is tool-dependent. Owner:
      `PRECEDENTS.md`, PR-16.
      EXPANDED (P-08-PRE-FIX). During P-06b-LAND a builder reported 4,599 bytes
      and a SHA-256 beginning 1F5D5F07 for
      `docs/archive/2026-07/CLAUDE_PROJECT_INSTRUCTIONS.md`, against origin's
      4,596 and C21A6FD5. At P-07-LAND `git status` reported the path clean, so
      git's content hash matched origin and the earlier reading was wrong.
      Task 1 of every land task proves a copy by exactly this measurement. A
      method that has returned a false reading on an unchanged file can return a
      true-looking reading on a corrupted one.
      CF-81 — CLOSED (P-08-PRE-FIX) by PR-16, which names the exact commands and
      makes git's own status authoritative over any external reading.
- [x] CF-82 — 11 open rows name an owner that has already run. Owner: the
      pre-Gate-3 reconciliation task.
      EXPANDED (P-08-PRE-FIX). Of 30 open rows at P-07-LAND, 11 named an owner
      that had already run — CF-04, CF-11, CF-14, CF-22, CF-33, CF-46, CF-50,
      CF-52, CF-56, CF-58, CF-72 — pointing at Gate 1, Gate 2, P-04, P-04c, P-05
      or P-06. A further four named none at all (CF-60). Gate 3 requires every
      open row to have an owner, and an owner that ran three steps ago does not
      satisfy it.
      CF-82 — CLOSED (P-08-PRE-FIX). All 15 reassigned to reachable owners; two
      rows voided; CF-33 and CF-52 closed outright. The Gate 3 item now requires
      a *reachable* owner, so the same drift fails the gate next time.
- [ ] CF-83 — Reviewer state assertions are not stamped to a commit. Owner:
      PRECEDENTS.md, PR-18.
- [ ] CF-84 — A verdict-logged carry-forward is opened as a stub, then
      re-opened as new by the next prompt. Owner: PRECEDENTS.md, PR-19.
- [x] CF-85 — `main` was an unprotected branch on a public repository with no
      credential detection of any kind. Verified by `gh api` at the Gate 3 run:
      secret scanning off, push protection off, and
      `/branches/main/protection` returning 404 "Branch not protected", so
      nothing prevented a force-push, a branch deletion, or history rewriting.
      The secret-scanning alerts endpoint returned "disabled on this repository"
      rather than a count — there had never been a scan, so no clean result
      existed to report. `B2S_PREPARE_PHASE.md` §8 Step 1 had signed all three
      as required and marked secret scanning "non-negotiable — this is what
      enforces G7"; none had been executed. Owner: owner decision.
      CF-85 — CLOSED (G3-CLOSE). The owner chose to enable all three while
      keeping the repository public with no review requirement and no PR gate,
      which is the configuration Step 1 specified. Secret scanning, push
      protection, force-push block and deletion block are on, and Dependabot
      alerts with them. Recorded honestly: `enforce_admins` is false, so an
      administrator can still force-push deliberately. The block stops accident
      and tooling, not intent, and that is the trade the owner chose against
      review friction.
- [x] CF-86 — Secret scanning was enabled at G3-CLOSE and the alerts endpoint
      returned `[]` seconds later. That is a real reading of a real endpoint, but
      GitHub backfills historical scanning asynchronously and this repository has
      substantial history, so `[]` at that moment meant the scan had not
      finished — not that history is clean. The G3-CLOSE report characterised it
      as "no history to scan", the only inexact claim in an otherwise exact
      report, and the subtle form of the PR-21 trap: a check that ran but had not
      concluded, recorded as a conclusion. Gate 3 passed on the protections being
      live plus a reviewer sweep finding zero credential patterns in the working
      tree; the historical result is outstanding.
      Owner: the P01 entry checklist, before any Supabase project is created and
      a real key exists.
      CF-86 — CLOSED (P01-T01). The secret-scanning alerts endpoint was re-read
      after the historical backfill completed and returned a definite count of
      zero. The Gate 3 reading had been taken seconds after enablement, when the
      scan had not concluded. History is now scanned and clean, which is what the
      Gate 3 item actually claimed and could not yet evidence.
- [x] CF-87 — P-09-LAND Task 3 step 5 specified the placeholder check as a
      negative string scan. A negative scan cannot distinguish a live unfilled
      value from the documentation of one, so it was guaranteed to fail on four
      prose quotations recording the CF-80 defect, including `PRECEDENTS.md`
      PR-17 itself, whose purpose is to quote the anti-pattern it prevents. A
      guard that fails on its own precedent is a broken guard. The builder found
      it by verifying locally before committing, as required, and halted rather
      than narrowing the check or editing the evidence. Owner: reviewer.
      CF-87 — CLOSED (P-09-LAND-FIX2). Replaced by a positive shape assertion
      scoped to the done-steps commit column, accepting a sha or a declared
      em-dash, with the last row exempt. Strictly stronger: catches all four
      CF-80 rows, catches malformed values neither party anticipated, cannot
      false-positive on prose, and removes the transient-red-by-construction the
      builder also flagged. Landed as PR-22.
- [x] CF-88 — The first correction to CF-87 asserted that every commit column in
      the done-steps table held a backticked sha. It does not: 4 of 21 data rows
      carry a bare em-dash — P-00, P-01, P-01b, P-01c — which predate the
      one-task-one-commit convention. The reviewer had read the tail of the table
      rather than the table, and asserted a universal from a partial sample. The
      corrected check would itself have failed on the current tree, which is a
      listed HALT condition, so the builder halted a second time on the same
      task. Two consecutive halts, both from reviewer state assertions rather
      than builder error. Owner: reviewer.
      CF-88 — CLOSED (P-09-LAND-FIX2). The em-dash is accepted as a well-formed
      value and declared in a legend beneath the table. Landed as PR-23, which
      requires universal claims to be enumerated over the whole set. The
      docs-integrity workflow this task creates is the durable fix: once the
      reviewer reads its output instead of asserting state by hand, the class of
      error that produced CF-87 and CF-88 stops being possible.
- [x] CF-89 — P-09-LAND-FIX2's credential scan specified `service_role` as a bare
      substring match. Like CF-87 before it, a literal-text rule cannot separate a
      leaked key from prose about why keys must never appear — and it fired on six
      legitimate policy sentences in `ADR.md`, `ARCHITECTURE.md` and
      `B2S_PREPARE_PHASE.md`, two of them in documents the same task was landing.
      The builder identified it as a PR-22 instance and halted rather than
      weakening the check. Third instance of that class in one task. Owner: reviewer.
      CF-89 — CLOSED (P01-T01). Rewritten as a shape assertion: the keyword only
      matches beside a separator and a token of twenty characters or more, and the
      rule set carries a Supabase connection-string pattern, a JWT triple and a PEM
      header. The JWT pattern is the material improvement — it catches a real
      Supabase key whether or not the word appears near it, which the substring
      rule never could. Verified by a synthetic self-test against assignment-,
      JSON-, JWT- and PEM-shaped fakes with the benign sentences left untouched.
      Landed late: the finding was resolved in P-09-LAND-FIX2 but the row was not
      written, and the omission was not reported as a deviation.
- [x] CF-90 — `ARCHITECTURE.md` §7 gave arrival points for ten deferred documents
      and omitted three: `UX_PRINCIPLES.md`, `DOCUMENT_SPEC.md` and
      `REGULATORY.md`. OD-H7's premise is that every deferred document carries
      its Gate 3 item to a named later gate; three had nowhere to arrive and would
      never have been written. Owner: reviewer.
      CF-90 — CLOSED (P01-T02-RESUME). Three rows added to §7.
      Builder annotation, P01-T02-RESUME, 2026-08-02, per PR-07 — the claim text
      above is landed verbatim as supplied and is left intact. Its count is off by
      one: §7 named **eleven** documents across seven rows before this amendment
      (`DATA_MODEL`, `BRAND_CONFIG`, `CONTENT_MODEL`, `TEMPLATE_MODEL`,
      `PRINT_CONTRACT`, `PRINT_PRODUCTION_SPEC`, `IMPORT_SPEC`,
      `FEATURE_INVENTORY`, `RISK_REGISTER`, `ACCEPTANCE`, `MODULE_SPEC`), not ten.
      Verified by enumerating the table at `04a503b`. The substance of the finding
      — three documents with no arrival point — is correct and was verified
      independently: all three exist as stubs under `docs/product/`.
- [x] CF-91 — PR-19 states that the step recording a reviewer verdict opens every
      carry-forward that verdict logged. When the owner merges and proceeds
      directly, no recording step runs, and those rows are never opened — CF-90
      was logged in the P01-T01 verdict and did not exist when the next task tried
      to close it. The builder correctly refused to invent text for an unbacked
      id. Owner: reviewer.
      CF-91 — CLOSED (P01-T02-RESUME) by PR-24.
- [ ] CF-92 — ADR-012 runs B2S on a single Supabase environment. Its reinstatement
      trigger is a row count: the isolation suite may run against production only
      while it holds zero real tenants, and a staging project is created before
      the first real tenant is onboarded. Owner: the task that onboards the first
      non-synthetic tenant, and the Phase 02 exit gate, which must assert the row
      count rather than assume it.
- [ ] CF-93 — Seven specification gaps in `DATA_MODEL.md`'s Platform tier, found by
      building it at P01-T02-RESUME. None was resolved by invention: each was
      implemented on the narrowest reading available and is recorded here for the
      tier amendment. Owner: reviewer, at the next `DATA_MODEL.md` amendment.
      (1) §3's lead sentence says "Seven tables for Release 1" while §3 enumerates
      six — 3.1 `tenant`, 3.2 `member`, 3.3 `membership`, 3.4 `operator`, 3.5
      `consent_grant`, 3.6 `activity_event` — with 3.7 `role` stated to be a
      Postgres enum and explicitly "not a table". Seven is the count of Release 1
      Platform *entities*; six is the table count, and §3.7 records the divergence
      as deliberate. Built as six tables and one enum. Both the P01-T02 prompt and
      its resumption inherited "seven tables", so that done-when clause could not
      be met as worded.
      (2) §2 tabulates two helper functions. A third is structurally required:
      §3.3 restricts `membership` INSERT and UPDATE to owners, and a policy on
      `membership` cannot read `membership` — PostgreSQL raises "infinite
      recursion detected in policy for relation membership". Built as
      `is_current_tenant_owner()`, `security definer` and `stable` like the other
      two. Mechanism for an explicitly stated policy rather than a new rule, but
      §2's table does not list it and the stated count of two is now wrong.
      (3) `current_tenant_id()` is specified as "the `tenant_id` of the calling
      identity's active `membership`", while §3.2 permits a person to hold
      memberships in several tenants and `TENANCY_MODEL.md` §2 binds a session to
      exactly one membership at a time. No storage for that binding is specified
      and no rule is given for choosing among several. Built to return null when
      the caller holds more than one active membership, so the ambiguous case
      denies rather than silently serving the wrong tenant's rows. A
      session-to-membership binding must be specified before any member may hold
      two active memberships, or that member will be locked out by design.
      (4) `TENANCY_MODEL.md` §3 rule 1 says "Every `Tenant` has exactly one
      `Owner` at all times"; §3.3 says "At least one `active` `owner` per tenant".
      These are different constraints, and `TENANCY_MODEL.md` holds the higher
      precedence slot. Built as "at least one", per §3.3 and per the prompt's
      explicit instruction. The divergence is unsettled and the trigger will need
      replacing if "exactly one" wins.
      (5) §1.4 makes provenance universal — "every table, without exception" —
      and the column lists in §3.4 `operator` and §3.6 `activity_event` both omit
      it, with `granted_at`/`granted_by` and `occurred_at` standing in its place.
      §3.5 `consent_grant` carries provenance but deliberately no `archived_at`.
      Built to the per-table column lists, on the reading that the specific
      statement governs the general one and that adding a column is the error the
      prompt forbids outright.
      (6) §1.4 specifies `updated_at timestamptz not null default now()` and no
      maintenance trigger. Without one the column never changes after insert.
      Built exactly as specified, so `updated_at` is inert on all six tables
      today.
      (7) §5 rule 3 — "every tenant-scoped policy carries `WITH CHECK`, not only
      `USING`" — cannot hold literally for a read policy. PostgreSQL rejects
      `with check` on a `for select` policy, because a select produces no candidate
      row to check. Two shapes satisfy the intent: one `for all` policy per table
      carrying both clauses, or per-command policies where every clause that can
      legally exist does. `for all` was rejected because it covers DELETE, and §3.6
      requires `activity_event` to carry no DELETE policy at all — the absence is
      the immutability. Built as per-command policies: all six INSERT and UPDATE
      policies carry `WITH CHECK`, and the ten SELECT policies carry `USING` alone
      because no other form is legal. Counted from the live catalog, 16 policies in
      total. Rule 3 needs restating as "every policy with a write side", or it fails
      a literal reading against a correct schema.
      AMENDED (P01-T05-FIX) — "the next `DATA_MODEL.md` amendment" named no
      moment and none arrived, so the row had no reachable owner. The seven gaps
      are split by the phase that first needs each, and each is named.
      **P02 — Tenancy and access** owns five. (1) §3's lead sentence, "Seven
      tables for Release 1", against the six it enumerates — P02 is the phase
      that builds on exactly those tables. (2) §2's stated helper count of two
      against the three that exist, `is_current_tenant_owner()` being the
      unlisted third. (3) The session-to-membership binding behind
      `current_tenant_id()` returning null on more than one active membership:
      the same subject as CF-103's remainder, and a decision P02 must make
      **before** it writes a session, not after. (4) `TENANCY_MODEL.md` §3
      rule 1's "exactly one `Owner` at all times" against §3.3's "at least one
      active owner" — P02 ships provisioning and membership, so it is the phase
      that must pick one and replace the trigger if "exactly one" wins. (7) §5
      rule 3's "every tenant-scoped policy carries `WITH CHECK`", which cannot
      hold literally because PostgreSQL rejects `with check` on a `for select`
      policy — it binds every policy P02 writes, so P02 restates it or writes
      policies against a rule no correct schema can satisfy.
      **P03 — Brand and onboarding** owns two, and owns them because both bind
      when a table is next created rather than when one is next read. (5) §1.4's
      universal provenance — "every table, without exception" — against the
      column lists in §3.4 `operator` and §3.6 `activity_event` that omit it. (6)
      `updated_at` specified with no maintenance trigger and therefore inert on
      all six tables today. P03 is the first phase after P02 that creates new
      tables, and a universal rule that is already false of two tables will be
      false of every table added under it until it is settled.
      Owner: **P02 for gaps (1), (2), (3), (4) and (7); P03 for gaps (5) and
      (6)**, each at the entry checklist of its phase, so the amendment is made
      before the code that depends on it rather than after.
      AMENDED (P02-T01) — four of the seven gaps were closed by earlier tasks and
      this row was never amended to say so. Verified against the current document
      rather than against this row: (1) `DATA_MODEL.md` §3's lead reads "Six tables
      and four enums for Release 1"; (2) §2 reads "Four helper functions" and
      tabulates `is_current_tenant_owner()`; (5) §1's departures table names
      `operator`, `activity_event` and `consent_grant` with reasons; (7) §5 rule 3
      reads "Every policy with a write side — INSERT, UPDATE, or ALL". Gaps (1),
      (2), (5) and (7) are CLOSED. Gap (3) is resolved at the decision level by
      OD-G14; its implementation is owed by the P02 task that writes session
      resolution. Gap (4) is resolved by OD-G15 and by this task's amendment to
      `TENANCY_MODEL.md` §3 rule 1. **Gap (6) alone remains open** — `updated_at`
      is specified with no maintenance trigger and is inert on all six tables; the
      schema carries exactly one trigger and it is
      `membership_active_owner_required`. Owner: **P03**, at its entry checklist,
      being the first phase that creates new tables under the rule.
- [ ] CF-94 — `check-no-runtime-cdn` and `check-no-hardcoded-literals` scan `app/`
      and `proxy.ts` only, which was the whole of the application source when
      P01-T01 authored them. `lib/` exists as of P01-T02-RESUME and is not
      scanned; `features/` and `components/` will not be either when they arrive.
      A hex colour or an external `<script>` under `lib/` passes both guards
      today. The two guards landed at P01-T02-RESUME — `check-service-import` and
      `check-data-boundary` — already scan the wider root set and name the roots
      that do not yet exist in their own output. Owner: the next task that touches
      either guard, at the latest the Phase 02 entry checklist.
      AMENDED (P01-T05-FIX) — split by the phase that first needs each root, as
      CF-93. This task touched neither guard, so the "next task that touches
      either" clause did not fire here and the row's owner is now named by root.
      **The P02 entry checklist** owns `lib/`, which exists today and is scanned
      by neither guard — a hex colour or an external `<script>` under
      `lib/supabase/` passes both right now. **The task that creates a root owns
      adding it**: `components/ui` and `components/shared` arrive with the
      design-surface catalog task, landed after the P01 shell and before P03
      composes pages (`BUILD_PHASES.md`, "The design surface"), and `features/`
      arrives at P03. Each root is added to both scanners by the task that
      creates it, or it ships unscanned — which is exactly how `lib/` reached
      this state, and why naming one future owner for all three roots would
      reproduce it.
      Owner: **the P02 entry checklist for `lib/`; the task that creates each of
      `components/` and `features/` for those roots.**
- [x] CF-95 — The deployment and drift pipeline is wired but not live, and both
      remaining steps are owner actions rather than builder work.
      (1) `vercel git connect` failed against the repository: the Vercel GitHub
      App is not authorised on it, so the project exists and is linked locally but
      no push deploys anything.
      (2) The `types-drift` job requires repository secrets
      `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_ID`. `gh secret list` returned
      empty, so the job fails on every run until both are set. That red is the
      specified behaviour of the job, not a defect in it — a job that skipped
      instead would be the defect ARCHITECTURE.md §5 names. The access token must
      be minted by the owner; it is a credential and was never requested here.
      Owner: the owner, before the Phase 01 exit gate.
      OBSERVED (P01-T02, commit `f29c0d9`). The behaviour is confirmed in the
      pipeline rather than only in the YAML: `docs-integrity` concluded **success**;
      `ci` concluded **failure**, with `install`, `lint`, `typecheck`, `unit` and
      `guards` all success — all four guard steps green in-pipeline — `types-drift`
      failing at its first step, `Require the drift secrets`, and `build`
      **skipped** as its consequence. Two consequences the reviewer should hold
      deliberately rather than discover: `ci` is red on every push to this branch
      until the secrets are set, T03's included, and `build` is not exercised in CI
      while that is true, though it passes locally. Both follow from D4's explicit
      choice of a loud failure over a silent skip.
      AMENDED (P01-T04) — **half of (2) is done and the row is not closed here,
      because the closing evidence is a green run nobody has seen yet.** The
      owner set both secrets and CF-108 records the name collision that kept
      `types-drift` red even once the value was present. What is left of this row
      is (1), the Vercel GitHub App authorisation, and the confirmation that
      `types-drift` now concludes success. Until that run exists, the pipeline is
      still wired-but-unproven, which is what CF-95 says.
      CF-95 — CLOSED (P01-T05-FIX). Both remaining halves are done, and both are
      proven by a run rather than by a setting. **(1) The Vercel GitHub App is
      authorised.** Commits `c08fb1b` and `057ae11` each carry a `Vercel` commit
      status of `success`, description "Deployment has completed", with a
      combined commit state of `success`. **(2) `types-drift` concludes
      success.** On `c08fb1b` in CI runs 30812893866 and 30812896168, and on the
      gate commit `057ae11` in runs 30816883543 and 30816886716. On all four
      runs every one of the seven `ci` jobs concluded success — `install`,
      `lint`, `typecheck`, `unit`, `guards`, `types-drift` and `build`. `build`
      matters here: it was skipped for as long as `types-drift` failed, so its
      green discharges the second consequence this row asked the reviewer to
      hold deliberately. The pipeline is no longer wired-but-unproven, which was
      the whole of the claim.
- [x] CF-96 — `docs/method/REVIEWER_CHAT_INSTRUCTIONS.md` sits untracked in the
      working tree. PR-14 requires a reviewer-authored document to stage outside
      the working tree and to enter the repository only by a land task, to its
      final path; an untracked draft inside the tree is the CF-53 duplication risk
      in a new place. It is not byte-identical to
      `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`, so it is a distinct document
      rather than a copy of a committed one. P01-T02-RESUME did not touch it: no
      prompt has authorised landing it and it is outside the task's scope. Owner:
      the owner, to land it or remove it.
      CF-96 — CLOSED (P01-T04). The owner authorised landing it as his own
      reference copy and it is committed at `docs/method/REVIEWER_CHAT_INSTRUCTIONS.md`
      with its content unchanged. One blockquote was prepended and nothing else:
      it names the file as the owner's working reference, points at `AGENTS.md`
      for the builder surface and at `CLAUDE_PROJECT_INSTRUCTIONS.md` for the
      pivot record, and states that where they differ this file is live for the
      reviewer surface only. That header is what stops the file from becoming the
      CF-53 duplication risk again — the risk was never the third copy, it was
      three documents with no stated difference between them. CF-53 amended in
      the same task to record the settlement.
- [ ] CF-97 — The credential scanner failed on the one construction ADR-005
      requires. `check_credentials.py`'s assignment pattern matched
      `serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY` in
      `lib/supabase/server-only/service.ts`: an environment-variable name is a
      37-character token by shape, so reading the key from the environment — the
      prescribed safe form — looks identical to assigning one. No secret was
      present. Fourth instance of the CF-87 / CF-88 / CF-89 class, a text rule that
      cannot separate a leak from the documentation or the safe handling of one,
      and the first to fire on code rather than prose. Repaired in place rather
      than halted, because the shape rule is right and only its value side was
      wrong: the pattern now rejects `process.env`, `import.meta.env`, `Deno.env`,
      `os.environ` and `os.getenv` on the value side and is otherwise unchanged.
      The exclusion sits before the optional quote, so a quoted value is still
      matched. Re-proven by a synthetic self-test — bare, quoted and JSON-shaped
      fakes all still fail, the benign policy sentence still passes — and the
      fixture deleted. The rejected alternative was renaming the variable, which
      leaves the false positive live for the next legitimate reader of that
      environment name. Owner: reviewer, to ratify the narrowing or reject it.
- [x] CF-98 — Four open Dependabot alerts on the default branch, unrecorded since
      alerts were enabled at G3-CLOSE and surfaced by the P01-T02 push, which
      printed them on the remote's response. All four are transitive runtime
      dependencies resolved in `package-lock.json` and declared in no
      `package.json`: `postcss` three times — path traversal via
      `sourceMappingURL` disclosing arbitrary `.map` files (high, first patched
      8.5.18), arbitrary file read by the same route (high, 8.5.12), and XSS via an
      unescaped `</style>` in stringify output (medium, 8.5.10) — and `sharp` once,
      inheriting four libvips CVEs (high, 0.35.0). Both reach the tree through
      Next.js. Not fixed here: a version bump is a dependency change, AGENTS.md
      requires stopping and flagging before one, and this task authorises no
      dependency work. Recorded rather than acted on, per the instruction to report
      a new finding as a row. Owner: the owner, to authorise a dependency-bump
      task; at the latest the Phase 01 exit gate, since the alerts predate this
      branch and will not clear themselves.
      AMENDED (P01-T05-FIX) — **re-derived and deliberately LEFT OPEN, because
      the advisories are not closed.** The owner named the Phase 01 exit gate at
      the latest, and that gate has now run, so the owner is retargeted; the
      finding itself is unchanged in every particular. All four alerts are still
      open, enumerated from the repository's Dependabot alerts endpoint rather
      than restated from this row: **#4** `postcss` high — path traversal via
      `sourceMappingURL`, vulnerable `<= 8.5.17`, first patched 8.5.18; **#3**
      `postcss` high — arbitrary file read by the same route, vulnerable
      `<= 8.5.11`, first patched 8.5.12; **#2** `sharp` high — inherited libvips
      CVEs, vulnerable `< 0.35.0`, first patched 0.35.0; **#1** `postcss` medium
      — XSS via an unescaped `</style>` in stringify output, vulnerable
      `< 8.5.10`, first patched 8.5.10. Three high and one medium, all runtime
      scope, all resolved in `package-lock.json` and declared in no
      `package.json`, exactly as recorded.
      `npm audit` locally reports the same packages and offers `next@9.3.3` as
      the available fix — a semver-major **downgrade** of the framework, which is
      not a fix and is recorded so the next task does not take it. The remedy is
      to raise the transitive resolutions, which PR-25 already authorises as
      maintenance rather than as a new dependency. What this needs is a task and
      a green pipeline, not an authorisation. Owner: **the P02 entry checklist**,
      as the first bookkeeping act of the phase.
      AMENDED (P01-GATE-RERUN) — accepted risk, not a blocker. Three high and one
      medium, all transitive through Next.js. The only remediation `npm audit`
      offers is a semver-major framework downgrade, which is a regression rather
      than a fix. The row stays open, is re-derived at every phase exit gate, and
      closes when an upstream patch exists. Owner: every phase exit gate until
      then.
      **Re-derived at this gate, 2026-08-03, and one half of the closure
      condition is already met.** `npm audit` reports 3 high / 0 moderate as a
      package rollup over `next`, `postcss` and `sharp`; the same run's advisory
      list is 3 high and 1 moderate — `postcss` twice high and once moderate,
      `sharp` once high — which is the count above, measured per advisory rather
      than per package. Both numbers are recorded so a later gate comparing
      against this row is not misled by the unit. `fixAvailable` on all three
      packages is `next@9.3.3, isSemVerMajor: true`, so the ruling's "only
      remediation" clause is confirmed exactly.
      **The patched versions now exist upstream.** `postcss@8.5.25` and
      `sharp@0.35.3` are published and clear every advisory in this row. What is
      not published is a Next.js release that consumes them: `next@16.2.12` is
      both the installed and the latest version, and it pins `postcss@8.4.31` and
      `sharp@0.34.5` in this lockfile. A non-regressive remediation therefore
      does exist — raising the two transitive resolutions, which PR-25 already
      authorises as maintenance — and it is not one `npm audit` will offer,
      because `npm audit` only proposes changes to declared dependencies. The
      gate does not take it: this task authorises no dependency work. Recorded so
      the next task knows the remedy is a resolution bump and not a wait.
      CF-98 — CLOSED (P01-T06-FIX), on the remedy the gate identified and could
      not take. Two `overrides` entries raise the transitive pins to the
      published patched versions: `postcss` `8.4.31` → `8.5.25` and `sharp`
      `0.34.5` → `0.35.3`. Both are the latest published release of their
      package. This is maintenance under PR-25 and not a new dependency: neither
      package is added, both were already in the tree, and `package.json`'s
      `dependencies` and `devDependencies` are untouched.
      **Before**: `npm audit` reports `3 high severity vulnerabilities` at exit
      1 — `postcss <=8.5.22` carrying all four advisories in this row, and
      `sharp <0.35.0` carrying the libvips CVEs — with `fix available via npm
      audit fix --force` offering `next@16.3.0`, "outside the stated dependency
      range". `npm ls` shows `next@16.2.12 → postcss@8.4.31` and
      `vitest → vite@8.2.0 → postcss@8.5.25`, and `next@16.2.12 → sharp@0.34.5`.
      **After**: `npm audit` reports `found 0 vulnerabilities` at exit 0. `npm
      ls` shows `next@16.2.12 → postcss@8.5.25 overridden` with the vite path
      deduped onto it, and `next@16.2.12 → sharp@0.35.3 overridden`.
      **The whole pipeline stays green** on the bumped tree, run locally in
      `ci.yml`'s own order: `npm install` exit 0 removing 1 and changing 3
      packages over 388 audited; `lint` exit 0 (the one pre-existing warning in
      the archived backup script, 0 errors); `typecheck` exit 0; `npm test` 2
      passed; all five guards OK; `npm run build` exit 0, compiled in 1525 ms,
      4 of 4 static pages generated for `/en` and `/ar`. Local Node is 22 and
      CI pins 24, so the pipeline's own conclusion remains authoritative.
      The row's owner — "every phase exit gate until an upstream Next.js release
      consumes them" — is discharged rather than retargeted: there is nothing
      left to re-derive. `package.json` carries a comment naming CF-98 and PR-25
      beside the overrides, so the day an upstream release consumes them, the
      reason they exist is next to them.
- [x] CF-99 — A pull request exists on `phase/01-foundation` that the task
      forbade, and it is not the builder's. P01-T02's done-when says "No pull
      request — T03 runs the isolation proof on this branch first, and the phase
      gate follows it." No `gh pr create` was issued by this task. PR #2, base
      `main` from `phase/01-foundation`, was opened by the `Jovo-Jovi` account at
      2026-08-02T11:54:45Z, four minutes after the deliverable push at 11:50:44Z,
      with the commit subject truncated to an ellipsis as its title and body — the
      signature of GitHub's "Compare & pull request" banner rather than of a
      deliberate authoring. It is left open and untouched: closing it would revert
      an owner action on the owner's own repository, and the builder does not do
      that unilaterally. **The risk is merging it.** Doing so before T03 puts the
      tenancy schema and every data-access path on `main` before anything has
      proven that tenant A cannot read tenant B, which is the one acceptance
      standard `AGENTS.md` §4 marks not waivable by OD. It would also carry a red
      pipeline onto `main`, since `ci` fails at `types-drift` until CF-95's secrets
      are set, and it would pre-empt `BRANCHING.md` §3's one consolidated PR per
      phase at the exit gate — the §3.1 foundation exception covered the toolchain
      task only and explicitly does not cover schema or data access. Owner: the
      owner, to leave it open until T03 and the phase gate have both passed, or to
      close it and re-open at the gate.
      AMENDED (P01-T03). Two facts, neither of which changes the owner action.
      The P01-T03 prompt says "do not un-draft PR #2", which presumes it is a
      draft; it is not, and the API shows no record of it ever having been one.
      `state: OPEN`, `isDraft: false`, `mergeable: MERGEABLE` as read at the T03
      push. Nothing was un-drafted because there was nothing to un-draft, and the
      instruction was honoured by touching the pull request not at all. The
      practical effect is that the one guard rail the instruction assumed is
      absent: PR #2 is mergeable now, by one click, with no draft state to clear
      first. Second, T03 removes the sharpest of the three reasons above —
      isolation is proven, 21 assertions, 0 FAIL — while the other two stand
      unchanged: `ci` is still red at `types-drift` until CF-95's secrets are
      set, and `BRANCHING.md` §3 still wants one consolidated PR at the phase
      exit gate.
      CLOSED (P02-T01) — the owner merged PR #2 at `eda0f45`, which is the decision
      this row waited for. `phase/01-foundation` is deleted locally and on origin on
      verified containment: `git log main..f061489` returns 0 commits, f061489 is an
      ancestor of `main`, and `git ls-remote` returns refs/heads/main with no phase
      head.
- [x] CF-100 — `DATA_MODEL.md` §3 stated "Seven tables for Release 1" while §3.7
      declares `role` an enum and explicitly not a table. The document's stated
      count contradicted its own enumeration, in the document that defines the
      schema, and the P01-T02 prompt repeated the error. Same class as CF-54, and
      the exact subject of PR-15. The builder built six tables and one enum and
      flagged the contradiction rather than resolving it. Owner: reviewer.
      Opened by P01-T03, which found the row absent: the P01-T02 verdict that
      logged it never ran, which is the PR-24 case exactly. Previously recorded
      only as gap (1) of CF-93's seven.
      CF-100 — CLOSED (P01-T03). §3 corrected to six tables and one enum.
- [x] CF-101 — `DATA_MODEL.md` §5 rule 3 required `WITH CHECK` on every
      tenant-scoped policy. PostgreSQL rejects `WITH CHECK` on a `FOR SELECT`
      policy, so the criterion was unsatisfiable for ten of sixteen policies. An
      unsatisfiable gate criterion is worse than a missing one: it forces the
      honest builder to halt indefinitely or quietly reinterpret. The builder
      reinterpreted on the narrowest reading and said so explicitly, which is the
      correct handling of a defective specification. Owner: reviewer.
      Opened by P01-T03, which found the row absent. Previously recorded only as
      gap (7) of CF-93's seven.
      CF-101 — CLOSED (P01-T03). Rule 3 now scopes to policies with a write side
      and states why read policies carry `USING` alone. Verified against the live
      catalog by proof 3: 16 policies, 3 INSERT and 3 UPDATE carrying
      `with_check`, 10 SELECT carrying `qual` alone, zero exceptions.
- [x] CF-102 — Local development runs Node 22 while `ci.yml` pins Node 24, so
      "verified locally before committing" is evidence from a different major
      version than the pipeline. Not a defect — both were green — but it weakens
      every local verification claim by an unmeasured amount. Owner: this task.
      Opened by P01-T03, which found the row absent; recorded until now only as a
      PRECEDENTS.md §2 environment quirk, which is a note rather than a tracked
      obligation.
      CF-102 — CLOSED (P01-T03). An `.nvmrc` and a `package.json` `engines` field
      pin local development to the pipeline's major version.
- [ ] CF-103 — A tenant owner can lock a member of another tenant out of that
      other tenant, through the ordinary API, using only that member's `member.id`.
      Found by P01-T03 proof 17, against the live policies.
      `membership_insert_owner`'s `WITH CHECK` constrains `tenant_id` and the
      caller's role and says nothing about `member_id`, so tenant A's owner may
      insert an `active` membership binding tenant B's member into tenant A. That
      member then holds two active memberships, `current_tenant_id()` returns null
      by design, and they read nothing from either tenant. Proven end to end:
      the insert was accepted, the victim's reads fell from 2 rows to 0, and rose
      to 2 again when the row was removed.
      **This is not a breach of `SECURITY_MODEL.md` §1** and proof 4 is unaffected:
      nothing of tenant B is read, inferred or modified, and the row created lives
      in tenant A. It is a cross-tenant *availability* effect, which §1's three
      parts — read, existence, modify — do not cover. Recorded rather than fixed,
      per this task's instruction that a gate does not repair what it finds.
      CF-93 gap (3) already records the lockout as a specification gap; what it
      does not record is that another tenant can cause it. Exploitation needs the
      victim's uuid, which no policy discloses across tenants, so the practical
      reach is a member whose id is known out of band. Owner: the
      session-to-membership binding decision named in CF-93 gap (3), which must
      also decide whether `membership_insert_owner` constrains `member_id`.
      AMENDED (P01-T04) — **the exploit is closed and re-tested; the row stays
      open for the half that is not an exploit.**
      Closed: an owner may invite anyone and may never make anyone active.
      `membership_insert_owner` now requires `status = 'invited'`;
      `membership_accept_invitation` lets the invitee, and only the invitee, move
      their own row `invited` → `active`; and a RESTRICTIVE policy,
      `membership_active_is_self_only`, states the rule once for the table rather
      than for a policy — no UPDATE may leave an unarchived `active` membership
      belonging to anyone but the caller. The restrictive form is deliberate:
      fixing only `membership_update_owner` would have left the exploit alive in
      one more move for the next UPDATE policy anyone adds. Two SELECT policies
      were needed to make acceptance reachable at all; see PRECEDENTS, P01-T04,
      on PostgreSQL applying SELECT policies to both the old and the new row of
      an UPDATE. `DATA_MODEL.md` §3.3 carries the rule and `SECURITY_MODEL.md` §1
      carries the fourth guarantee, availability, which the three original parts
      did not cover.
      Re-tested rather than asserted: proof 19 re-runs the original attack and
      asserts what the victim keeps — the tenant their session resolves to and
      every own-tenant row they read, unchanged before, during and after, while
      every `active` and `suspended` insert naming them is refused 42501. The one
      row the attacker may still create is an `invited` one, which the victim can
      see and which confers nothing.
      **Still open, and it is not the exploit.** `current_tenant_id()` returns
      null for anyone holding more than one active membership, which contradicts
      `DOMAIN_MODEL.md` §5.1, so a person who accepts a second invitation locks
      *themselves* out by their own action. That is the session-to-membership
      binding and it needs auth. Proof 17 pins the current fail-closed behaviour
      so the change is visible when it is made. Owner retargeted: **P02, with
      authentication** — no longer CF-93 gap (3) alone, and no longer anything to
      do with `membership_insert_owner`, which is settled.
      AMENDED (P02-T01) — the remainder is resolved at the decision level by OD-G14.
      One active membership resolves implicitly, more than one requires an explicit
      held selection, and anything else resolves null, so
      `current_tenant_id()` no longer fails closed by absence of a rule.
      `membership_active_is_self_only` and the invite-then-accept rule STAY, on the
      restated ground that forcing a `Membership` onto another person is a write
      against their identity — sufficient independent of the lockout. What remains
      open is implementation and proof. Owner: **the P02 task that writes session
      resolution**, closing on the isolation suite asserting a member with two
      active memberships resolving to the selected tenant and to nothing else, an
      unheld selection resolving null, and `SECURITY_MODEL.md` §1's availability
      property re-proven with the second membership present.
- [x] CF-104 — `DATA_MODEL.md` §2 narrows operator reach to "`tenant`,
      `subscription` and `activity_event` **metadata columns only**", and no
      column-level narrowing exists. Found by P01-T03 proof 7, against the live
      policies. `tenant_select_operator`, `activity_event_select_operator` and
      `consent_grant_select_operator` are row-level, so an operator reads every
      column of all three tables for every tenant, including
      `activity_event.payload`, and with no `consent_grant` required. The schema
      follows §3.1, §3.5 and §3.6, which specify exactly these row-level reads, so
      this is §2 contradicting §3 rather than a build defect, and §3 is what was
      built. `activity_event.payload` is separately bounded by §3.6 to "no
      credential, no full row copy, no PII beyond ids", so the exposure today is
      bounded by that rule alone rather than by a policy. Owner: reviewer, at the
      next `DATA_MODEL.md` amendment — either narrow §2's wording to match §3, or
      specify the column-level mechanism §2 implies.
      CF-104 — CLOSED (P01-T04). §2 now states the operator rule once, in two
      classes, and §3.5 and §3.6 reference it instead of restating it.
      **Account metadata** — `tenant` and `consent_grant`. Unconditional operator
      SELECT, no grant, no log. An operator who cannot read the consent record
      cannot tell whether the access they hold is live.
      **Tenant business data** — `activity_event`, and every later tier's tables
      after it. No operator policy on the table at all;
      `activity_event_select_operator` is dropped. The only reach is
      `operator_read_activity_event(uuid)`, which refuses a caller who is not an
      operator, refuses one with no live `consent_grant` — `revoked_at is null`
      and `now() < expires_at`, evaluated per call — writes an `activity_event`
      naming the operator before it returns anything, and does not have `payload`
      in its return type.
      B1 asked for the consent test in the policy and B2 for the `payload`
      exclusion by column grant. Neither is expressible at this granularity and
      both are met by the function instead. A policy cannot log: PostgREST runs
      GET in a READ ONLY transaction, so an audit insert inside a read policy
      would abort the read it was auditing. A column grant cannot separate an
      operator from a member: both arrive as `authenticated`, privileges are
      role-scoped, and revoking `payload` from that role would take it from the
      tenant's own audit trail, which §7 gives them in full. Excluding it from
      the operator alone is a projection, and a projection needs a function. The
      deviation is the mechanism only; both properties are now structural rather
      than promised, because there is no other path.
      Proven by proofs 20a, 20b and 21: seven refusals with no live grant and
      nothing logged for any of them, one success that wrote exactly one event
      with `actor_operator_id` set, and `payload` absent by all three direct
      shapes and by the declared path.
- [x] CF-105 — `EXECUTE` on `public` functions is granted to `PUBLIC` by default
      and the grants migration's blanket revoke covers tables only, so every
      function in `public` is a callable PostgREST RPC endpoint for `anon`. Found
      by P01-T03 proof 15. All four functions present today are safe and were
      proven so by query: `current_tenant_id()`, `is_operator()` and
      `is_current_tenant_owner()` answer only for `auth.uid()` and returned
      null/false/false to an unauthenticated caller and each caller's own tenant
      to the others, and `enforce_tenant_active_owner()` returns `trigger` and so
      cannot be invoked directly. The finding is the default, not today's surface:
      the next `security definer` function added to `public` is exposed to `anon`
      unless its migration revokes `execute` explicitly, and the existing revoke
      does not cover it. Owner: the next migration that adds a function to
      `public`; at the latest the Phase 02 entry checklist, alongside CF-94.
      CF-105 — CLOSED (P01-T04). `revoke execute on all functions in schema
      public` from `public`, `anon`, `authenticated` and `service_role`, then an
      explicit grant per function. The first attempt revoked `public` and `anon`
      only, as the task worded it, and left `authenticated` and `service_role`
      holding EXECUTE on everything — Supabase issues those two as default
      privileges of their own, so revoking the `PUBLIC` default removes a default
      that was never what carried them. Caught by proof 22 before the commit and
      re-applied through `migration repair --status reverted` and a fresh push,
      so ADR-006's single-applier rule holds.
      **Six functions, not the five the task expected.** Four existed; CF-104's
      fix added `has_live_consent_grant(uuid)` and
      `operator_read_activity_event(uuid)`. Each ACL is asserted exactly by proof
      22: the three tenancy helpers, the consent predicate and the operator read
      path hold `[authenticated, postgres]`, because a policy expression runs
      with the caller's privileges and every policy here is `to authenticated`.
      `enforce_tenant_active_owner()` holds `[postgres]` alone and is the one
      function no caller should invoke — a trigger function's EXECUTE is checked
      when the trigger is created, never when it fires, so the constraint keeps
      working while the RPC endpoint stops existing. Over the wire `anon` gets
      401 on all six and both the operator and a tenant owner get 404 on the
      trigger function. `service_role` receives no grant: it bypasses RLS,
      evaluates none of these policies, and a privilege with no reader is
      exposure with no purpose.
      The obligation the finding named survives closure and is now stated in the
      migration itself: any later migration adding a function to `public` repeats
      the revoke and states its own grant, or the function ships publicly
      callable.
- [x] CF-106 — `@types/node` is pinned to major 20 while the toolchain now
      declares Node 24, so `typecheck` validates against a standard library four
      majors behind the one the code runs on. Found by P01-T03 while landing
      CF-102's closure: the `engines` field and `.nvmrc` fix the runtime skew and
      leave the type skew untouched, which would make CF-102 read closed while
      half the version mismatch survives. Nothing is known to be broken —
      `tsc --noEmit` is clean and the isolation harness's Node built-ins and
      global `fetch` all resolve — but a Node 24 API is currently a type error
      and a Node 20 API removed since is currently not, in both directions
      silently. PR-25 does not cover the bump: it is an alignment, not a
      published advisory, so it stops and flags rather than being done here.
      Owner: the next task authorised to change a dependency; naturally CF-98's,
      which already owes a `package.json` change.
      CF-106 — CLOSED (P01-T04), authorised by this task's C2 as maintenance
      under PR-25 rather than as a new dependency. `package.json` moves
      `@types/node` from `^20` to `^24` and `npm ls @types/node` resolves
      `@types/node@24.13.3`, deduped everywhere it appears. `tsc --noEmit` is
      clean on the new major and so is `eslint`, so nothing in the tree depended
      on a Node 20 declaration.
      **Residue, noticed while proving this and not part of the finding.** The
      local runtime is `node v22.12.0` while `.nvmrc` and `engines` pin 24 and
      `ci.yml` runs 24. CF-102 closed on the pin existing, and a pin that the
      shell does not honour is a pin nobody applies: `npm install` did not object,
      so `engine-strict` is off. Types now match CI and the declared runtime,
      which is what CF-106 asked for, but a local green remains evidence from a
      third version. Owner: the owner, to switch the shell to 24 or to say the
      skew is accepted; at the latest the Phase 01 exit gate, where CF-102's
      closure is re-read.
- [x] CF-107 — Every commit on this repository was authored with the literal
      placeholder `your.email@example.com`. A committed template placeholder,
      the same class as CF-80 one level down in the toolchain: git configuration
      rather than document content. It left every commit unattributed and caused
      Vercel to refuse the deployment, since the address matches no GitHub
      account. Owner: owner action.
      CF-107 — CLOSED (P01-T04). The owner set a GitHub no-reply address, which
      resolves to his account without putting a real email into a public
      repository's permanent history — the same consideration CF-14 records for
      his name. **Residue: commits before this change keep the placeholder and
      history is not rewritten.** New commits are correctly attributed.
- [x] CF-108 — The Supabase project identifier was held under two names:
      `ci.yml` read `SUPABASE_PROJECT_ID` while the repository secret was
      `SUPABASE_PROJECT_REF`, so `types-drift` failed at its require step with
      the value present under a name nothing read. Two names for one value is
      the collision class `GLOSSARY.md` exists to prevent, reaching CI
      configuration where no glossary was being applied. Owner: owner action.
      CF-108 — CLOSED (P01-T04). One name, `SUPABASE_PROJECT_ID`. The access
      token was separately absent and has been added. `SUPABASE_SERVICE_ROLE_KEY`
      was removed from repository secrets — no CI job needs it, and on a public
      repository every secret is reachable by any workflow file, so it was
      exposure with no reader. It remains in Vercel, production target only.
- [ ] CF-109 — The isolation suite runs by `npm run test:isolation` and is
      deliberately outside `npm test`, so no CI job executes it. That was
      originally forced by absent secrets; the secrets now exist and the decision
      stands anyway, on a different ground. Under ADR-012 there is one Supabase
      environment, so a per-push isolation job would seed and tear down against
      production on every commit — precisely what ADR-012's compensating controls
      guard against. The suite therefore remains a gate run deliberately by a
      heavyweight task, not a per-push check. **Consequence to hold consciously:
      an isolation regression introduced between gates is not caught until the
      next gate.** Owner: CF-92's reinstatement trigger — when staging exists,
      the suite becomes a required CI job on any schema-touching pull request.
- [x] CF-110 — P01-T03 verified `supabase/schema.sql` and the concatenated
      migrations byte-identical at 18,495 characters. After P01-T04 they are
      whitespace-normalised identical with ten blank lines differing at file
      boundaries. The content is unchanged and no statement differs, but the
      fidelity standard drifted between two tasks under the same rule. ADR-006
      says migrations are split "verbatim"; a word that means byte-identical in
      one task and whitespace-equivalent in the next is not a rule anyone can
      enforce. Owner: P01-GATE.
      CF-110 — CLOSED (P01-GATE). ADR-006's "verbatim" is stated to mean
      whitespace-normalised identical, so a trailing newline at a file boundary
      is not a divergence and a changed statement is. The docs-integrity workflow
      gains a check asserting it on every push, which makes the standard
      mechanical rather than a matter of which task last measured it.
      **Gate re-measurement, appended rather than rewriting the claim above.**
      The row's substance is confirmed and one number in it is not. Re-derived
      at `f3bbf7b`: the T03 schema body from its first marker and the seven
      concatenated migrations were both **18,496** characters and byte-identical
      — one more than the 18,495 stated. At `c08fb1b` the body is 33,765
      characters against 33,755 concatenated, a delta of exactly ten blank lines
      across the five file boundaries P01-T04 introduced, and whitespace-
      normalised identical at 705 non-blank lines on each side. The cause is
      visible in the split itself: the seven T02 files each carry the two blank
      lines that precede the next marker, and the five T04 files do not.
      `scripts/check_migration_split.py` is the mechanism this row buys, wired
      into `docs-integrity` and green at the closing commit.
- [x] CF-111 — The P01 exit gate failed on five criteria. Two were hard failures:
      `check-enum-keys` and the HTML-injection lint rule were both absent while
      their targets existed, the second proven by a probe component piping a route
      parameter into `dangerouslySetInnerHTML` and linting clean at exit 0. Three
      were documentation: `MODULE_SPEC.md` §1 named `lib/i18n/` where the App
      Router places dictionaries, four `rolbypassrls` roles appeared in no
      document, and eleven ledger rows named an owner already passed. Owner:
      P01-T05-FIX.
      CF-111 — CLOSED (P01-T05-FIX). Both guards landed and proven by planted
      violation. `MODULE_SPEC.md` follows the code. `SECURITY_MODEL.md` carries a
      bypass inventory that every phase gate re-derives. Eleven rows retargeted
      and `check_ledger.py` now fails on an unreachable owner, which is why CF-82
      recurred as this gate's D1 — the check asked whether an owner existed and
      never whether it pointed anywhere.
      **Two corrections to the closing text above, appended per PR-07 rather than
      written over it.** (1) **Twelve rows, not eleven.** The reachable-owner
      assertion, run against the ledger as the gate left it, fires on ten rows —
      CF-01, CF-11, CF-50, CF-54, CF-56, CF-60, CF-72, CF-75, CF-95 and CF-98.
      Nine are among the gate's eleven; **CF-54 is not**, and its owner
      "reviewer, verify at Gate 3" is the same defect. It is retargeted here and
      declared, because a check landing red on the commit that introduces it is
      not a check. The gate's other two — CF-39 and CF-46 — name no gate or phase
      at all and so are unreachable in a way no mechanism catches; CF-93 and
      CF-94 are the same. That is the honest boundary of what D3 buys: it catches
      an owner pointing at a moment that has gone, not an owner pointing nowhere.
      (2) **CF-98 is left OPEN, not closed.** Its four Dependabot advisories are
      re-derived unchanged at 3 high and 1 medium, so the D2 instruction's own
      condition — leave it open if any advisory is still open — applies. CF-95 is
      closed.
- [x] CF-112 — Four of the thirteen (check, premise) pairs in this repository
      report success over an empty scan set, which is PR-21's exact shape
      produced by the check itself rather than by a report. Found at the second
      P01 exit gate by a probe that removed each check's target and ran it, not
      by reading any of them. `check-no-runtime-cdn` says `OK: no runtime CDN
      reference in 0 file(s)` with `app/` and `proxy.ts` gone;
      `check-no-hardcoded-literals` says `OK: no hardcoded literal in 0 file(s)
      scanned` on the same removal; `check-service-import` says `OK: 0 file(s)
      scanned under []` with all three scan roots gone, though it correctly
      fails when the quarantine itself is removed; `check_credentials` says
      `OK: scanned 0 file(s)` wherever `git ls-files` returns nothing. Each
      prints its count, so a human reading the log would see the zero — and each
      exits 0, so CI would not. Owner: P01-T06-FIX.
      CF-112 — CLOSED (P01-T06-FIX). Every one of the thirteen cases now errors
      on an empty premise, verified by re-running the same sandbox: the four
      named above plus the nine that already errored, none of which regressed.
      Each of the four asserts a minimum non-zero scanned count and names the
      empty or absent root in its failure message. `check_credentials` gained a
      second correction on the way: an empty CI diff now widens to a whole-tree
      scan instead of reporting a clean zero, because an empty diff is an absent
      scope rather than an empty scan set. PR-27 is landed.
      **A fifth was found here and is closed with them.** The audit of the
      remaining nine, run as cases rather than as a reading, showed
      `check_ledger` printing `OK: 0 open ids reconcile id-for-id … 0 owner(s)
      checked` at exit 0 when every open row is removed. The gate's own sandbox
      missed it because its case deleted the ledger file, which raises, rather
      than emptying the row set, which did not. Its floor is deliberately on
      rows of **either** kind and not on open ones: closing the last
      carry-forward is a legitimate end state and must not turn CI red, while a
      ledger holding no row at all means the file has moved or the row syntax
      has changed out from under both patterns. A control case asserts exactly
      that — 96 rows all closed, open-id list emptied, still green.
      `check_stated_counts` was also failing only by traceback on a missing
      target and now names the target and counts what it examined.
- [x] CF-113 — `SECURITY_MODEL.md` §11's first standing re-derivation, at the
      second P01 exit gate, found six live bypass mechanisms the document does
      not name — three `security definer` functions outside `public`
      (`vault.create_secret`, `vault.update_secret`, `pgbouncer.get_auth`) and
      three role paths into a bypass role (`cli_login_postgres → postgres`,
      `supabase_storage_admin → service_role`, `supabase_realtime_admin →
      service_role`). None is reachable from an API-facing role by direct
      privilege, so this is a documentation gap rather than a hole — and §11.5
      makes it a hard failure regardless, not waivable by OD, on §1's ground
      that an undocumented bypass is one nobody is watching. Owner: P01-T06-FIX.
      CF-113 — CLOSED (P01-T06-FIX). **The ambiguity was the reviewer's, and the
      remedy is structural rather than a longer list.** §11.2 read "Six exist,
      all in schema `public`" — a claim about the objects this project created,
      written as a claim about the whole catalog, which holds nine. A
      re-derivation reads the catalog and cannot make a distinction the sentence
      only assumed. §11 is now two tiers. §11a is B2S-owned and each entry is
      individually justified; an object there the project did not deliberately
      create is a hard failure. **§11b is platform-owned and its requirement is
      enumeration and change detection, not justification**: each entry states
      owner, schema and measured reachability, an unchanged platform object is
      not a failure, and an unlisted one is. Justifying `pgbouncer.get_auth` is
      not this project's to do; noticing the day it changes is.
      **The re-derivation at closure exceeded the gate's own findings in two
      places, both recorded in §11 rather than softened.** (1) The gate measured
      the three platform functions on schema `USAGE` and `EXECUTE` alone and
      recorded them unreachable by all three API roles. Measured a third way —
      reachable-by-`SET ROLE` — `authenticator` reaches both `vault` functions
      through `service_role`, which holds `USAGE` on `vault` and `EXECUTE` on
      both. It grants a holder of the privileged key nothing it does not already
      have, since `service_role` bypasses every policy on every table, but it is
      the `MEMBER`-versus-`USAGE` mistake one level down and it is now
      enumerated. (2) The gate counted four `MEMBER` paths into a bypass role;
      the catalog holds ten — six grants and four that are `supabase_admin`'s
      implicit superuser membership. The two extra grants, `postgres →
      service_role` and `cli_login_postgres → service_role`, are transitive
      consequences of rows already listed and are listed anyway.
      **`cli_login_postgres` is investigated and not dropped**, per the task.
      It is residue of CLI linking — `supabase link` and `db push` provision a
      temporary login role through the Management API, the quirk recorded at
      P01-T02 — and nothing depends on it: zero owned objects, zero table
      privileges, zero default-ACL entries, zero `pg_shdepend` rows, zero active
      sessions. Its password expired 2026-08-03 13:03:08 UTC, confirmed expired
      when measured 2026-08-04 10:50:12 UTC. **Recommended for revocation, an
      owner decision**, because dropping a platform-managed role is not a fix
      task's call; §11b.4 also records that the CLI re-provisions one on the
      next link, so a reappearance is expected and is not a regression.
      **The six event triggers are ruled rather than assumed.** They are not an
      RLS bypass: they fire only on DDL, no API role holds `CREATE` on any
      schema, and none of the six functions is `security definer`. They are a
      code-execution surface owned by `supabase_admin`, listed in §11b.5 with
      that characterisation stated. The `MEMBER`-versus-`USAGE` rule is now
      mandatory in §11.0.1, with the `NOINHERIT` reason, so the next gate cannot
      ask the wrong question.
- [ ] CF-114 — ADR-012 retired the staging environment, and three documents
      still describe it as one that exists. A sweep of all 110 non-vendored
      files at P01-T06-FIX found 37 matching lines in 9 files; six of the nine
      are correct — the append-only journal and `ADR.md`, `PRECEDENTS.md`'s two
      uses meaning the git index and PR-14's reviewer folder, and CF-92,
      CF-109 and the isolation suite's own guard, all of which speak of a
      staging project as a future thing. The two named casualties are retired.
      What survives is: `docs/method/BUILD_PHASES.md`:25 "the **live** staging
      database", :37 "data contract live in staging" and :41 "Supabase staging
      and production projects" as a P01 deliverable; `docs/method/
      DEV_OS_REFERENCE.md`:95 "staging DB", :118 "regenerates from staging" and
      :205 "data contract live in staging"; and `docs/product/ARCHITECTURE.md`:118
      "Types are generated from staging", which sits just below the ADR-012
      amendment note that covers the table above it but not this sentence. Not
      fixed here: none of the three is in this task's write set, and PR-20 puts
      document hygiene in the next task that already opens the file. Owner: the
      P02 entry checklist, batched — one task opening all three, since the
      correction is the same sentence three times.
      AMENDED (M-01) — **the citations only; the row stays open and is not this
      task's to close.** M-01's Task B inserted the READINESS stage into
      `BUILD_PHASES.md`'s lifecycle, which shifted that file's three lines:
      :25 → **:33**, :37 → **:47**, :41 → **:51**. The other four citations are
      unmoved and re-verified here — `DEV_OS_REFERENCE.md`:95/:118/:205 and
      `ARCHITECTURE.md`:118. M-01 did not correct the sentences: CF-114 is one
      batched task across three files, PR-20 puts it in the task that opens all
      three, and fixing a third of it would leave a row that looks half-closed
      with no record of which third. Owner unchanged: the P02 entry checklist.
- [x] CF-115 — `MODULE_SPEC.md` §1 describes the application tree and nothing
      else. It names 53 paths, and the tree holds all 20 that should exist, so the
      forward direction is clean. The reverse direction is not: §1 names **no**
      repository-root file — 17 of them, including `package.json`, `proxy.ts`,
      `eslint.config.mjs`, `next.config.ts`, `tsconfig.json`, both vitest configs
      and `.nvmrc` — and none of the six tracked infrastructure directories:
      `.cursor/`, `.cursor/rules/`, `.github/`, `.github/workflows/`,
      `docs/ADRs/`, `legacy/`. `docs/` itself is named but `docs/ADRs/` falls
      outside its one-line "product, method, requirements, archive" annotation.
      Two remedies and the choice is the reviewer's: §1 gains an infrastructure
      block, or §1 states its scope as the application tree and the gate criterion
      is scoped to match. Found at P01-GATE-RUN3 as the third run's single
      documentation correction, and the same finding recurred at all three runs.
      Owner: the next documentation task, or the P02 entry checklist.
      **Opened and closed by M-01**, per PR-24 — the row was parked in
      `SESSION_CONTEXT.md` as a proposal with a reserved id and existed in no
      ledger row, so this task opened it before closing it.
      CF-115 — CLOSED (M-01) on the second remedy, which the owner signed as
      **OD-H10**: §1 is the application tree, and repository-root configuration
      files and infrastructure directories are outside its scope. §1 now carries a
      scope statement saying so rather than leaving it inferred — an `In scope:`
      line naming the nine roots, a `Specified at directory granularity:` line
      naming the two that hold no application code, and a paragraph stating that
      out of scope is the **complement** of the first list and never a list of its
      own, so a new root is excluded by not being added rather than by being named
      somewhere else. The scope is therefore a decision in the document, not an
      exception list in a script. `scripts/check_module_spec_tree.py` asserts §1
      in both directions inside that scope on every push (OD-H9) and is proven on
      three planted violations: a named path that does not exist, a tracked
      directory §1 stops naming, and a root quietly dropped from the `In scope:`
      line. **The third plant is the one worth recording.** The check's first
      draft passed it: reading the roots out of the document and then trusting
      them meant dropping `types/` from that line put its whole subtree outside
      the check, and the reverse direction went silent on a root while still
      reporting success — PR-21's shape one level up, inside the very check
      written to close PR-21's shape. The remedy is that the `In scope:` line and
      the tree block's top-level entries must now agree in both directions, so
      neither can narrow without the other.
- [x] CF-116 — `docs/ADRs/` holds one tracked file, `.gitkeep`, and no ADR; all
      twelve live in the append-only `docs/product/ADR.md`. `MODULE_SPEC.md` §1
      states that "an empty folder is a claim that work exists". The folder makes
      that claim and the work is elsewhere. Remedy is one deletion, which a
      read-only gate may not make. Owner: the next repo-maintenance task.
      **Opened and closed by M-01**, per PR-24 — parked as a proposal at
      P01-GATE-RUN3 and present in no ledger row.
      CF-116 — CLOSED (M-01). `docs/ADRs/.gitkeep` removed with `git rm` and the
      directory is gone from the tree; `docs/product/ADR.md` re-counted at
      **12** ADR headings, so nothing was lost with it. One consequence was
      fixed in the same task rather than deferred: `README.md`'s directory table
      carried a `docs/ADRs/` row reading "Architecture decision records (empty
      until C5)", which the deletion turned into a claim about a path that no
      longer exists. It now points at `docs/product/ADR.md`. The three surviving
      mentions are deliberately untouched — two are append-only history
      (`DEVELOPMENT_JOURNAL.md`, and this ledger) and one is the archived
      `docs/archive/2026-07/RUNBOOK.md`, which is a record of a plan and not a
      claim about the tree.
- [x] CF-117 — `DATA_MODEL.md` §1 is titled "Universal rules — every table,
      without exception" and its rules 3 and 4 put `archived_at` and the
      provenance trio on every table. §3 then departs three times, deliberately
      and defensibly: `operator` carries neither, `activity_event` carries neither
      and has `occurred_at` because an append-only row has no `updated_at`, and
      `consent_grant` carries provenance but `revoked_at` rather than
      `archived_at`. **The live schema matches §3 exactly**, so the contradiction
      is internal to the document and the gate's A1 criterion passes on it. §1
      needs the three carve-outs named, or a sentence admitting a reasoned
      departure in §3. Owner: the next `DATA_MODEL.md` amendment, which is P02's
      tier.
      **Opened and closed by M-01**, per PR-24 — parked as a proposal at
      P01-GATE-RUN3 and present in no ledger row.
      CF-117 — CLOSED (M-01) by naming the exceptions, **changing no rule**.
      Rules 1 through 8 are byte-identical. §1's heading is now "Universal rules,
      and the three tables that depart from them", and its new lead carries a
      three-row table stating each departure, which rule it departs from and why,
      each pointing at the §3 subsection that states it in full. The lead also
      names the six rules that are departed from nowhere — 1, 2, 5, 6, 7 and 8 —
      so the scope of the exception is bounded rather than left open, and states
      that a departure not listed there is a defect and not a decision. The
      document no longer contradicts itself and no policy, grant or column
      changed.
- [x] CF-118 — `check_ledger.py` and `check_done_steps_shape.py` detect a removed
      target correctly and exit non-zero, but surface it as a Python traceback
      rather than the one-line `FAIL:` message PR-27 describes. Detection is
      intact and the exit code is right; only the operator-facing message is
      wrong, and a traceback reads as a broken check rather than a caught
      violation. Owner: the next task touching `scripts/`.
      **Opened and closed by M-01**, per PR-24 — parked as a proposal at
      P01-GATE-RUN3 and present in no ledger row.
      CF-118 — CLOSED (M-01). Both now guard their `read()` with an
      `os.path.isfile` test and print one `FAIL:` line naming the absent file and
      what it is to that check, which is the shape the other eleven already had.
      `check_done_steps_shape.py` also gained the floor PR-27 requires — it
      printed a row count without ever stating a minimum — and its zero-data-row
      path now says so in the PR-27 idiom instead of a bare message.
      **Re-proven by re-running the two-way probe over the whole set**, now
      fifteen cases rather than thirteen because the two OD-H9 conformance checks
      join it: every case errors with a removed target and with an emptied one,
      30 of 30 runs at a non-zero exit, every one carrying a `FAIL:` line and
      **not one** surfacing a traceback. The controls hold with them: a ledger
      whose every row is closed and whose open-id list is empty is still green,
      so the floor is on rows of either kind and not a false one, and a 0-byte
      `proxy.ts` still counts as one file examined, so `check-no-runtime-cdn`
      reporting OK over it is the true answer rather than a vacuous pass.
- [x] CF-119 — `check-service-import.mjs` reports `OK` at exit 0 when
      `lib/supabase/server-only/` **exists and is empty**. The guard tests that
      the quarantine directory is present and that its scan roots hold at least
      one file, and both pass in that state, so ADR-005's one construction site
      can be deleted while the guard that exists to protect it stays green. This
      is PR-21's shape and it is the sixth instance of it in this repository.
      Found at M-01 by the two-way form of the empty-target probe: the one-way
      form only ever **removed** the directory, which the guard does catch, and
      CF-112's own text records that removal case as the reason this check was
      considered sound. No instruction named this row; it is opened because the
      probe found it and PR-28 — landed in this same task — says a probe's
      finding becomes a permanent check in the fix task that follows, and this is
      that task. Owner: M-01.
      CF-119 — CLOSED (M-01). The guard now asserts
      `MINIMUM_QUARANTINED_MODULES = 1`: the quarantine must hold at least one
      module of a scanned extension, and it names the count in both its failure
      message and its OK line so the premise is attributable either way. Proven
      on the case that found it — quarantine present, emptied, exit 1 with a
      message — with the removal case re-run alongside it and still erroring, so
      detection was extended rather than moved.
- [x] CF-120 — `SESSION_CONTEXT.md` states the decision register twice in the
      present tense, at :228 as 79 and at :246 as 84, and only the second is true.
      `check_stated_counts.py` asserts `DECISIONS.md` against itself and nothing
      asserts the figure in the state file. Owner: P02-T01, batched per PR-20.
      CLOSED (P02-T01) — the :228 bullet now states where the register was promoted
      without restating a total, exactly one current-tense figure remains, and
      `check_stated_counts.py` asserts it against `DECISIONS.md` §2.
- [ ] CF-121 — The invitation model had no way to invite anyone who had not already
      signed up, and no way to find them if they had. `member.id` references
      `auth.users (id)` and `membership.member_id` is `not null references
      public.member (id)`, so an invitation required an existing `Member` row. There
      is no INSERT policy on `member` at all — self-select, colleague-select and
      self-update, nothing else — so creating one is a privileged path no document
      specified. `member_select_colleague` shows colleagues only, so an `Owner`
      could not discover a stranger's `member.id` through the ordinary API. No
      invite-by-email concept existed in the schema or in `DATA_MODEL.md`.
      RESOLVED AT THE DESIGN LEVEL (P02-T01) by **OD-G16** — an invitation is keyed
      to an email address and signing in through the link is the acceptance. The row
      stays OPEN because implementation and proof are owed, on the same footing as
      CF-103's remainder in this commit. Owner: **the P02 task that writes the
      invitation flow**, closing on the `DATA_MODEL.md` §3 amendment landing with
      its migration and on assertions that an invitation issued to an address with
      no `Member` is accepted by exactly the person who proves that address, and by
      nobody else.
