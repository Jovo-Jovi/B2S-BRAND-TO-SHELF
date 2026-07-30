# DELTA RUN 01 — ready to paste

**This round's changes**

| File | Change | Instrument |
|---|---|---|
| `balance-bites-label-v3.html` | **REMOVED** | Supersede §2.2 — do not delete |
| `balance-bites-sticker.html` | **ADDED** (new UI + new options) | Full audit + supersession analysis |
| `bb-stock-costs.html` | Changed | Delta audit |
| `balance-bites-invoice-pro.html` | Changed | Delta audit |

File count: 6 → 6 (one out, one in). Design family unchanged in size, changed in composition.

**Order: Pass 0 → 1 → 2 → 3 → 4.** All audit passes are read-only, Opus, extended reasoning, fresh agent window each.

---

## PASS 0 — Back up browser data, before anything else (10 minutes, manual)

`balance-bites-label-v3.html` is **permanently deleted**. Pass 1 therefore runs in **documented-reference mode**: it reconstructs the removed tool's behaviour from `REPORT.md` §2.2 rather than from source. Record this in `SESSION_CONTEXT.md` under environment facts:

```
- balance-bites-label-v3.html deleted permanently <date>. REPORT.md §2.2 is the
  only surviving record of its behaviour. Its browser data (bbbacklabel_* keys,
  BBLabelDB) remains live and is the P02 migration source.
```

**Then back up the browser data.** The presets that tool wrote are still in Brave, and the tool that could export them is gone.

1. Open any remaining tool HTML file **from the same folder** the deleted file lived in. Origin matters — `file://` data is not visible across origins.
2. F12 → Application → IndexedDB. Confirm `BBLabelDB` is listed.
3. F12 → Console → paste `backup-browser-data.js` → Enter. A JSON file downloads.
4. Save it to `legacy/`. This file is now the **only** copy of those presets.
5. Run it a second time **after** using the sticker tool and diff the two. If `BBLabelDB` contents changed, the sticker tool writes to the same store — which Pass 1 §1.3 must then treat as a live data-loss risk, not a hypothetical one.

Finally, snapshot the remaining five HTML files into `legacy/`. That snapshot is the freeze point: the port is built and parity-tested against it.

---

## PASS 1 — Full audit + supersession analysis: `balance-bites-sticker.html`

```
ROLE: Senior software auditor. READ-ONLY. Do not modify, create, or delete any
file except the report file named at the end.

CONTEXT: docs/REPORT.md audited six single-file HTML tools for Balance Bites (an
Egyptian healthy-snacks brand, bilingual AR/EN, gold + dark brown). Since that
audit, balance-bites-label-v3.html was REMOVED and balance-bites-sticker.html
was ADDED with a new UI and new options. The owner describes this as a
replacement.

Your job is to audit the new file completely AND establish exactly what was lost
and gained, so that no capability disappears by accident.

FILE: balance-bites-sticker.html — read completely, in chunks if needed. No
sampling.

REFERENCE for the removed tool: balance-bites-label-v3.html is PERMANENTLY
DELETED. Its source is unavailable. Use REPORT.md §2.2 as the sole record of its
behaviour — the audit documented it in enough detail (shape modes, geometry
variables, IndexedDB schema, migration key order, default dimensions, print
approach) to serve as a specification. Where §2.2 is silent on something, say
"not recorded" rather than inferring; a guess about deleted code is worse than
an acknowledged gap.

TASK:

PART 1 — SUPERSESSION ANALYSIS (do this first; it frames everything else)

  1.1 CAPABILITY DELTA. REPORT.md §2.2 documents label-v3's capabilities. For
      each, state PRESENT / CHANGED / ABSENT in the new sticker tool, with
      file:line where present:
        - Shape modes: rectangular back label, tapered/conical cup unwrap,
          circular seal, custom size
        - The conical unwrap math: apex radius, inner/outer arc radii R1/R2,
          arc degrees, slant height, bounding box, the live debug readout
          (label-v3:911-962)
        - Exact-cm @page printing and the PPC (pixels-per-cm) approach
          (label-v3:1590-1600)
        - PNG export via dom-to-image (label-v3:1756-1767)
        - Crop modes including the 3mm safety-buffer exact crop (label-v3:467)
        - IndexedDB preset storage: BBLabelDB / store 'presets' / keyPath 'name'
          (label-v3:856-857)
        - 30-slot preset bar with single + bulk export
          (bbbacklabel / bbbacklabel_bulk)
        - Legacy migration sweep of bbbacklabel_pb3 → bbbacklabel_pb →
          bbbacklabel_pb2 into IndexedDB (label-v3:2011-2021)
        - Bilingual paired EN/AR content fields with per-field dir="rtl"
        - Default dimensions: back label 17×4.5cm; cup Ø9 top / Ø7 bottom /
          H9 / label height 7cm

  1.2 ANYTHING ABSENT IS A DECISION, NOT A DEFAULT. For every ABSENT item,
      state the consequence: what can the owner no longer do? Flag each as a
      candidate Operational Decision. Be explicit — capability loss discovered
      during the port is far more expensive than capability loss decided now.

  1.3 MIGRATION CONTINUITY — CRITICAL. Removing the HTML file does NOT remove
      the owner's saved data. Determine and document:
        - Does the sticker tool read the old bbbacklabel_* localStorage keys or
          the BBLabelDB IndexedDB database at all?
        - Does it migrate old presets forward, ignore them, or overwrite them?
        - Can any path in the sticker tool DESTROY old label-v3 preset data
          (same DB name, same store, same keyPath, a clear/wipe routine)?
      If old presets are stranded, say so plainly. They remain a required source
      for the P02 migration importer regardless of what this tool does.

  1.4 NEW CAPABILITIES. What does the sticker tool do that label-v3 did not?
      New shape modes, new options, new UI affordances, new export formats.
      Each is new scope and needs an entry in the parity matrix.

PART 2 — FULL ANALYSIS, matching REPORT.md §2's structure exactly so this can be
inserted as a section. Cite file:line for every claim:
  A. Purpose & workflow
  B. Feature list — exhaustive: every button, tab, modal, mode, preset system,
     export/import, badge slot
  C. Data model — every state field and its exact stored shape
  D. Persistence layer — every localStorage key, IndexedDB DB/store, File System
     Access usage, JSON export/import format, migration logic
  E. Hardcoded values registry — table: value | proposed BrandConfig key |
     wizard input type | file:line. Cover brand name, monogram, colours, fonts,
     product/flavour names, prices, currency, contact info, Arabic strings,
     dimensions in cm/mm, URLs, barcode/QR content.
     NOTE: label-v3 carried the "BALANCE / BYTES" typo at :698-699 (all-caps, so
     a case-sensitive grep for "Bytes" misses it). Check whether this typo
     survived into the sticker tool.
  F. Print & rendering logic — @media print rules, page sizes, real-unit vs px,
     dual-DOM or single-DOM, what breaks on different paper
  G. Bilingual / RTL handling — dir usage, which Arabic is editable vs baked in
  H. Bugs, smells & fragility — severity-ranked with file:line. Check for:
     unescaped innerHTML, swallowed catch blocks, base64 images in localStorage
     (quota risk), duplicate element IDs, CDN dependencies that break offline,
     float drift in geometry math
  I. External dependencies — every CDN and font link; what breaks offline
  J. Security & privacy

PART 3 — IMPACT ON THE EXISTING AUDIT
  3.1 COUPLING. Does this tool read or write ANY bb_* localStorage key, the
      bb_filestore_v1 IndexedDB handle, or the shared data folder? REPORT.md
      §3.3 concluded the design tools are "independent islands" sharing no
      runtime data. If this tool breaks that, say so explicitly — the coupling
      map is then wrong and must be rewritten.
  3.2 STICKER ENTITY. Does it relate to the Sticker entity in
      bb-stock-costs.html:2391-2415 ({productId, templateKey})? Is templateKey a
      link to a template defined in THIS file? If so, document the link contract
      exactly — that is a cross-family dependency the audit does not have.
  3.3 DUPLICATION. Which rows of REPORT.md §3.1's duplication matrix does this
      file change (preset bar, JSON export/import, colour/theme engine, toast,
      print scaffolding, RTL wiring)? Give the impl-count delta, accounting for
      label-v3's removal.
  3.4 INCONSISTENCY. Which rows of §3.2 does it change — a different "preset"
      shape? a different storage key convention? a different print approach?
  3.5 MODULE PLAN. UNIFICATION.md §6 planned a merged Label module built on
      label-v3's geometry engine, plus a separate Cup/Sticker Designer extracted
      later. With label-v3 gone, that plan is stale. Recommend the new module
      shape: does the sticker tool merge with balance-bites-label-editor-
      latest.html, stand alone, or something else? Justify against the
      capability delta from Part 1.

OUTPUT — create exactly one file:
  docs/AUDIT_STICKER.md

RULES: Read the file completely. Cite file:line for every claim. Quote Arabic
verbatim. Do not propose fixes; this is analysis only. Do not modify REPORT.md,
inventory.json, or UNIFICATION.md — reconciliation is a separate pass.
```

---

## PASS 2 — Delta audit: the two business tools

Run `PROMPT_PACK.md § P-DELTA-00` with this scope block:

```
CHANGED FILES (audit these completely, in chunks if needed — no sampling):
  1. bb-stock-costs.html
  2. balance-bites-invoice-pro.html

OWNER'S DESCRIPTION OF THE CHANGES (a claim to verify, NOT truth — the code
wins wherever they disagree):
  <paste your returns notes here, plus anything else you changed>
```

Add to P-DELTA-00's section H:

```
H-EXTRA. Two structural changes happened outside these files:
balance-bites-label-v3.html was REMOVED, and balance-bites-sticker.html was
ADDED. Determine whether either of these two files:
  - references label-v3 by filename, path, or file:// link (bb-stock-costs.html
    already carries a hardcoded file:/// cross-link to invoice-pro at :762 —
    check for others)
  - reads or writes anything the sticker tool produces
  - depends on any bbbacklabel_* key or the BBLabelDB IndexedDB database
  - has a templateKey value on its Sticker entity that points at a template
    defined in either the removed or the added file
```

Then run `§ P-DELTA-01` for the returns math depth.

Output: `docs/DELTA_REPORT_01.md` + `docs/DELTA_SCHEMA.md`.

---

## PASS 3 — Reconciliation

```
Read docs/AUDIT_STICKER.md, docs/DELTA_REPORT_01.md, and docs/DELTA_SCHEMA.md,
then reconcile the audit documents.

RULE: this project's documents are APPEND-ONLY for removals. Do not delete the
label-v3 section. Its migration keys, geometry math, and bug list remain
required inputs even though the file is gone.

REPORT.md:
  - §2.2 (label-v3): prepend a banner:
      "> **SUPERSEDED <date>.** File removed from the working set and replaced by
       balance-bites-sticker.html (§2.x). Retained as reference: the
       bbbacklabel_* / BBLabelDB migration source (P02), the conical unwrap
       geometry, and the documented bug list. See AUDIT_STICKER.md Part 1 for
       the capability delta."
    Keep the entire section body unchanged below the banner.
  - Insert the sticker tool as a new numbered section, in the design family
  - Update the §1 inventory table: remove label-v3 from the active list (note it
    as superseded), add the sticker tool, correct line counts and the total
  - Update §2.1 and §2.3 with the business-tool deltas
  - Update §3.1 duplication matrix: subtract label-v3's impls, add the sticker
    tool's
  - Update §3.2 inconsistencies
  - Update §3.3 coupling map — REWRITE IT if the sticker tool proved to share
    runtime data with the business tools
  - §3.4 (the "are any two files versions of the same tool" section): rewrite.
    It concluded the two label files were complementary, not versions. That
    conclusion is now partly moot; state the new relationship between the
    sticker tool and balance-bites-label-editor- latest.html
  - Update §4 consolidated bug list: mark label-v3 bugs as SUPERSEDED (including
    the BYTES typo) rather than deleting them; add all new findings
  - Add a changelog block at the top: what changed, when, why

inventory.json:
  - Mark the label-v3 entry superseded:true with a supersededBy field — do not
    remove it
  - Add the sticker file with entities, storage keys, hardcoded values, bugs
  - Update the two business tools
  - Update duplication matrix and coupling entries
  - Ensure the file count is consistent with REPORT.md §1

UNIFICATION.md:
  - §3: replace the canonical Return entity per DELTA_SCHEMA.md
  - §4 (migration plan): the bbbacklabel_pb3 → bbbacklabel_pb → bbbacklabel_pb2
    fallback order MUST survive here verbatim even though its source file is
    gone. Add an explicit note that the source tool no longer exists but the
    browser data does. If the sticker tool introduces its own keys, add them.
  - §6: rewrite the module breakdown per AUDIT_STICKER.md Part 3.5
  - §8: add every ABSENT capability from AUDIT_STICKER.md Part 1.2 as a
    numbered open question

Do not touch any .html file. Report a summary of every edit made.
```

---

## PASS 4 — Reviewer verdict

Bring all reports plus the reconciliation diff into the Claude Project. Run `PROMPT_PACK.md § P-DELTA-03` with these additions:

```
Additionally verify:
  - Is every label-v3 capability accounted for as PRESENT / CHANGED / ABSENT,
    with each ABSENT item raised as a decision rather than left implicit?
  - Did the bbbacklabel_* / BBLabelDB migration path survive into
    UNIFICATION.md §4 despite its source file being deleted? This is the single
    most losable item in this round.
  - Can any path in the sticker tool destroy old label-v3 preset data?
  - Was §2.2 superseded rather than deleted, with its body intact?
  - If the sticker tool claims coupling to the business tools, is the link
    contract documented precisely enough to build against?
  - Is the file count consistent across REPORT.md §1, inventory.json, and
    UNIFICATION.md? A headline-number mismatch is exactly the drift class
    DEV_OS_REFERENCE.md §2 warns about.
```

**PASS is required before Stage C begins.**

---

## Pending revisions to PHASE_PLAN.md (after PASS 4, not before)

The label-v3 removal invalidates parts of P06. Do not edit the phase plan until the audit returns — but expect these:

- **T06.1** "Geometry engine from v3" — rewrite or delete depending on whether the sticker tool carries the conical unwrap
- **T06.6** "fix the BYTES typo (label-v3:699)" — likely moot; verify against the sticker tool first
- **T06.9** "Cup/sticker sub-module" — probably promoted from sub-module to primary, per Part 3.5
- **T02.2** preset importer — **unchanged and still required.** The `bbbacklabel_*` fallback order stays in the importer regardless of the file's deletion
- **P06 title** — "merge label-v3 + label-editor" becomes "merge sticker + label-editor"
