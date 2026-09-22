# UX_PRINCIPLES

**Status:** AUTHORED. Precedence slot 12, alongside `MODULE_SPEC.md`.
**Landed:** 2026-09-23 by P03-T06.
**Depends on:** OD-G21, OD-G4, OD-H13, `BRAND_CONFIG.md`, `SECURITY_MODEL.md` §2, `DOMAIN_MODEL.md` D8, `CALC_SPEC.md` R1-25.

`DESIGN_SURFACE.md` is not yet authored. It sits in slot 12 directly after this document and yields to it.

Precedence: read with `BRAND_CONFIG.md`, `SECURITY_MODEL.md` §2, OD-G21 and OD-H13. This document governs the design surface — `components/ui` and `components/shared` — and every page composed from it. It specifies principles and the checks that hold them. It names no library, no framework and no component implementation; those are the catalog's.

## 1. What the interface is for

Two jobs share one platform. The studio — brand capture, packaging, labels — is visual, preview-led and edited slowly. Operations — catalog, stock, purchasing, invoicing, returns — is dense, tabular and edited fast. One token set serves both at two densities. A screen belongs to one job; a screen that tries to be both is two screens.

## 2. Two token layers, never mixed (OD-G21)

Platform tokens style everything the platform owns: navigation, forms, tables, buttons, dialogs, status. They are neutral, identical for every tenant, and exist in a light and a dark expression. Light is the default; dark follows the operating system's preference.

Brand tokens are the seven ColorRoles and the brand's Typefaces. They apply only where a brand is rendered or edited: outputs, previews, the brand editor, and the tenant's logo in the header. They never style a platform control.

Status belongs to the platform. Success, warning, danger and information use platform tokens. The tenant's critical role means warnings and regulatory marks on the tenant's output — it never colours a platform warning, because a warning must look the same in every tenant or it stops being one.

The boundary is a component, not a convention: a brand frame is the only component that consumes brand tokens, and everything inside it renders in the brand; everything outside it renders in the platform. A brand token referenced outside a brand frame is a defect.

The platform has no signature accent. Its chrome is the quietest thing on the screen, so that the tenant's brand is the loudest.

## 3. Bilingual and right-to-left

Every screen exists in English and Arabic, and Arabic is not a translation layer applied afterwards. A screen designed only left-to-right and then mirrored is a screen designed once, badly.

Direction-relative layout. Every horizontal position, margin, padding, alignment and border is expressed as start and end, never left and right. Direction is a property of the document, not of the component.

Mirrors: layout order, navigation, progress and step indicators, directional icons, the position of a label relative to its field, table column order.

Never mirrors: logos and brand marks, product and packaging images, numerals, SKUs, batch numbers, email addresses, phone numbers, media playback controls, and anything that depicts a physical object.

Numbers are formatted by the locale; identifiers are not. Money, quantities, percentages and dates are formatted numbers: they render in the digit system, decimal separator and grouping the Locale defines, resolved at render and never stored (`DOMAIN_MODEL.md` D8). Each locale's definition is stated once, in `CALC_SPEC.md` R1-25, and nowhere else — including here. Within one locale, every formatted number uses one system.

Identifiers are strings, not numbers. SKUs, GTINs, batch numbers, invoice numbers, phone numbers and email addresses render exactly as stored, are never re-digited by a locale, and sit in a direction-isolated span. A scanned code must match what is printed, character for character.

Mixed-direction text is isolated. A Latin SKU or email inside an Arabic sentence, or an Arabic brand name inside an English one, is rendered in a direction-isolated span so it cannot reorder the text around it.

Two typefaces for the chrome — one Latin, one Arabic — each covering every weight the catalog uses. Arabic is set with more line height than Latin at the same nominal size; a single line-height for both scripts clips Arabic ascenders and descenders.

## 4. No literals — the checkable constraint

No user-visible string appears in a component, page or server action. Every string is a key into the message catalogs (platform text) or a TranslationKey (tenant content, `BRAND_CONFIG.md` §3).

The worked justification. `bb-stock-costs.html:5645` contains `مرtجع كامل` — a Latin `t` where `ت` belongs. Every printed sales report containing a full return shipped that corrupted word, invisibly, for the life of the tool (CF-73). An inline literal makes that defect undetectable. A catalog makes it a one-line fix and a greppable class — one wrong character, one place, one correction.

One string, one declaration site (CF-74). The retiring report engine declared `الإجمالي` at four sites and `المنتج` at four more. A string is declared once and referenced by key everywhere it appears. Two keys holding identical text in the same namespace is a finding to justify, not a pattern to repeat.

Held by: `check-no-hardcoded-literals` (existing, extends with each new root); a catalog-parity check that `en` and `ar` hold exactly the same key set (owed); a duplicate-value report over each catalog namespace (owed).

## 5. Name what is missing

The platform never guesses and never shows a generic "invalid".

- A validation failure names the field and, for bilingual fields, the locale.
- A missing translation names the field and the missing locale, and never falls back to the other language (`BRAND_CONFIG.md` §3). A blank on a carton is a defect you see; a quietly English name on an Arabic label is a defect you ship.
- An incomplete brand names what is incomplete, by rule, from `BRAND_CONFIG.md` §11.
- An unexpected server error shows the person a request identifier they can report (OD-H13), and nothing that discloses whether an address, a tenant or a record exists (`SECURITY_MODEL.md` §2).

## 6. Bilingual input is one control

A bilingual field is a single control holding both locales, not two fields that happen to sit near each other. It shows which locales are filled and which are missing, and it cannot be saved as complete while one is empty. This is the most-used control in the studio and the catalog should treat it as a primitive, not a composition.

## 7. Accessibility — WCAG 2.2 AA

Contrast at AA for all platform text and controls in both light and dark. A visible focus indicator on everything focusable. Every action reachable by keyboard, in a logical order that follows reading direction. Targets at least 24 × 24 CSS pixels. No information carried by colour alone — status pairs colour with an icon or text. Motion respects the reduced-motion preference.

Brand frames are exempt from the platform's contrast rule and bound instead by `BRAND_CONFIG.md` §11's foreground/background ratio. The platform cannot refuse a brand for being that brand, but it can refuse to put a platform control on top of it.

## 8. Responsive targets

The platform is a progressive web app (OD-G4). The studio is designed for desktop first and must remain usable, not merely visible, at tablet width. Operations must work at 360 CSS pixels wide, because stock is counted standing up. No screen scrolls horizontally except a table, and a table scrolls inside itself.

## 9. What the catalog must contain

This is the scope of the design brief, not its answer.

Foundations: platform colour tokens (light and dark), a type scale for both scripts, spacing, radius, elevation, iconography with mirroring declared per icon.

Primitives: button, text input, bilingual input, select, checkbox, radio, switch, file upload, colour input, date input, table, tabs, dialog, notification, tooltip, badge, the brand frame.

States, for every primitive: default, hover, focus, active, disabled, loading, error, and empty. A primitive missing a state is not finished.

Shared compositions: form section, data table with filters, empty state, error state with request identifier, page header with tenant logo, tenant switcher, wizard step.

## 10. What this forecloses

- A platform accent colour, including gold.
- A tenant ColorRole on a platform control, and a platform warning in a tenant's colour.
- A physical left or right anywhere in the catalog.
- An inline user-visible string, and the same string declared twice.
- A fallback from one language to the other.
- A generic error, and an error that discloses.
- Colour as the only carrier of meaning.

## 11. How the checks are tiered

| Tier | Needs | Checks |
|---|---|---|
| Static — a script over the source, the existing pattern | Nothing new | Hardcoded literals (exists) · physical left/right where logical start/end is required · en/ar catalog parity · duplicate declarations · brand tokens referenced outside the brand frame · raw colour values outside the token layer · each primitive declaring every state the spec requires · variant names matching the spec |
| Component-rendered — inside the existing unit tests | One dev dependency: an accessibility-rule engine | Accessible names, roles, labels, focus order, keyboard reachability, each state actually rendering |
| Browser-rendered — a real browser | A headless-browser runner and one new CI job | Colour contrast in light and dark · layout at 360 px and desktop · RTL rendering of every primitive · no horizontal page scroll |

Contrast and responsive checks need layout and computed styles. A test environment without a rendering engine has neither, and a gate which cannot observe what it checks is not a gate (PR-21). The two dependencies those tiers need are an ADR for the task that lands the catalog. This document does not name them.
