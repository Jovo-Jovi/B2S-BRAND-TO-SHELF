# DESIGN_SURFACE

**Status:** SIGNED by the owner, 2026-09-23. Precedence slot 12, directly after `UX_PRINCIPLES.md`, and yields to it.
**Specifies:** `UX_PRINCIPLES.md` in full. Every rule here is that document made implementable.
**Depends on:** OD-G4, OD-G14, OD-G21, `OD-G22`, `OD-G23`, OD-H13, OD-H14, `ADR-014` · `BRAND_CONFIG.md` §3, §4, §5, §7, §9, §10, §11 · `CALC_SPEC.md` R1-25 · `DOMAIN_MODEL.md` D8 · `SECURITY_MODEL.md` §2 · `GLOSSARY.md` §5 · `DATA_MODEL.md` `tenant.default_locale`, `color_value.srgb`.
**Reuses:** the `--b2s-` custom-property convention already in `app/globals.css`.
**Scope:** `components/ui`, `components/shared`, and every page composed from them. Not print: page geometry belongs to the print engine (P06) and `PRINT_CONTRACT.md`.

---

## How to read this document

`MUST` and `MUST NOT` are normative. Everything else explains.

Every primitive carries one fenced `component` block. **The block binds; the prose explains.** The static gates CF-173 and CF-174 parse these blocks, so where prose and block disagree, the block wins and the prose is a defect. The block format is a restricted YAML subset: top-level scalars and flow lists (`key: [a, b]`), plus one nested mapping, `states`.

**A value this document does not give is not the implementer's to choose.** It routes back here, per `BUILD_PHASES.md` "The design surface". A builder who finds a gap reports it; a builder who fills it has designed, which is the one thing the method forbids a builder to do.

---

## 0. Signed invariants and resolved dependencies

**Four owner decisions of 2026-09-23 bind this document from above.** A component, a page or a later amendment to this document may not reinterpret them.

1. **The chrome is achromatic** — `OD-G22`. Every chrome neutral has red, green and blue equal. No tinted, warm, cool or signature grey, and no gold. This is part of the proofing model, not an aesthetic: the platform must not introduce a colour cast that changes how a tenant's brand colour is perceived (§1).
2. **The platform typeface is IBM Plex Sans with IBM Plex Sans Arabic** — `OD-G23`. One superfamily for both scripts, self-hosted, never loaded from a CDN (§2.3).
3. **Date presentation** — `CALC_SPEC.md` R1-25's locale block, amended 2026-09-23: Gregorian calendar; `DD/MM/YYYY` for display in both locales (`23/09/2026`); ISO 8601 for every machine-readable value; weeks start on Saturday. `DateField` references it and states none of it (PR-43).
4. **The brand contrast constant** — `BRAND_CONFIG.md` §11, amended 2026-09-23: `foreground` meets **4.5:1** against `background` in every theme, because `foreground` is the text role. `ColorField` references it.

## 1. The one idea: the chrome is a proofing surround

Print colour is judged against neutral grey. Proofing booths surround the sheet with an achromatic field because a tinted surround shifts how the colour beside it is perceived — a cool grey makes a warm brand read warmer, a warm grey makes it read cooler. B2S is where a brand owner decides what their packaging will look like, so the platform's chrome is that surround.

Every chrome neutral in this document is **achromatic — red, green and blue equal** — and that is a signed invariant (`OD-G22`), not a style this document could revise. Not a cool zinc, not a warm stone. The tenant's brand is the only colour on screen that belongs to anyone, and nothing in the chrome competes with it or tints the judgement of it.

That is where this system spends its boldness: in one place, inside the brand frame. Everything outside it is disciplined, quiet and consistent, so that the brand is the loudest thing on the screen and the chrome is the easiest to stop noticing. It is also why there is no platform accent colour (OD-G21), and why the primary action is solid neutral rather than a hue.

---

## 2. Tokens

### 2.1 Naming and layers

- **Platform tokens:** `--b2s-{group}-{name}`, extending the existing convention. Consumed anywhere outside a brand frame.
- **Brand tokens:** `--brand-{name}`. Defined only by `BrandFrame` (§3). Consumed only inside it (CF-171).
- The tokens currently in `app/globals.css` are **unconsumed** — P03-T06's inventory found no rule assigning them — so this set replaces them and nothing breaks.
- `leading` replaces `line-height` in token names so that no identifier carries a bare `line` (`GLOSSARY.md` §5).
- No raw colour, spacing, radius, duration, shadow or font-family value appears anywhere outside the token definitions (CF-172).
- **A page or component never introduces a chrome colour.** It uses a platform token or it is a defect. Every platform colour token is defined in §2.2 and §2.11, and every chrome neutral among them is achromatic (`OD-G22`).

### 2.2 Colour — platform

| Token | Light | Dark | Use |
|---|---|---|---|
| `--b2s-color-canvas` | `#f4f4f4` | `#171717` | Page background |
| `--b2s-color-surface` | `#ffffff` | `#1f1f1f` | Panels, fields, table body |
| `--b2s-color-sunken` | `#ededed` | `#141414` | Wells, table header, read-only fields |
| `--b2s-color-raised` | `#ffffff` | `#262626` | Menus, popovers, dialogs, notices |
| `--b2s-color-border` | `#e0e0e0` | `#2e2e2e` | Decorative dividers **only** — never a control boundary |
| `--b2s-color-border-control` | `#7a7a7a` | `#767676` | Every control boundary: fields, checkboxes, switch tracks |
| `--b2s-color-text` | `#1a1a1a` | `#f2f2f2` | Primary text |
| `--b2s-color-text-muted` | `#545454` | `#b3b3b3` | Secondary text, help |
| `--b2s-color-text-subtle` | `#6b6b6b` | `#999999` | Metadata, placeholders |
| `--b2s-color-action` | `#1a1a1a` | `#f2f2f2` | Primary action fill |
| `--b2s-color-action-text` | `#ffffff` | `#1a1a1a` | Text on primary action |
| `--b2s-color-action-hover` | `#3d3d3d` | `#d6d6d6` | Primary action, hovered |
| `--b2s-color-focus` | `#1a1a1a` | `#f2f2f2` | Focus ring |
| `--b2s-color-danger-action` | `#b3261e` | `#c62f26` | Destructive fill; text `#ffffff` |
| `--b2s-color-success` / `-bg` | `#1f7a3d` / `#eef7f1` | `#6fcf8f` / `#16261b` | Status |
| `--b2s-color-warning` / `-bg` | `#8a5a00` / `#fbf5e6` | `#e6b450` / `#2a2212` | Status |
| `--b2s-color-danger` / `-bg` | `#b3261e` / `#fbeeed` | `#f08a82` / `#2e1a19` | Status |
| `--b2s-color-info` / `-bg` | `#1f5fae` / `#edf3fb` | `#7fb0ec` / `#17222f` | Status |

**Status colours are functional, not decorative.** They carry the four states and nothing else. They never appear as brand, accent, emphasis or illustration.

**`border` and `border-control` are different jobs.** WCAG 2.2 1.4.11 requires 3:1 only where a boundary is needed to identify a control. Dividers are decorative and sit quieter; control boundaries meet 3:1 on every surface.

**Contrast, computed rather than asserted** (PR-23). Seventy text and control pairs, both themes; every one meets WCAG 2.2 AA. Selected rows:

| Pair | Light | Dark | Needs |
|---|---|---|---|
| text on surface | 17.40 | 14.72 | 4.5 |
| text-muted on surface | 7.57 | 7.86 | 4.5 |
| text-subtle on canvas (lowest) | 4.85 | 6.29 | 4.5 |
| border-control on sunken (lowest) | 3.67 | 3.93 | 3.0 |
| action-text on action | 17.40 | 15.55 | 4.5 |
| white on danger-action | 6.54 | 5.47 | 4.5 |
| success on success-bg | 4.91 | 8.29 | 4.5 |
| warning on warning-bg | 5.45 | 8.24 | 4.5 |
| danger on danger-bg | 5.78 | 6.78 | 4.5 |
| info on info-bg | 5.69 | 7.14 | 4.5 |

Placeholders use `text-subtle` and meet 4.5:1, but a placeholder is never a substitute for a caption (§6, `Field`).

**Theme selection:** light by default; dark follows `prefers-color-scheme`; an explicit choice in the account menu overrides both. The explicit choice is a member preference, not tenant data, and it is never inferred from a tenant's brand.

### 2.3 Typography

**Families:** IBM Plex Sans for Latin, IBM Plex Sans Arabic for Arabic — a signed invariant (`OD-G23`).

Chosen deliberately rather than by default. The two were designed as one superfamily, so weights and vertical metrics match across scripts by design rather than by adjustment — which in a bilingual interface means an Arabic caption and an English one at the same step look like the same step. Its engineered grotesque character suits a production platform whose subject is manufacturing and print. It carries tabular figures, and its licence is the SIL Open Font License 1.1.

**Font files are self-hosted and committed as assets.** A runtime font CDN is forbidden (`check-no-runtime-cdn`). If the landing task proposes a package to supply the files, that is an ADR under `AGENTS.md` §2.

**Stack:** `"IBM Plex Sans", "IBM Plex Sans Arabic", system-ui, sans-serif`. Under `:lang(ar)` the Arabic face is listed first, so shared glyphs — digits and punctuation — take the Arabic face's metrics and sit correctly on an Arabic line.

**Weights:** 400 regular, 500 medium (captions, buttons, table headers), 600 semibold (headings). No 700 in the chrome.

**Scale.** Leading is resolved by `:lang(ar)`, never by direction: a direction-isolated Latin SKU inside an Arabic sentence is set by its surrounding line.

| Step | Size | Leading, Latin | Leading, Arabic | Use |
|---|---|---|---|---|
| `xs` | 0.75rem · 12px | 1.33 · 16px | 1.67 · 20px | Metadata only. Never body text |
| `sm` | 0.875rem · 14px | 1.43 · 20px | 1.71 · 24px | Compact body, table cells, captions, help |
| `md` | 1rem · 16px | 1.5 · 24px | 1.75 · 28px | Comfortable body |
| `lg` | 1.125rem · 18px | 1.44 · 26px | 1.67 · 30px | Section headings, compact |
| `xl` | 1.25rem · 20px | 1.4 · 28px | 1.6 · 32px | Page headings compact; section headings comfortable |
| `2xl` | 1.5rem · 24px | 1.33 · 32px | 1.5 · 36px | Page headings, comfortable |
| `3xl` | 2rem · 32px | 1.25 · 40px | 1.44 · 46px | Wizard step titles. Sparingly |

**Numbers** use tabular figures in tables, numeric fields and totals, so digits align in columns. **A monospace face is never used for data**; tabular figures of the interface face do the job without making numbers look like code.

**Case and tracking.** Sentence case everywhere. No all-caps text. **Letter-spacing is forbidden on any text that may render in Arabic**, because tracking breaks the joins that Arabic letterforms depend on — and since every string may render in Arabic, tracking is forbidden in the chrome outright.

**Measure.** Prose runs to at most `--b2s-measure-prose`. Forms cap at `--b2s-measure-form`.

### 2.4 Spacing

A 4px grid. Only these values; no raw `px` anywhere (CF-172).

| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--b2s-space-0` | 0 | | `--b2s-space-6` | 1.25rem · 20px |
| `--b2s-space-1` | 0.125rem · 2px | | `--b2s-space-7` | 1.5rem · 24px |
| `--b2s-space-2` | 0.25rem · 4px | | `--b2s-space-8` | 2rem · 32px |
| `--b2s-space-3` | 0.5rem · 8px | | `--b2s-space-9` | 2.5rem · 40px |
| `--b2s-space-4` | 0.75rem · 12px | | `--b2s-space-10` | 3rem · 48px |
| `--b2s-space-5` | 1rem · 16px | | `--b2s-space-11` | 4rem · 64px |

### 2.5 Radius

Radius grows with the size of the container. One radius on everything is a tell of an assembled kit, not a system.

| Token | Value | Use |
|---|---|---|
| `--b2s-radius-sm` | 4px | Checkboxes, badges, compact controls |
| `--b2s-radius-md` | 6px | Controls, table containers, popovers |
| `--b2s-radius-lg` | 10px | Dialogs, sheets, notices |
| `--b2s-radius-full` | 9999px | Switch tracks and thumbs |

### 2.6 Elevation and containment

The system is **flat by default**. Sections are separated by space and hierarchy, not by a card around everything. A bordered container appears only where it groups content that moves together — a table, a form section with its own save, a brand frame.

| Level | Light | Dark | Use |
|---|---|---|---|
| `--b2s-elevation-1` | `0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.08)` | none; `raised` fill and a `border-width` boundary in `border` | Menus, popovers, tooltips |
| `--b2s-elevation-2` | `0 2px 4px rgb(0 0 0 / 0.06), 0 12px 32px rgb(0 0 0 / 0.14)` | none; `raised` fill and a `border-width` boundary in `border` | Dialogs, sheets |
| `--b2s-elevation-3` | `0 2px 4px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.12)` | none; `raised` fill and a `border-width` boundary in `border` | Notices |

Shadows do nothing on a dark surface, so dark elevation is expressed as a lighter fill and a border.

### 2.7 Density

Two identifiers, **`comfortable`** and **`compact`**. Not "studio" and "operations": `GLOSSARY.md` §5 forbids `studio` as an identifier. Brand work — the wizard, the brand editor, packaging — uses `comfortable`; operations — catalog, stock, invoices, returns — uses `compact`.

Density is set once per page region by a `data-density` attribute and read through tokens. **A component never branches on density in its own logic**; the tokens change and the component follows.

| Token | `comfortable` | `compact` |
|---|---|---|
| `--b2s-control-height` | 40px | 32px |
| `--b2s-control-padding-inline` | `space-5` | `space-4` |
| `--b2s-row-height` | 48px | 36px |
| `--b2s-cell-padding-block` | `space-4` | 0.375rem · 6px — the one value off the 4px grid, defined here and used only by table cells |
| `--b2s-cell-padding-inline` | `space-5` | `space-4` |
| `--b2s-field-gap` | `space-7` | `space-5` |
| `--b2s-text-body` | `md` | `sm` |
| `--b2s-icon-size` | 20px | 16px |

**Below 640px, density is `comfortable` regardless of region.** Stock is counted standing up, on a phone, with a thumb. Both densities exceed WCAG 2.2's 24 × 24px minimum target.

### 2.8 Motion

Motion answers an action. **Nothing animates on page load. Table rows never animate when data changes**, because movement in a list someone is scanning reads as a change they missed.

| Token | Value | Use |
|---|---|---|
| `--b2s-duration-quick` | 100ms | Hover, press |
| `--b2s-duration-base` | 160ms | Expand, collapse, small state change |
| `--b2s-duration-enter` | 200ms | Menus, dialogs, notices appearing |
| `--b2s-duration-exit` | 150ms | The same, leaving |
| `--b2s-ease-standard` | `cubic-bezier(0.2, 0, 0.2, 1)` | State changes |
| `--b2s-ease-enter` | `cubic-bezier(0.2, 0, 0, 1)` | Appearing |
| `--b2s-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Leaving |

Under `prefers-reduced-motion: reduce`, every transform is removed. What remains is an opacity change of at most 100ms, or nothing.

### 2.9 Breakpoints

`sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px. The layout at each is specified by `AppShell` (§7).

### 2.10 Iconography

One icon set of line glyphs at a 1.5px stroke, sized by `--b2s-icon-size`. **Every icon is registered with a `mirrors` flag**, and nothing else decides whether an icon flips.

- **Mirror:** arrows, back and next chevrons, undo and redo, reply and forward, indent and outdent, progress arrows, the external-link arrow.
- **Never mirror:** check, cross, plus, minus, search, clock, calendar, upload and download (vertical), delete, edit, camera, media playback, information and question marks, and every logo or brand mark.

If the icon set arrives as a package, it is an ADR for the landing task under `AGENTS.md` §2.

### 2.11 Component dimensions

Every fixed measure a component uses is a token here, so that no component carries a raw value (CF-172).

| Token | Value | Used by |
|---|---|---|
| `--b2s-border-width` | 1px | Every divider and control boundary |
| `--b2s-focus-width` | 2px | Every focus ring |
| `--b2s-focus-offset` | 2px | Every focus ring |
| `--b2s-check-size` | 1rem · 16px | `Checkbox`, `RadioGroup` |
| `--b2s-status-bar-width` | 3px | `Notice` |
| `--b2s-indicator-width` | 2px | `Tabs` selection, `AppShell` current section |
| `--b2s-measure-prose` | 75ch | Running text |
| `--b2s-measure-form` | 40rem | `FormSection`, `WizardStep`, forms |
| `--b2s-dialog-width-small` | 24rem | `Dialog` small |
| `--b2s-dialog-width-medium` | 32rem | `Dialog` medium |
| `--b2s-dialog-width-large` | 48rem | `Dialog` large |
| `--b2s-logo-height` | 28px compact · 32px comfortable | `PageHeader` |
| `--b2s-color-scrim` | `rgb(0 0 0 / 0.4)`, both themes | `Dialog` backdrop |
| `--b2s-color-danger-action-hover` | `#931f18` light · `#a82820` dark | `Button` danger, hovered |
| `--b2s-duration-pulse` | 1200ms | `Skeleton` |
| `--b2s-delay-loader` | 150ms | `Skeleton`, `Spinner`, every loading state |
| `--b2s-delay-tooltip` | 500ms | `Tooltip` |
| `--b2s-notice-dismiss` | 5000ms | `Notice` toast, success and info |

---

## 3. The brand layer

`BrandFrame` is the only component that consumes brand tokens (OD-G21, `UX_PRINCIPLES.md` §2). Everything inside it renders in the brand; everything outside it renders in the platform.

**Brand tokens**, defined by `BrandFrame` from a resolved `BrandProfile`:

- `--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-background`, `--brand-foreground`, `--brand-muted`, `--brand-critical` — the seven `ColorRole`s (`BRAND_CONFIG.md` §4), from the chosen `BrandTheme`, defaulting to the profile's default theme.
- `--brand-font-heading-latin`, `--brand-font-heading-arabic`, `--brand-font-body-latin`, `--brand-font-body-arabic` — with weight and italic for each (`BRAND_CONFIG.md` §5).

**Resolution** follows `BRAND_CONFIG.md` §7 exactly: the line's profile if it has one, otherwise the brand's current profile, resolved at read time and never stored.

**Rules.**

1. **No platform control inside a frame.** Editing affordances — edit, replace, remove — sit outside the frame's boundary, in chrome. The platform cannot refuse a brand for being that brand, but it can refuse to put a platform control on top of one (`UX_PRINCIPLES.md` §7).
2. **Inside a frame, no platform token is referenced. Outside one, no brand token is** (CF-171).
3. **The frame is a proofing mount:** a `border-width` boundary in `border-control` and `space-5` of neutral surround between the chrome and the brand's own `background`.
4. **Contrast inside a frame** is bound by `BRAND_CONFIG.md` §11's `foreground`/`background` constant, not by the platform's AA rule. The frame never "fixes" a brand's colours.
5. **Missing values are named, never substituted** (`BRAND_CONFIG.md` §3, §9, §11). A missing role shows a named gap in that role's place. A missing locale string shows the field and the locale. A missing typeface pair renders the text in the platform face with a visible marker naming the pair — so the gap is seen, never hidden behind a plausible substitute.
6. **The tenant's logo in the header is an image, not a brand-token consumer.** It needs no frame (§7, `PageHeader`).
7. **A colour swatch in chrome is data, not a token.** A `ColorField` showing a stored `color_value` renders that value inline; it is not a brand-token reference, and CF-171 must not treat it as one.

---

## 4. Right-to-left is structure, not a mirroring pass

1. **Direction is set once**, on the document root, from the locale — `app/[locale]/layout.tsx` already does this. Components do not read direction to choose styles.
2. **Logical properties only:** `margin-inline-start` and `-end`, `padding-inline`, `inset-inline-start` and `-end`, `border-inline-start` and `-end`, `text-align: start` and `end`, `float: inline-start` and `inline-end`. **A physical `left` or `right` anywhere in the catalog is a defect** (CF-168). There is no chrome exception; the print engine's real-unit geometry is outside this document.
3. **Flex and grid flow follow direction automatically.** Order is never reversed by hand.
4. **Icons flip only by their registry flag** (§2.10). A flag, not a judgement made per page.
5. **Mixed direction is isolated.** Every identifier, email, URL, hex colour, SKU, GTIN, batch number, invoice number, request identifier and file name renders in a direction-isolated span, left-to-right. Tenant text from a `TranslationEntry` renders in its own locale's direction, isolated. So an Arabic brand name inside an English sentence, or a Latin SKU inside an Arabic one, cannot reorder the text around it.
6. **Formatted numbers pass through the locale formatter only** (`CALC_SPEC.md` R1-25; CF-175) and are never assembled by hand. Under R1-25's locale definitions both locales use Latin digits, so a number is a left-to-right run that bidirectional layout places correctly in an Arabic line.
7. **Numeric table columns align to the cell's end edge**, with tabular figures, so decimals line up in both directions.
8. **Arrow keys follow visual direction.** In a right-to-left tab list, ArrowLeft moves to the next tab.
9. **Steppers and progress** flow from start to end.
10. **Arabic punctuation** — `،` `؛` `؟` — comes from the catalogs, never from code.
11. **Plurals follow the locale's plural categories.** Arabic has six — zero, one, two, few, many, other — and every counted string carries all six in `ar`. **No string is ever built by concatenation**, because word order, gender and number agreement differ between the two languages.

CF-179 renders every primitive in `ar` and checks every rule above that a rendering can observe.

---

## 5. The component contract

Every primitive declares:

| Key | Contents |
|---|---|
| `name` | The export name. PascalCase, and clear of `GLOSSARY.md` §5 (§9) |
| `parts` | Anatomy, in reading order. `?` marks an optional part |
| `variants` | The complete set. CF-174 matches it |
| `sizes` | `[compact, comfortable]` unless stated. Size follows region density by default |
| `states` | **All eight required states** — `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `empty` — plus `selected` or `checked` where it applies. Each is either a treatment or `n/a — <reason>`. A missing state is not an `n/a`; it is unfinished (CF-173) |
| `keyboard` | Every key the component handles |
| `aria` | Roles, names, relationships, live regions |
| `mirrors` | What changes in right-to-left |
| `tokens` | Every token consumed |

**Focus, universally:** a ring of `--b2s-focus-width` in `--b2s-color-focus` at `--b2s-focus-offset`, the offset filled with the surface the component sits on, so the ring meets 3:1 on every surface including over a filled primary action. Focus is shown for keyboard focus (`:focus-visible`) and never removed.

**Disabled, universally:** `text-subtle` on `sunken`, no pointer events, and still perceivable. Disabled is for actions that are impossible, never a way of signalling that a form is incomplete (§8).

---

## 6. Primitives

`UX_PRINCIPLES.md` §9 names seventeen primitives. Four are added, making twenty-one, and one composition: **`Field`**, because every input needs caption, help and error, and one component for that anatomy beats the same markup written seventeen times; **`TextLink`**, because navigation inside prose is needed on the sign-in surface already; **`Skeleton`** and **`Spinner`**, because the `loading` state every primitive declares needs something to render it. The composition is **`AppShell`**, in §7, because §9 lists navigation as something that mirrors but lists no navigation.

### Button

```component
name: Button
parts: [container, icon_start?, text, icon_end?, spinner?]
variants: [primary, secondary, quiet, danger]
sizes: [compact, comfortable]
states:
  default: primary is action fill with action-text; secondary is surface fill with border-control; quiet is text only; danger is danger-action fill with white text
  hover: primary to action-hover; secondary and quiet to sunken fill; danger to danger-action-hover
  focus: universal focus ring
  active: fill deepens one step; no movement, no scale
  disabled: universal disabled
  loading: spinner replaces icon_start; width locked to its idle width; text kept; aria-busy
  error: n/a — a button reports no value of its own; the error belongs to the field or notice its action produces
  empty: n/a — a button always has an accessible name
keyboard: [Enter activates, Space activates]
aria: native button element; an icon-only button carries an accessible name from the catalog; loading sets aria-busy and aria-disabled and never moves focus away
mirrors: icon_start and icon_end are logical; a directional icon flips by its registry flag
tokens: [control-height, control-padding-inline, radius-md, color-action, color-action-text, color-action-hover, color-surface, color-border-control, color-sunken, color-danger-action, color-danger-action-hover, color-focus, focus-width, focus-offset, text-body, icon-size, duration-quick, delay-loader]
```

**Use:** one `primary` per region, for the action the region exists for. `secondary` for alternatives. `quiet` for low-emphasis and repeated actions — every row action in a table. `danger` for irreversible actions only. Archiving is reversible and is `secondary`.

**Content:** a verb and its object — "Save brand", never "Submit" or "OK". The notice an action produces uses the same verb: "Save brand" produces "Brand saved". No trailing arrow glyphs.

**Don't:** use a button for navigation (that is `TextLink`), disable a submit button to signal invalid input, or put two primaries side by side.

### TextLink

```component
name: TextLink
parts: [text, icon_end?]
variants: [inline, standalone]
sizes: [compact, comfortable]
states:
  default: text colour, underlined
  hover: underline thickens to focus-width
  focus: universal focus ring
  active: text-muted
  disabled: n/a — a link that goes nowhere is text, not a disabled link
  loading: n/a — navigation owns loading at the destination
  error: n/a — a link carries no value
  empty: n/a — a link always has visible text
keyboard: [Enter follows]
aria: native anchor; opening a new window is announced by an icon with an accessible name
mirrors: icon_end is logical; the external-link arrow flips by its registry flag
tokens: [color-text, color-text-muted, color-focus, text-body]
```

**The underline is what makes it a link.** With no accent colour in the chrome, a link is never identified by colour — which WCAG requires anyway.

### Field

```component
name: Field
parts: [caption, optional_marker?, control_slot, help?, error?, counter?]
variants: [standard]
sizes: [compact, comfortable]
states:
  default: caption above the control; help below it in text-muted
  hover: delegated to the control
  focus: delegated to the control; the caption does not change
  active: delegated to the control
  disabled: caption and help in text-subtle
  loading: delegated to the control
  error: error line below help, danger icon plus message; the control's boundary becomes danger; aria-invalid on the control
  empty: n/a — emptiness is the control's value, validated on submit, not a visual state of the field
keyboard: [none of its own]
aria: the caption is an HTML label element bound to the control; help and error are wired with aria-describedby; error text is announced when it appears on submit
mirrors: none of its own; all parts stack in the block direction
tokens: [field-gap, text-sm, color-text, color-text-muted, color-text-subtle, color-danger, space-2, space-3]
```

**The caption is always visible and always above the control.** Never a floating label, never a placeholder standing in for a caption: both disappear exactly when someone needs them. Captions above rather than beside the control also survive the length difference between Arabic and English.

**Mark the optional fields, not the required ones.** The wizard is mostly required, so marking the few exceptions is less noise.

**Errors name the problem and the fix**, in the interface's voice, without apology (`UX_PRINCIPLES.md` §5). "Enter the trading name in Arabic", not "Invalid input".

**The identifier for the caption is `caption`**, not `label`. `GLOSSARY.md` §5 forbids `label` as an identifier because it names a packaging entity; the HTML `label` element is the platform's and is exempt.

### TextField

```component
name: TextField
parts: [container, prefix?, input, suffix?, clear_action?]
variants: [text, email, number, identifier, multiline]
sizes: [compact, comfortable]
states:
  default: surface fill, border-control boundary, radius-md
  hover: boundary to text-muted
  focus: universal focus ring; boundary to text
  active: n/a — text entry has no pressed state distinct from focus
  disabled: universal disabled
  loading: spinner in the suffix position while a value is validated remotely; input stays editable
  error: boundary to danger; Field shows the message
  empty: placeholder in text-subtle where one helps; never carries the caption
keyboard: [native text entry, Escape clears when clear_action is present]
aria: native input or textarea inside Field; number uses inputmode decimal; identifier sets spellcheck off and autocapitalize off
mirrors: prefix and suffix are logical; identifier and email inputs are left-to-right and isolated in either locale
tokens: [control-height, control-padding-inline, radius-md, color-surface, color-border-control, color-text, color-text-subtle, color-danger, color-focus, text-body]
```

**`number`** — for money, quantities and percentages. On input it accepts Latin **and** Arabic-Indic digits and both decimal separators, and normalises them before validation, because a person on an Arabic keyboard or pasting from another document may produce either. On blur it redisplays through the R1-25 formatter. The currency symbol sits in the `suffix`, after the value, as R1-25 defines.

**`identifier`** — SKUs, GTINs, batch and invoice numbers. **Never normalised and never re-digited.** A scanned code has to match what is printed character for character, so an Arabic-Indic digit typed into an identifier is refused with a named error — "Use the digits 0 to 9" — rather than silently converted.

**`multiline`** — grows with content to a limit, then scrolls. Guideline bodies use it through `BilingualField`.

### BilingualField

```component
name: BilingualField
parts: [caption, locale_group_primary, locale_group_secondary, completion_indicator, help?, error?]
variants: [single, multiline]
sizes: [compact, comfortable]
states:
  default: two inputs stacked, each with a visible locale tag; the primary locale first
  hover: delegated to each input
  focus: universal focus ring on the focused input; the other input is unchanged
  active: n/a — as TextField
  disabled: both inputs disabled together
  loading: n/a — both values are local until the form saves
  error: the message names the missing or invalid locale; only that input takes the danger boundary
  empty: each empty locale is marked as missing by name in the completion indicator
  complete: completion indicator shows both locales filled
keyboard: [Tab moves from the primary locale input to the secondary]
aria: one caption for the group; each input's accessible name is the caption and its locale name, both from the catalog; the completion indicator is text, not only an icon
mirrors: each input takes its own locale's direction regardless of the page's direction; the group stacks in the block direction and does not mirror
tokens: [field-gap, control-height, radius-md, color-surface, color-border-control, color-text, color-text-muted, color-success, color-warning, color-danger, text-sm, text-body]
```

**One control, two locales** (`UX_PRINCIPLES.md` §6). It maps to one `TranslationKey` and its two `TranslationEntry` rows (`BRAND_CONFIG.md` §3).

**Order is the tenant's `default_locale` first**, then the other. That keeps the order stable for a tenant whatever interface language a member happens to be using, so the Arabic field is always where that tenant's people expect it.

**It saves while incomplete and cannot be complete while incomplete.** A draft keeps partial values; "complete" requires both. The field's error names the missing locale, and a renderer later names it again rather than falling back to the other language.

### Select

```component
name: Select
parts: [trigger, value, chevron, listbox?, search_input?, options]
variants: [native, searchable]
sizes: [compact, comfortable]
states:
  default: TextField boundary and fill; chevron at inline-end
  hover: boundary to text-muted
  focus: universal focus ring
  active: listbox open, elevation-1
  disabled: universal disabled
  loading: spinner replaces the chevron while options load; the trigger stays focusable
  error: boundary to danger; Field shows the message
  empty: searchable variant with no match shows a named no-results line in the listbox
  selected: the chosen option carries a check and aria-selected
keyboard: [native select handles its own keys; searchable opens on Enter, Space or ArrowDown, moves with arrows, selects on Enter, closes on Escape, type-ahead filters]
aria: native uses the select element; searchable follows the combobox pattern with a listbox popup
mirrors: chevron at inline-end; listbox aligns to inline-start of the trigger
tokens: [control-height, radius-md, color-surface, color-raised, color-border-control, color-text, color-text-subtle, elevation-1, color-focus]
```

**`native` for short lists with no search** — it is the most robust option on every device and screen reader, and on a phone it opens the platform picker. **`searchable` for long lists**: the tenant switcher now, product and buyer pickers later. The identifier for the choices is `options`, never `items`.

### Checkbox

```component
name: Checkbox
parts: [box, check_mark, caption]
variants: [standard, indeterminate]
sizes: [compact, comfortable]
states:
  default: check-size box, border-control boundary, radius-sm
  hover: boundary to text
  focus: universal focus ring around the box
  active: box fill to sunken
  disabled: universal disabled
  loading: n/a — a checkbox commits nothing on its own; it is submitted with its form
  error: boundary to danger; Field shows the message
  empty: n/a — unchecked is the checkbox's value, not an empty state
  checked: action fill, action-text check mark
keyboard: [Space toggles]
aria: native input of type checkbox; indeterminate sets the native indeterminate property
mirrors: box at inline-start of its caption
tokens: [check-size, radius-sm, color-border-control, color-action, color-action-text, color-focus, text-body]
```

**The whole row is the hit target**, not just the box; the caption is a bound label.

### RadioGroup

```component
name: RadioGroup
parts: [group_caption, options]
variants: [vertical, horizontal]
sizes: [compact, comfortable]
states:
  default: check-size circles, border-control boundary
  hover: boundary to text
  focus: universal focus ring on the focused option
  active: circle fill to sunken
  disabled: universal disabled
  loading: n/a — submitted with its form
  error: boundaries to danger; Field shows the message
  empty: n/a — a group always offers at least two options, and no option selected is a validation state
  checked: action-filled inner dot
keyboard: [Arrow keys move and select within the group, in visual direction; Tab enters and leaves the group]
aria: fieldset with legend as the group caption; native radio inputs
mirrors: options run from inline-start; arrow keys follow visual direction
tokens: [check-size, color-border-control, color-action, color-focus, space-3, text-body]
```

**`horizontal` for two or three short options only**; anything else is vertical.

### Switch

```component
name: Switch
parts: [track, thumb, caption, state_text]
variants: [standard]
sizes: [compact, comfortable]
states:
  default: track sunken with border-control boundary; thumb at inline-start
  hover: track boundary to text
  focus: universal focus ring around the track
  active: thumb widens by space-1 while pressed
  disabled: universal disabled
  loading: thumb shows a spinner while the setting saves; switch stays in its new position
  error: switch returns to its previous position and a Notice names what failed
  empty: n/a — a switch is always on or off
  checked: track action fill; thumb at inline-end
keyboard: [Space toggles, Enter toggles]
aria: role switch with aria-checked; the caption names the setting and the state text reads on or off from the catalog
mirrors: the thumb moves from inline-start to inline-end, so it travels right-to-left in Arabic
tokens: [radius-full, color-sunken, color-border-control, color-action, color-action-text, duration-base, ease-standard, color-focus]
```

**A switch takes effect immediately** — the theme, a notification preference. A value submitted with a form is a `Checkbox`. State is never carried by colour alone: the text says on or off.

### FileDrop

```component
name: FileDrop
parts: [drop_zone, instruction, browse_button, constraints_text, file_list]
variants: [single, multiple]
sizes: [comfortable]
states:
  default: dashed border-control boundary, instruction and the accepted types and size limit
  hover: boundary to text
  focus: universal focus ring on browse_button
  active: drag-over — boundary solid, fill sunken, instruction says drop to upload
  disabled: universal disabled
  loading: per file — uploading with determinate progress and a formatted percentage, then processing while renditions are generated, indeterminate
  error: per file — a named error for type, size or failure, with retry; nothing else in the list is affected
  empty: the default state is the empty state
  done: per file — thumbnail, file name isolated, formatted size, replace and remove actions outside any brand frame
keyboard: [browse_button is a Button; each file's actions are Buttons]
aria: dragging is never the only way — browse_button always works; progress uses a progressbar role with a formatted value; completion is announced politely
mirrors: file name isolated left-to-right; actions at inline-end
tokens: [radius-md, color-border-control, color-sunken, color-text, color-text-muted, color-danger, color-success, space-5, text-sm]
```

**Always `comfortable`.** An upload is a brand task, never a dense operation. The accepted types and size limit come from the consuming module's specification, not from this component; the component only shows them. Where the object lands is `ADR-008` and `OD-G20`'s business, not this document's.

### ColorField

```component
name: ColorField
parts: [swatch, hex_input, picker_button?, contrast_readout?]
variants: [standard, paired]
sizes: [compact, comfortable]
states:
  default: swatch at inline-start showing the stored value; hex input left-to-right and isolated
  hover: boundary to text-muted
  focus: universal focus ring on the focused part
  active: native picker open
  disabled: universal disabled
  loading: n/a — the value is local until the form saves
  error: value refused unless it matches ^#[0-9a-f]{6}$ after normalisation; Field names the problem
  empty: swatch shows a named no-colour pattern; never a default colour pretending to be the brand's
keyboard: [native text entry in hex_input; picker_button opens the platform picker]
aria: swatch is decorative with the value exposed as text; contrast_readout is text stating the ratio and pass or fail, never colour alone
mirrors: swatch at inline-start; hex input always left-to-right
tokens: [control-height, radius-sm, radius-md, color-border-control, color-success, color-danger, text-sm]
```

**The hex value is normalised to lowercase with a leading `#`**, because `DATA_MODEL.md` constrains `color_value.srgb` to `^#[0-9a-f]{6}$`.

**`paired`** is for `foreground` and `background` in the brand theme editor. It shows the live contrast ratio between the two and whether it meets `BRAND_CONFIG.md` §11's constant of 4.5:1 (§0 item 4). The ratio is a formatted number.

**The swatch is data, not a brand token** (§3 rule 7).

### DateField

```component
name: DateField
parts: [text_input, calendar_button, calendar_popover?]
variants: [single]
sizes: [compact, comfortable]
states:
  default: TextField appearance; display format from the locale definition
  hover: boundary to text-muted
  focus: universal focus ring
  active: calendar_popover open, elevation-1
  disabled: universal disabled
  loading: n/a — dates are local until the form saves
  error: an unparseable or out-of-range date is named with the expected format
  empty: placeholder shows the expected format from the catalog
  selected: the chosen day in the grid carries action fill
keyboard: [typing a date is always allowed; the calendar grid moves with arrow keys in visual direction, PageUp and PageDown change month, Home and End go to the week's start and end, Enter selects, Escape closes]
aria: the text input is the primary control; the calendar follows the date-picker dialog pattern with grid semantics
mirrors: the calendar grid runs from inline-start; weekday order starts from the locale's first day of the week
tokens: [control-height, radius-md, color-surface, color-raised, color-border-control, color-action, color-action-text, elevation-1, color-focus]
```

**Display order, calendar and first weekday come from `CALC_SPEC.md` R1-25's locale block** (§0 item 3) — `DD/MM/YYYY`, Gregorian, weeks from Saturday — and are never restated in code. Stored and transmitted as ISO 8601. **Typing is never slower than picking** — the calendar is an aid, not a gate.

### DataTable

```component
name: DataTable
parts: [container, header_row, sort_control?, selection_cell?, body_rows, cells, row_actions?, bulk_action_bar?, pagination, status_region]
variants: [standard, selectable]
sizes: [compact, comfortable]
states:
  default: surface fill; sunken header; row-height by density; dividers of border-width in border between rows
  hover: row fill to sunken
  focus: universal focus ring on the focused interactive element within a row
  active: n/a — a row is not itself a control; its actions are
  disabled: n/a — a row that cannot be acted on shows no actions rather than disabled ones
  loading: skeleton rows at the current row height, preserving column widths, after delay-loader
  error: one full-width row within the body naming what failed, with retry and the request identifier
  empty: two distinct cases — first use says what goes here and offers the action that creates the first row; no results says nothing matches the filters and offers to clear them
  selected: row fill to sunken with a checked selection cell; bulk_action_bar shows the formatted count
keyboard: [Tab moves through interactive elements only; Space toggles the focused row's selection; sort controls are Buttons]
aria: native table element with th scope; sort state via aria-sort on the header; the status region announces result counts and completed bulk actions
mirrors: column order follows reading direction; the selection column sits at inline-start and row_actions at inline-end; a sticky first column sticks at inline-start
tokens: [row-height, cell-padding-block, cell-padding-inline, border-width, color-surface, color-sunken, color-border, color-text, color-text-muted, text-body, radius-md, delay-loader]
```

**Numbers:** end-aligned, tabular, and only through the R1-25 formatter. **Identifiers are never truncated**, because a truncated SKU cannot be matched; prose truncates with the full value available on hover and on focus. **Numbers are never truncated.**

**A table scrolls inside its own container** (`UX_PRINCIPLES.md` §8), with a sticky header and, where the first column identifies the row, a sticky first column.

**Native table semantics, not the grid pattern**, in Release 1. The grid pattern's keyboard model is heavy and easy to break, and native semantics give screen readers the structure they already understand. Revisit only when a real workflow needs cell-by-cell editing.

**Pagination** shows a formatted range and total. The page size is a member preference.

### Tabs

```component
name: Tabs
parts: [tab_list, tabs, panels]
variants: [standard]
sizes: [compact, comfortable]
states:
  default: tabs as text in text-muted; the list carries an underline of indicator-width in border
  hover: tab text to text
  focus: universal focus ring on the focused tab
  active: n/a — activation is selection
  disabled: universal disabled, and skipped by arrow keys
  loading: the selected panel shows Skeleton; the tab list stays usable
  error: the selected panel shows ErrorState; other tabs stay usable
  empty: the selected panel shows EmptyState
  selected: tab text in text, an underline of indicator-width in action
keyboard: [Arrow keys move between tabs in visual direction, Home and End jump to first and last, Enter or Space activates]
aria: tablist, tab and tabpanel roles with aria-selected and aria-controls
mirrors: tab order follows reading direction; ArrowLeft moves to the next tab in right-to-left
tokens: [space-4, space-5, indicator-width, color-text, color-text-muted, color-border, color-action, text-body, weight-500]
```

**Manual activation** — arrows move focus, Enter or Space selects — wherever a panel loads data, so moving through tabs does not fire a request per tab.

### Dialog

```component
name: Dialog
parts: [scrim, container, title, description?, body, footer_actions, close_button]
variants: [standard, confirmation]
sizes: [small, medium, large]
states:
  default: raised fill, elevation-2, radius-lg; backdrop in color-scrim
  hover: n/a — the dialog is a container
  focus: focus moves into the dialog on open and is trapped until close
  active: n/a — the dialog is a container
  disabled: n/a — a dialog that cannot be used is not opened
  loading: footer primary shows its loading state; the dialog stays open
  error: an inline Notice at the top of the body names the failure; the dialog stays open
  empty: n/a — a dialog always has content
keyboard: [Escape closes unless a destructive action is pending, Tab cycles within, Enter submits when a form's primary action is focusable]
aria: role dialog with aria-modal true, labelled by the title, described by the description; focus returns to the trigger on close
mirrors: close_button at inline-end of the title; footer actions from inline-end, primary last in reading order
tokens: [color-raised, color-scrim, elevation-2, radius-lg, dialog-width-small, dialog-width-medium, dialog-width-large, space-7, text-xl, duration-enter, duration-exit, ease-enter, ease-exit]
```

**Sizes:** `small` for confirmations, `medium`, `large` — `--b2s-dialog-width-*`. **Below 640px every dialog becomes a full-height bottom sheet.** The size identifiers are `small`, `medium` and `large`, not densities.

**Confirmations name the object and the consequence**, and the confirm button repeats the verb: "Archive the line *Fruit Bites*? It stops appearing in new packaging and can be restored" with **Archive line**, never "OK". Initial focus on a confirmation goes to the least destructive action. **Dialogs never stack.**

### Notice

```component
name: Notice
parts: [status_icon, title, message, request_identifier?, actions?, dismiss_button?]
variants: [toast, inline]
sizes: [comfortable]
states:
  default: raised fill with a status-coloured bar of status-bar-width at inline-start; toast uses elevation-3
  hover: toast auto-dismiss pauses
  focus: universal focus ring on its actions; auto-dismiss pauses while focus is inside
  active: n/a — a notice is not itself a control
  disabled: n/a — a notice has no disabled form
  loading: n/a — a notice reports an outcome, not a pending action
  error: the danger tone — persists until dismissed, carries the request identifier with a copy action
  empty: n/a — a notice always has a message
keyboard: [its actions are Buttons; Escape dismisses a focused toast]
aria: success and info use role status, polite; danger uses role alert, assertive; warning uses status unless it blocks work
mirrors: toasts stack at the inline-end bottom corner; the status bar sits at inline-start
tokens: [color-raised, elevation-3, radius-lg, status-bar-width, color-success, color-warning, color-danger, color-info, space-5, text-sm, duration-enter, duration-exit, notice-dismiss]
```

**Toasts:** at most three stacked; success and info dismiss after `--b2s-notice-dismiss`, paused on hover and focus; **warning and danger stay until dismissed**. **Inline notices** sit inside the section they concern and persist.

**Never for validation.** A field's error belongs to the field. A notice is for the outcome of an action.

**A server error always carries the request identifier** (OD-H13) — isolated, copyable — and says what to do next. It never discloses whether an address, tenant or record exists (`SECURITY_MODEL.md` §2).

### Tooltip

```component
name: Tooltip
parts: [trigger_reference, bubble, pointer]
variants: [standard]
sizes: [compact]
states:
  default: hidden
  hover: shows after delay-tooltip on hover
  focus: shows immediately when the trigger takes keyboard focus
  active: n/a — a tooltip is not interactive
  disabled: n/a — tooltips are never attached to disabled triggers, which cannot take focus
  loading: n/a — tooltip text is static
  error: n/a — a tooltip carries no value
  empty: n/a — a tooltip always has text
keyboard: [Escape dismisses]
aria: the trigger's aria-describedby references the bubble; the bubble has role tooltip
mirrors: placement is logical; the pointer follows the placement
tokens: [color-text, color-surface, elevation-1, radius-sm, text-xs, space-2, space-3, duration-quick, delay-tooltip]
```

**Supplementary only.** Never the only place essential information lives, never interactive content, no more than about sixty characters. It is how a truncated value is shown in full on hover and focus.

### StatusBadge

```component
name: StatusBadge
parts: [status_icon?, text]
variants: [neutral, success, warning, danger, info]
sizes: [compact]
states:
  default: tone background with tone text, radius-sm
  hover: n/a — a badge is not interactive
  focus: n/a — a badge is not focusable
  active: n/a — a badge is not interactive
  disabled: n/a — a badge reports a state; it has no disabled form
  loading: n/a — a badge reports a settled state; pending is its own status text
  error: the danger variant
  empty: n/a — a badge always has text
keyboard: [none]
aria: plain text; status is never carried by colour alone — the text always states it
mirrors: icon at inline-start
tokens: [radius-sm, color-success-bg, color-warning-bg, color-danger-bg, color-info-bg, color-sunken, text-xs, space-1, space-2, weight-500]
```

### BrandFrame

```component
name: BrandFrame
parts: [mount_boundary, surround, brand_canvas, brand_content, gap_markers?]
variants: [preview, editor_preview]
sizes: [comfortable]
states:
  default: brand_canvas in --brand-background inside a neutral surround and a boundary of border-width in border-control
  hover: n/a — the frame is a container; its content is brand-rendered and not a platform control
  focus: n/a — nothing inside the frame is a platform control; editing affordances live outside it
  active: n/a — the frame is a container
  disabled: n/a — a frame that cannot render shows its error or empty state instead
  loading: surround shows Skeleton at the frame's size while the profile resolves
  error: surround shows a named error — the profile could not be resolved — with the request identifier
  empty: the brand has no current profile — named, with the action to finish the brand outside the frame
  incomplete: renders what exists and places a named gap marker for each missing role, locale string or typeface pair
keyboard: [none of its own]
aria: region labelled with the brand or line name; gap markers are text, not colour alone
mirrors: brand_content follows the direction of the locale being previewed, which may differ from the interface's
tokens: [border-width, color-border-control, space-5, brand-primary, brand-secondary, brand-accent, brand-background, brand-foreground, brand-muted, brand-critical, brand-font-heading-latin, brand-font-heading-arabic, brand-font-body-latin, brand-font-body-arabic]
```

**The only component allowed to consume `--brand-*` tokens**, and the only one that defines them (§3). **The previewed locale can differ from the interface locale**: a member working in English can preview the Arabic label, and the frame renders that content right-to-left inside a left-to-right page.

### Skeleton

```component
name: Skeleton
parts: [shapes]
variants: [text, block, table_rows]
sizes: [compact, comfortable]
states:
  default: sunken shapes matching the final layout's size and rhythm
  hover: n/a — not interactive
  focus: n/a — not focusable
  active: n/a — not interactive
  disabled: n/a — a placeholder has no disabled form
  loading: this primitive is the loading state; a slow opacity pulse, removed under reduced motion
  error: n/a — replaced by ErrorState
  empty: n/a — replaced by EmptyState
keyboard: [none]
aria: aria-hidden; the containing region carries aria-busy
mirrors: shapes follow reading direction
tokens: [color-sunken, radius-sm, row-height, duration-pulse, delay-loader]
```

**Content areas only**, and only after `--b2s-delay-loader` so fast responses never flash a placeholder. **It reserves the final layout's space**, so nothing shifts when content arrives.

### Spinner

```component
name: Spinner
parts: [arc]
variants: [standard]
sizes: [compact, comfortable]
states:
  default: a rotating 270-degree arc in the current text colour
  hover: n/a — not interactive
  focus: n/a — not focusable
  active: n/a — not interactive
  disabled: n/a — has no disabled form
  loading: this primitive is the loading state; under reduced motion the arc stops and the containing control's text states it is working
  error: n/a — its container reports the error
  empty: n/a — has no content
keyboard: [none]
aria: aria-hidden; the containing control carries aria-busy
mirrors: none — rotation direction does not mirror
tokens: [icon-size, color-text, duration-base, delay-loader]
```

**Actions and indeterminate waits only.** Never both a spinner and a skeleton for the same wait.

---

## 7. Shared compositions

### AppShell

The frame of every signed-in page: **header**, **navigation**, **main**.

- **Header:** `PageHeader` — tenant logo, `TenantSwitcher`, locale switch, theme switch, account menu.
- **Navigation:** at `lg` and above, a side navigation fixed at inline-start; below `lg`, a drawer opened from the header. The current section is marked by weight and an inline-start bar of `--b2s-indicator-width`, never by colour alone.
- **Main:** full width for tables; forms and wizards capped at `--b2s-measure-form`.
- **A skip link** is the first focusable element and moves focus to `main`. Landmarks: `banner`, `navigation`, `main`.

### PageHeader

**The tenant's logo** uses the `LogoVariant` whose ground matches the platform theme: the `light`-ground variant in the light theme, `dark` in the dark. **If that combination does not exist, the tenant's name renders as text** — never a different variant pressed into service, and never a platform placeholder mark (`BRAND_CONFIG.md` §9). Logo height is `--b2s-logo-height`. **No B2S mark appears here or anywhere a tenant's output can reach** (OD-G21).

### TenantSwitcher

Lists the member's active memberships by tenant name and mark; `searchable` beyond seven. **Switching sets the per-request selector and persists nothing** — no storage, no cookie, no remembered choice — because OD-G14 forbids storing a last-selected tenant. The switcher shows the tenant the current request resolved, not a remembered one.

### FormSection

A title, a one-sentence description, fields in one column at `field-gap`, and optional section-level actions. One column always: two-column forms break reading order and translate badly between the two directions.

### Filtered data table

A filter bar above `DataTable`: search, then filters. Active filters appear as removable chips, "Clear filters" returns to the unfiltered set, and the result count is a formatted number announced in the status region. The no-results empty state is distinct from first use.

### EmptyState

A title saying what goes here, one sentence on why it matters or how it fills, and one primary action. **First use** invites creation. **No results** offers to clear the filters. An empty screen is an invitation to act, never a mood.

### ErrorState

What failed, in plain words; what to do next; a retry action; and the request identifier, isolated and copyable (OD-H13). Nothing that discloses whether an address, tenant or record exists (`SECURITY_MODEL.md` §2). No apology.

### WizardStep

- **Stepper:** numbered, because onboarding genuinely is a sequence. Steps are completed, current or upcoming. Completed steps are reachable; upcoming ones are not until reached. Progress is also stated in text — "Step 2 of 6" — so it is never carried by the graphic alone.
- **Body:** a step title at `3xl`, one sentence of purpose, then one or more `FormSection`s.
- **Footer:** **Back** as `quiet` at inline-start, **Continue** as `primary` at inline-end, and **Save and finish later** as `secondary`, because the wizard is resumable (`BRAND_CONFIG.md` §10).
- **Validation on Continue:** an error summary appears at the top, lists each problem as a link to its field, and takes focus. Each field also shows its own error. Input is always preserved.

---

## 8. Patterns

**Forms and validation.** Format is validated on blur, completeness on submit, and never on the first keystroke. **Submit is never disabled to signal an incomplete form**; the person submits and the form says what is missing, which is both more accessible and more honest. Input is never lost on error. Leaving a form with unsaved changes asks first.

**Writes the server may refuse are never rendered optimistically.** Row-level isolation can refuse a write, and a refused optimistic update shows the person something that is about to be taken back. The control shows its pending state until the result is known.

**Perceived performance.** A loader appears only after `--b2s-delay-loader`. Skeletons for content, spinners for actions, never both for one wait. Layout is reserved in advance so nothing shifts as content arrives.

**Keyboard.** Focus is always visible and follows reading order. **No single-character shortcuts in Release 1**, because WCAG 2.2 2.1.4 requires that they can be turned off or remapped, and the operations half does not need them to be fast.

**Content.** Every visible string comes from the catalogs (`UX_PRINCIPLES.md` §4). Sentence case, active verbs, and the same verb through a flow. Errors say what happened and how to fix it, without apology. Prose may truncate with the full text available on hover and focus; identifiers and numbers never truncate.

---

## 9. Identifiers in this catalog

Component, prop, part, variant and token names are identifiers, and `GLOSSARY.md` §5 binds them.

| Instead of | This catalog uses | Because §5 forbids |
|---|---|---|
| `label` | `caption` | `label` — a packaging entity |
| `items` | `options` | `item` |
| `studio`, `operations` as density | `comfortable`, `compact` | `studio` |
| `order` for sorting | `direction` | `order` — `SalesOrder`, `PurchaseOrder` |
| `asset` | `media` | `asset` — `MediaAsset` |
| `line-height` | `leading` | `line` — `InvoiceLine` |
| `template`, `preset`, `design`, `output` | not used | all four |

HTML elements and ARIA attributes — the `label` element, `aria-label` — are the platform's vocabulary and are exempt.

---

## 10. Gate traceability

Every gate the catalog landing task builds, and the part of this document it holds.

| Gate | Tier | Holds | What it reads |
|---|---|---|---|
| CF-168 | Static | §4 rule 2 | Style sources for physical `left` and `right` properties |
| CF-169 | Static | `UX_PRINCIPLES.md` §4; §4 rule 11 here | `en` and `ar` key sets, including every plural category |
| CF-170 | Static | `UX_PRINCIPLES.md` §4 (CF-74) | Duplicate values per catalog namespace |
| CF-171 | Static | §3 rules 2 and 7 | `--brand-*` references outside `BrandFrame`; `--b2s-*` references inside it |
| CF-172 | Static | §2.1; §1; §0 items 1 and 2 | Raw colour, spacing, radius, duration, shadow or font-family values outside token definitions; every chrome neutral achromatic; font families only the two `OD-G23` names |
| CF-173 | Static | §5; every `component` block | Each primitive implements every state not marked `n/a` |
| CF-174 | Static | Every `component` block | Variant and size names match exactly |
| CF-175 | Static | §4 rule 6; `TextField` `number` | Formatted numbers only through the R1-25 formatter |
| CF-176 | Component-rendered | Every `aria` line; `ADR-014` | Accessible name, role and label, every state, both locales. Layout-dependent rules, colour contrast among them, are excluded here by an asserted list and owned by CF-177 |
| CF-177 | Browser-rendered | §2.2 | AA contrast, light and dark, as rendered |
| CF-178 | Browser-rendered | §2.7, §2.9, `AppShell` | 360px and desktop; no horizontal page scroll |
| CF-179 | Browser-rendered | §4 | Every primitive in `ar`; mirroring and the never-mirror exceptions |
| CF-180 | Acceptance | §11 | The wizard's first step from primitives alone |

---

## 11. Acceptance: the wizard's first step, from primitives alone

The catalog is finished when the first real screen it exists for can be built from it with **no page-level styling at all** (CF-180). Inventory is not the test; composition is.

**The screen:** "Company identity" — `BRAND_CONFIG.md` §10's first row: legal name and trading name, landing on `tenant` through `TranslationKey`.

```
AppShell
└─ WizardStep  (step 1 of N, comfortable)
   ├─ FormSection  "Company identity"
   │  ├─ BilingualField  legal name     (tenant default_locale first)
   │  └─ BilingualField  trading name
   └─ footer
      ├─ Button quiet      Back                  (inline-start; absent on step 1)
      ├─ Button secondary  Save and finish later
      └─ Button primary    Continue              (inline-end)
```

**It passes when**, in both locales and both themes, at 360px and at desktop width:

1. The page's own stylesheet contains no rule — only composition.
2. Continue with one locale of the legal name empty shows the error summary with a link to that field, focus on the summary, and the field's error naming the missing locale.
3. In Arabic the stepper, footer and field order flow right-to-left; the English input inside each `BilingualField` stays left-to-right.
4. Every string comes from the catalogs, with `en` and `ar` holding identical key sets.
5. Every interactive element is reachable by keyboard in reading order with a visible focus ring, and meets AA contrast.
6. Save and finish later preserves both partial values.

---

## 12. What this forecloses

- A chrome neutral with any tint, and with it a surround that shifts how a brand's colour is judged.
- A platform accent colour of any hue, including gold.
- A brand token outside `BrandFrame`, a platform token inside it, and a platform control inside a brand.
- A physical `left` or `right` anywhere in the catalog.
- Letter-spacing on text that may be Arabic, and all-caps text anywhere.
- A monospace face for data.
- A number assembled by hand, and an identifier re-digited, normalised or truncated.
- A string built by concatenation, and a counted string without every plural category.
- A placeholder standing in for a caption, and a submit button disabled to signal an incomplete form.
- An optimistic write the server may refuse.
- A remembered tenant selection.
- A value the implementer chooses because this document did not state it.
