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
- [ ] CF-54 — Stub count stated three ways: 22 in P-01's done-when, 20 in P-12's
      prompt, 23 actual (21 under docs/product/, 2 under docs/method/). Same
      defect class as CF-38's 56-versus-79. P-12 corrected and P-01 annotated
      as-built by P-04c. Owner: reviewer, verify at Gate 3.
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
- [ ] CF-60 — Four open rows carry no explicit `Owner:` field: CF-01, CF-05,
      CF-27, CF-44. Not a substantive gap — CF-01's owner is P10 and CF-05's is
      Step 15, both stated in prose rather than as a field; CF-27 is
      noted-no-action; CF-44 is void by design. But the Gate 3 checklist requires
      "No open carry-forward without a named owner" and a checklist cannot read
      prose. Normalise all four to explicit `Owner:` fields, inventing no owner —
      where none exists, write the reason. Owner: reviewer, before Gate 3.
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
- [ ] CF-94 — `check-no-runtime-cdn` and `check-no-hardcoded-literals` scan `app/`
      and `proxy.ts` only, which was the whole of the application source when
      P01-T01 authored them. `lib/` exists as of P01-T02-RESUME and is not
      scanned; `features/` and `components/` will not be either when they arrive.
      A hex colour or an external `<script>` under `lib/` passes both guards
      today. The two guards landed at P01-T02-RESUME — `check-service-import` and
      `check-data-boundary` — already scan the wider root set and name the roots
      that do not yet exist in their own output. Owner: the next task that touches
      either guard, at the latest the Phase 02 entry checklist.
- [ ] CF-95 — The deployment and drift pipeline is wired but not live, and both
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
- [ ] CF-96 — `docs/method/REVIEWER_CHAT_INSTRUCTIONS.md` sits untracked in the
      working tree. PR-14 requires a reviewer-authored document to stage outside
      the working tree and to enter the repository only by a land task, to its
      final path; an untracked draft inside the tree is the CF-53 duplication risk
      in a new place. It is not byte-identical to
      `docs/method/CLAUDE_PROJECT_INSTRUCTIONS.md`, so it is a distinct document
      rather than a copy of a committed one. P01-T02-RESUME did not touch it: no
      prompt has authorised landing it and it is outside the task's scope. Owner:
      the owner, to land it or remove it.
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
- [ ] CF-98 — Four open Dependabot alerts on the default branch, unrecorded since
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
- [ ] CF-99 — A pull request exists on `phase/01-foundation` that the task
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
- [ ] CF-104 — `DATA_MODEL.md` §2 narrows operator reach to "`tenant`,
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
- [ ] CF-105 — `EXECUTE` on `public` functions is granted to `PUBLIC` by default
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
- [ ] CF-106 — `@types/node` is pinned to major 20 while the toolchain now
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
