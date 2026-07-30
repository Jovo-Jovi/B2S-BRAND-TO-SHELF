# Balance Bites — Unification & Deployment Proposal (Phase 5)

> How to merge six single-file HTML tools into ONE white-label web app, deployable on GitHub + Vercel, where **Balance Bites is just the first tenant/preset**.

---

## 1. Architecture recommendation

**Origin constraints that must survive the port**
- Print fidelity is business-critical (labels, cartons, stands, invoices in real cm/mm). The best existing tool already does **dual-DOM real-unit printing** (`balance-bites-stand.html:680-687`). Any framework choice must preserve deterministic, real-unit print output.
- All current logic is client-side vanilla JS. There is a lot of it (~13k lines) and it is tightly coupled to DOM ids.
- The data tools currently coordinate through a **shared on-disk folder** (File System Access API + IndexedDB handle) that cannot exist on Vercel.

**Options considered**

| Option | Pros | Cons |
|---|---|---|
| **A. Vite + React SPA (static) on Vercel** | Component reuse for the shared shell (preset bar, wizard, toasts); clean state mgmt; keeps everything client-side so print stays 100% in-browser and deterministic; trivial static deploy; can add Supabase later without a server. | Print components must be authored carefully (React re-render vs. print DOM); rewrite effort. |
| **B. Next.js on Vercel (App Router)** | SSR/routing/auth-ready; API routes for a future hosted DB; good multi-tenant story. | SSR is irrelevant for print-heavy client tools; heavier; risk of hydration quirks around the print DOM; more than the problem needs today. |
| **C. Structured vanilla JS ES modules (no framework)** | Smallest conceptual jump from today's code; least rewrite; no build required. | Re-implementing state/reactivity, wizard, and multi-profile switching by hand is exactly the duplication we're trying to kill; harder to maintain long-term. |

**Recommendation: Option A — Vite + React SPA, deployed as a static site on Vercel**, with a storage abstraction that starts on IndexedDB/localStorage and can later point at Supabase.
Rationale: it removes the duplicated shell code, keeps printing fully client-side and deterministic (each module owns a real-unit print component), deploys statically with zero server cost, and leaves a clean seam to add Supabase auth + Postgres when multi-tenant hosting is needed. Next.js (B) adds SSR weight the print tools don't benefit from; pure vanilla (C) forces us to re-hand-roll the very shell we want to unify.

Suggested stack: **Vite + React + TypeScript**, Zustand (or React context) for state, `zod` for BrandConfig validation, `idb-keyval` for the local storage adapter, and a thin `DataStore` interface (see §3).

---

## 2. White-label design + Brand Onboarding Wizard

### 2.a `BrandConfig` JSON schema (derived from the Phase-2E registries)

Every hardcoded value found in the audit maps to a key below. Defaults are the current Balance Bites values, shipped as the `balance-bites` preset profile (§2.e).

```jsonc
{
  "schemaVersion": 1,
  "id": "balance-bites",
  "brand": {
    "name": "Balance Bites",           // stock:381, carton:93, stand:149-150 (two-line)
    "nameLines": ["BALANCE", "BITES"],  // stand splits brand into 2 lines
    "monogram": "BB",                    // stock:3515, carton:89, stand:151
    "slogan": "Natural · Wholesome · Delicious", // carton:96
    "taglineEn": "WHOLE FOOD SNACKS · NATURALLY POWERFUL", // stand:152
    "taglineAr": "وجبات خفيفة طبيعية · قوية بالطبيعة",      // stand:153
    "cta": "Try Our Natural Crackers!", // stand:154
    "web": "balancebites.com",          // stock:3516, carton:97, stand:155
    "logo": { "type": "monogram|image", "dataUrl": null }, // base64/blob if uploaded
    "contact": {
      "phone": "+20 123 456 7890",       // stand:161
      "email": null,
      "address": null,
      "instagram": "@balancebites.eg"    // stand:160
    }
  },
  "theme": {
    "colors": {
      "primary": "#c9a84c",  // gold — everywhere
      "background": "#060603",
      "surface": "#0e0d0a",  // row/card
      "text": "#e8dfc8",
      "muted": "#7a6f58",
      "accent": "#3a8a7a"    // carton accent
    },
    "presets": [             // named palettes (stock:1142-1146)
      {"id":"dark-gold","name":"Dark Gold","bg":"#0a0804","gold":"#c9a84c","txt":"#e8e0cc","mut":"#6b5e3a","row":"#12100a"},
      {"id":"obsidian-blue","name":"Obsidian Blue","bg":"#04060c","gold":"#6ba3d4","txt":"#d0dce8","mut":"#3a5070","row":"#070b14"},
      {"id":"forest-night","name":"Forest Night","bg":"#040804","gold":"#7dab6e","txt":"#d0e8cc","mut":"#3a5c38","row":"#080e06"},
      {"id":"warm-ivory","name":"Warm Ivory","bg":"#faf6ef","gold":"#8a6010","txt":"#2a1a06","mut":"#8a7050","row":"#f4ede0"}
    ],
    "fonts": {
      "heading": "Playfair Display",
      "body": "DM Sans",
      "accent": "Syne",
      "arabic": "Tajawal",
      "script": "Caveat"     // flavor script on carton/label
    }
  },
  "locale": {
    "currency": "EGP",       // pervasive
    "currencyFormat": "ar-EG", // stock:3649 toLocaleString
    "languages": ["ar", "en"],
    "primaryDir": "rtl",
    "taxRate": 0             // CONFIRMED: no VAT field exists; invoice-pro has only a discount % (invoice-pro:517,1109). Prices are tax-inclusive.
  },
  "catalog": {
    "flavors": ["Za'atar", "Paprika", "Rosemary & Basil", "Black Pepper & Sea Salt", "Cinnamon Roasted Peanuts"], // stand:182-191
    "flavorColors": ["#2e7d32","#c62828","#f9a825","#1565c0","#bf360c"], // stand:166-174
    "productTypes": ["Crackers"],       // carton:95
    "weights": ["40G"],                 // carton/stand
    "defaultPrice": "EGP 45",           // stand:196
    "badges": ["100% Natural","Whole Wheat","No Preservatives","For Diet","For Diabetes"], // carton:101-103, stand:306-342
    "ingredients": {
      "en": "Whole wheat flour, olive oil, sea salt, za'atar. Contains: Wheat.", // carton:121
      "ar": "دقيق قمح كامل، زيت زيتون، ملح بحر، زعتر. يحتوي على: قمح."          // carton:122
    },
    "opCostCategories": ["إيجار","مرافق","أجور","صيانة","نقل","تسويق","أخرى"],   // stock:779-786
    "returnReasons": ["تالف","خطأ في الطلب","جودة","رفض العميل","أخرى"]           // stock:950-954
  },
  "invoice": {
    "docTitle": "فاتورة · Invoice",     // invoice-pro:511,1107 / stock:3515
    "footNote": "شكراً لثقتكم · Thank you for your order", // invoice-pro:513,1108
    "discountLabel": "خصم · Discount",  // invoice-pro:520,1109 (a % discount, NOT VAT)
    "numberFormat": "#INV-{SEQ3}",      // CONFIRMED: '#INV-001', max(existing)+1 padStart(3) (invoice-pro:816,1912,2609)
    "numberPerCustomer": false,         // CONFIRMED optional per-customer numbering exists (invoice-pro:2600-2609)
    "labels": { "item": "المنتج · Item", "qty": "الكمية", "price": "سعر الوحدة", "subtotal": "الإجمالي" } // invoice-pro:523-531
  },
  "print": {
    "invoice": { "page": "A4", "orientation": "portrait", "margins": {"t":16,"r":14,"b":16,"l":14} }, // invoice-pro:261 / stock:3523,3641
    "reports": { "page": "A4", "margins": "10mm 12mm" },      // stock:4278
    "priceList": { "page": "A4", "margins": "12mm 14mm" },    // invoice-pro:1626
    "carton":  { "page": "A3", "orientation": "landscape", "margin": "8mm" }, // carton:68
    "stand":   { "mode": "actual|A3|A2", "pxPerMm": 3.78 },   // stand:457,374
    "label":   {                                              // CONFIRMED from label tools
      "designer": { "unit": "pxPerCm (PPC)", "page": "exact-cm | A4 | Letter | A3", "defaults": { "backLabelCm": [17, 4.5], "cupDiaTopCm": 9, "cupDiaBotCm": 7, "cupHCm": 9, "labelHCm": 7 } }, // label-v3:436-456,1590-1600
      "wrapSet":  { "panelsCm": { "front": [5,3], "neck": [1,4.5], "seal": [3,3], "back": [5,3] } } // label-editor:999-1128,1467-1470
    }
  }
}
```

> All prior **CONFIRM** items are now resolved from first-hand reads (see `REPORT.md` §2.1–§2.4): no VAT (discount-only), invoice number `#INV-###`, label px/cm = PPC with exact-cm printing, wrap-set panels in fixed cm, barcodes are decorative/faux, QR is uploaded-image (not generated). Remaining product decisions are consolidated in §8.

### 2.b Wizard steps and field types

1. **Brand basics** — name (text, required), monogram (text), slogan/taglines EN+AR (text), logo (file upload → base64/blob), website + contact (text).
2. **Colours** — primary/background/surface/text/muted/accent (6 colour pickers) **or** pick a starter palette (dropdown of presets); live preview panel.
3. **Fonts** — heading/body/accent/arabic/script (dropdowns limited to bundled Google Fonts).
4. **Locale & tax** — currency (dropdown), number locale (dropdown), language pair + primary direction (dropdown), tax/VAT rate (number, default 0).
5. **Product catalog** — flavors, flavor colours, weights, default price, badges, ingredients EN/AR (repeatable lists).
6. **Invoice & print** — invoice doc title/foot note/number format (text), default paper sizes/margins per output (dropdown + number).
7. **Review & save** — contrast validation, then save as a named brand profile; option to "Start with Balance Bites defaults".

### 2.c How the theme is applied technically

- On profile load, write CSS custom properties to `:root`: `--brand-primary`, `--brand-bg`, `--brand-surface`, `--brand-text`, `--brand-muted`, `--brand-accent`, `--font-heading`, `--font-body`, `--font-arabic`, etc. Every module consumes only these variables (replacing the ~1,000 hardcoded hex/`hexA()` usages, e.g. `bb-stock-costs.html:1199-1338`).
- **Logo** stored as base64 (small) or a Blob in IndexedDB (large); referenced by object URL at runtime.
- **Live preview**: the wizard updates the CSS variables in real time so the sample label/invoice re-themes instantly (the stock tool already proves runtime theming works — `applyScTheme()` at `:1189-1345`; generalise it into a `ThemeProvider`).
- Print docs receive the same variables inline (the invoice/report generators already inject `:root{--inv-…}` — `bb-stock-costs.html:3803-3809`), so print matches screen.

### 2.d Multiple profiles + export/import

- Store profiles under `brand_profiles` (array) + `active_brand_id`. A profile switcher in the top shell swaps CSS variables and re-renders.
- Export a profile as `brand-profile.json` (the exact `BrandConfig` above); import validates with `zod` against `schemaVersion`.
- This directly generalises the per-tool preset export/import pattern already present everywhere (e.g. `carton:437-438`, `stand:764-765`, `label` IndexedDB presets).

### 2.e Balance Bites as the default preset

Ship `presets/balance-bites.json` containing the defaults above. First run with no saved profile → load this automatically (so existing users see no change); "New Brand" launches the empty wizard.

### 2.f Validation rules

- **Contrast**: reuse the existing WCAG contrast math (`bb-stock-costs.html:1465-1481` `contrastRatio/pickAccentOn`) to require text-on-background ≥ 4.5:1 and warn on label-critical pairs.
- **Logo**: max ~512 KB if base64 in localStorage; prefer Blob/IndexedDB for larger; enforce image mime + max dimensions.
- **Required vs optional**: name, currency, at least primary+background+text colours are required; everything else optional with Balance Bites fallback.

---

## 3. Unified data layer

**Canonical entities** (one schema, superseding the per-tool drift documented in REPORT §3.2):
- `Product` `{ id, name, nameAr, flavor, type, weight, packType, unitPrice, categoryId, barcode }`
- `Customer` `{ id, name, phone, email, address, notes }`
- `Invoice` `{ id, number, date, customerId, items:[{productId,name,qty,price,packType,weight}], subtotal, discount, discountAmount, total, notes, status }`
- `Material | Package | Sticker` `{ id, kind, name, unit, costPerUnit, currentStock, minStock, supplier, notes, productId?, templateKey? }`
- `Recipe` `{ id, name, productId, batchSize, productWeight, unitPrice, ingredients:[{itemId,itemType,qty}] }`
- `Purchase | Production | Return | OperatingCost` — as in `bb-stock-costs.html` (already the richest definitions; §2.3C).
- `Category` `{ id, name, nameAr }`

**Storage abstraction** — a single `DataStore` interface so the UI never touches storage directly:

```ts
interface DataStore {
  list<T>(entity: string): Promise<T[]>;
  get<T>(entity: string, id: string): Promise<T | null>;
  put<T>(entity: string, value: T): Promise<void>;
  remove(entity: string, id: string): Promise<void>;
  subscribe(entity: string, cb: () => void): () => void;
}
```
- **Phase now:** `IndexedDbStore` (via `idb-keyval`) with a `localStorage` fallback — covers today's offline single-user use with far higher quota than localStorage (fixing the stand base64 quota risk, REPORT §2.6H).
- **Phase later:** `SupabaseStore` implementing the same interface, with Row-Level Security per tenant + auth.

**What replaces the shared-disk-folder pattern:** the File System Access + directory-handle mechanism (`bb-stock-costs.html:1009-1122`, invoice-pro FSA block) is deleted. Cross-tool sharing becomes simply "both modules read the same `DataStore`" — in one app there is one store, so Invoice Pro writing an invoice is instantly visible to Stock & Costs with no folder to connect, no absolute path (`:1012`), and no `file://` link (`:762`).

---

## 4. Migration plan (no data loss)

A one-time in-app **Import** screen:
1. **From localStorage (same browser):** read all known keys and map into canonical entities. Known keys to sweep: `bb_products, bb_invoices, bb_inv2, bb_materials, bb_packages, bb_stickers, bb_recipes, bb_purchases, bb_production, bb_invoice_payments, bb_returns, bb_operation_costs, bb_pending_invoices, bb_color_presets` + label/carton/stand preset keys (`bbbacklabel_*`, `bb_presets`, `bbcarton_pb`, `bbstand3_pb`, `<tool>_pb`).
2. **From the JSON data folder (existing FSA users):** a file picker that ingests the `*.json` files Invoice Pro/Stock wrote, then maps them the same way.
3. **`bbbacklabel_pb` → `bbbacklabel_v3` lineage:** the label tool already migrates old preset keys (`balance-bites-label-v3.html:2011-2017` sweeps `['bbbacklabel_pb3','bbbacklabel_pb','bbbacklabel_pb2']`). Reuse that exact fallback order in the importer so no historical label presets are lost, then write them as unified `LabelPreset` records.
4. **Color/theme presets** become brand-profile palettes.
5. Import is idempotent (keyed by original ids) and produces a report of counts imported per entity.

---

## 5. Print strategy (one engine)

Replace the per-tool print hacks (new-window invoice printing, hidden-iframe reports, single-DOM carton, dual-DOM stand) with **one shared print engine** based on the stand tool's dual-DOM real-unit approach (the strongest existing implementation, `balance-bites-stand.html:665-700`):
- A `<PrintDoc size="A4|A3|A2|custom-mm" orientation dir>` component that renders children in **real units (mm/cm)** and injects the matching `@page` rule.
- Per-output templates: `InvoicePrint`, `ReportPrint`, `LabelPrint` (per label size), `CartonPrint`, `StandPrint`.
- One shared px↔mm constant and helper (generalise `PX=3.78` / `mm()` from stand `:457-462`).
- Colour via the same CSS variables so print == screen; `-webkit-print-color-adjust:exact` kept.
- This removes the popup-blocker dependency of the invoice new-window path (`bb-stock-costs.html:3898-3899`).

---

## 6. Module breakdown

| Module | Source today | Plan |
|---|---|---|
| **Label Designer** | `balance-bites-label-v3.html` + `-label-editor- latest.html` | **Merge into one module with format templates** (they are complementary, not versions — REPORT §3.4). Keep **v3's geometry engine + IndexedDB presets + migration** and the **"latest" editor's bilingual regulatory text + nutrition facts**; rewrite onto shared shell + `DataStore` + `LabelPrint`; bundle `dom-to-image` locally. |
| **Cup/Sticker Designer** | (sticker logic embedded in labels + stock stickers) | Extract as its own module reusing the label engine + sticker entities. |
| **Carton Designer** | `balance-bites-carton (2).html` | **Keep** (small, clean); re-theme via BrandConfig; move print to shared engine. |
| **Stand Designer** | `balance-bites-stand.html` | **Keep**; its print engine becomes the shared one; fix base64→Blob storage. |
| **Invoicing** | `balance-bites-invoice-pro.html` | **Rewrite** onto canonical `Invoice`/`Customer`/`Product` + `DataStore`; keep the invoice print template. |
| **Inventory & COGS** | `bb-stock-costs.html` | **Keep logic, rewrite plumbing**: drop FSA/folder, point analytics at `DataStore`; it already consumes the same entities. Richest, most reusable business logic in the codebase. |
| **Reports** | report generators in stock + invoice-pro | **Merge** into one `ReportPrint`-based reporting module. |
| **Shell (new)** | preset bars/toasts/wizard replicated everywhere | New: top nav, brand switcher, onboarding wizard, shared toast, theme provider. |

---

## 7. Phased roadmap (effort S/M/L)

- **Phase 0 — Stabilise in place (S).** Fix the confirmed real bugs without restructuring: correct the `BYTES` brand typo (`label-v3:699`); stand base64→quota guard + duplicate `tSideLogo*`/`vSideLogo*` IDs across Style/Fonts tabs (`stand:243`,`:412`) + `clrB64` dup (REPORT §2.6H); escape user text in on-screen `innerHTML` (all tools); bundle `dom-to-image` locally so `label-v3` PNG export works offline. No architecture change.
- **Phase 1 — Extract shared config + data layer (M).** Define `BrandConfig` + `DataStore`; build `IndexedDbStore`; write the migration importer (§4). Prove it by pointing one tool (Carton) at it.
- **Phase 2 — Unify UI shell (L).** Vite+React app; shared shell, theme provider (CSS variables), onboarding wizard, brand-profile switcher; port modules one by one; one shared print engine (§5).
- **Phase 3 — GitHub + Vercel (S).** Repo layout below; static build; env vars (none required until Supabase); CI = typecheck + build + preview deploys.
- **Phase 4 — Multi-tenant readiness (M/L).** Add `SupabaseStore` (auth + RLS per tenant), server-side brand profiles, per-user data isolation.

Suggested repo layout:
```
/ (Vite root)
  src/
    app/            # shell, routing, wizard, theme provider
    modules/        # label, sticker, carton, stand, invoicing, inventory, reports
    data/           # DataStore interface + IndexedDbStore + SupabaseStore
    print/          # PrintDoc + per-output templates
    brand/          # BrandConfig type, zod schema, defaults, presets/balance-bites.json
    migrate/        # legacy localStorage/JSON importers
  public/
  package.json  vite.config.ts  tsconfig.json  README.md
```
Vercel: static output, `npm run build`, no server env needed for Phases 0–3.

---

## 8. Risks & open questions

**Resolved during the audit (were open, now answered from the code):**
- **VAT/tax** — no VAT field exists anywhere; invoice-pro has only a discount % (`invoice-pro:517`). Prices are tax-inclusive.
- **Invoice number format** — `#INV-###` (3-digit, `max+1`), with an optional per-customer counter (`invoice-pro:2609`, `:2600-2609`).
- **Label px/cm & dimensions** — label-v3 uses PPC (px-per-cm) with exact-cm `@page` printing; the wrap editor uses fixed cm panels (front 5×3, neck 1×4.5, seal 3×3, back 5×3). Captured in `print.label`.
- **Canonical label tool** — the two label files are *complementary, not versions* (REPORT §3.4); merge both.

**Still open — questions for the owner:**
- **QR content:** the stand embeds *uploaded* QR images, not generated ones (`stand` Style tab). Should the unified app generate QR from a URL/product instead?
- **Barcode:** current barcodes are decorative/faux (`carton:208-213`; `label-editor:1291`). Are real, scannable (EAN/UPC) barcodes required?
- **Offline expectation:** tools run fully offline via `file://`. After Vercel, is offline/PWA support required? (Affects Service Worker + local-first store choice; also forces bundling `dom-to-image` locally — REPORT §2.2H.)
- **Data ownership after multi-tenant:** where may customer PII live (Egypt/EU hosting, retention limits) before enabling Supabase?
- **Real-world print calibration:** carton prints px-only with no mm conversion (`carton:68`) — confirm the target print shop's scaling so the shared engine can enforce true dimensions.
- **Multi-device sync today:** the current shared-folder pattern only works on one machine. Is same-device single-user acceptable until Phase 4 (Supabase), or is cloud sync needed sooner?

---

### One-paragraph verdict

Unification is clearly feasible: the six tools already share a visual language, a preset/import-export pattern, and — for the two business tools — the same data entities, so consolidating them behind one `BrandConfig`, one `DataStore`, and one real-unit print engine is a natural, incremental refactor rather than a rewrite from scratch. The single biggest blocker is the **data layer**: the current cross-tool sharing depends on the browser File System Access API, a persisted IndexedDB directory handle, and a hardcoded absolute Windows folder path (`bb-stock-costs.html:1012`, `:762`) — none of which exist on Vercel — so the first real engineering task is replacing the shared-folder mechanism with a hosted, tenant-aware datastore behind a storage abstraction.
