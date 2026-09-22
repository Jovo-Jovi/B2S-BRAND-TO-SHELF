# BRAND_CONFIG

**Status:** AUTHORED. Frozen. Precedence slot 9.
**Authored:** 2026-09-19 by the reviewer surface. Landed P03-T04.
**Depends on:** `DOMAIN_MODEL.md` §2.2, §2.3 and D7, and `DATA_MODEL.md` §1 and
its Brand and Asset tiers.

> Where this document and `DATA_MODEL.md` disagree on a column,
> `DATA_MODEL.md` wins and this document is amended. Where they disagree on
> meaning, this document wins.

---

## 1. What this document is for

A brand owner arrives with a name, a logo, some colours and a typeface, and
leaves with packaging, labels, stickers, cartons, stands and garment tickets
that look like theirs. This document specifies what is captured, how it is
structured, what may vary per product line, how it changes over time, and what
the wizard may and may not ask for. It is the contract between the onboarding
wizard (module 02), the Brand module (03), and every downstream surface that
renders on-brand output.

It specifies no template, no layout and no rendering. A brand is data; what is
done with it belongs to `TEMPLATE_MODEL.md` and `PRINT_CONTRACT.md`, which do
not exist yet.

---

## 2. The shape, in one picture

```
Tenant ─1:1─ Brand ─1:N─ BrandLine ──────────┐
                │                            │ (optional own profile)
                └─1:N─ BrandProfile ◄────────┘
                           ├─1:N─ BrandTheme ─1:N─ ColorValue ─N:1─ ColorRole
                           ├─1:N─ LogoVariant ─N:1─ MediaAsset
                           ├─1:N─ Typeface
                           └─1:N─ BrandGuideline
```

One account is one company is one master Brand. A Brand holds many BrandLines.
A BrandProfile is the complete, frozen expression of a brand at a point in time.

---

## 3. Bilingual text is never a column

Every human-readable brand string — brand name, line name, guideline title,
guideline body — is a reference to a `TranslationKey`, never a text column and
never a pair of `_en` / `_ar` columns. Entries hang off the key, one per
locale. Paired columns would put the locale set in the schema shape, and a
third locale would then be a migration against every table rather than a row.

> **Column amendment, P03-T04.** The reviewer draft named `TranslationEntry` as
> the stored reference, and listed a typeface display name among the bilingual
> strings. `DATA_MODEL.md` wins on columns: owning rows reference
> `translation_key`, and `typeface.family` is `text not null` — "as the brand
> names it. Not an identifier." Family is not a translation key.

`tenant.default_locale` is constrained to `en` and `ar` by OD-G17, so exactly
two entries exist per string today. That constraint is on the data, not on the
shape: widening it is a CHECK amendment, not a migration of every brand table.

A brand string with no entry for a locale is not an error at write time and is
an error at render time: the renderer states which locale is missing and for
which field, and never silently falls back to the other language. A blank on a
carton is a defect you can see; a quietly English name on an Arabic label is a
defect you ship.

---

## 4. Colour

`ColorRole` is a fixed, platform-wide set, named by meaning and never by
surface. Seven roles:

| Role | Meaning |
|---|---|
| `primary` | The brand's dominant colour. What someone names when asked the brand's colour |
| `secondary` | The supporting colour that appears beside primary |
| `accent` | Used sparingly for emphasis. Never a large area |
| `background` | The dominant field a design sits on |
| `foreground` | Text and marks placed on background. Must meet contrast against it |
| `muted` | Secondary text, rules, borders. Legible, not prominent |
| `critical` | Warnings and regulatory marks. Never decorative |

The set is fixed by this document. Adding a role is an amendment here and a
migration, not a tenant choice. This is D7 made concrete, and it exists because
three retiring tools wrote the same colour key with the same id and the same
name and different values — `cp_def1` "Dark Gold" differed on six of seven
values between them, so whichever tool seeded an empty store first silently
defined what the name meant (CF-49). A fixed semantic set means a role cannot
be redefined by whoever got there first.

A `BrandTheme` provides exactly one `ColorValue` per role — seven values, no
more, no fewer. A theme missing a role is invalid and cannot be saved. A
`BrandProfile` may hold several themes (a light and a dark expression, say);
exactly one is the profile's default.

A `ColorValue` stores an sRGB value as a language-neutral key. It stores no
print representation yet: CMYK, spot colour and substrate behaviour are
`PRINT_CONTRACT.md`'s, and that document does not exist. `ColorValue` gains a
print column when it does. Storing a guess now and reconciling later is how the
legacy colour drift happened.

---

## 5. Typography

A `Typeface` is referenced by role and script, both required:

- roles: `heading`, `body`
- scripts: `latin`, `arabic`

So a complete `BrandProfile` names up to four typefaces. This is not optional
detail: a Latin face chosen for a wordmark usually has no Arabic coverage, and
a brand that specifies one face for both scripts has specified nothing for one
of its two languages. A profile missing a `(role, script)` pair is incomplete
and the renderer says which pair, by name.

A `Typeface` records what the brand uses — family name, weight, style, and a
reference to an uploaded font file where one was provided. It does not record
licensing, which is the tenant's affair and not the platform's to assert.

---

## 6. BrandProfile is immutable

A `BrandProfile` is never edited. A change produces a new profile carrying an
incremented version and a reference to the one it supersedes. `Brand` holds an
explicit pointer to the current profile. Profiles are never archived and never
deleted (OD-D5, invariant 3).

The reason is two phases away. `ArtworkVersion` is immutable and OD-E11
requires byte-identical `PrintArtifact` output across platforms. An artifact
generated against a brand that has since been edited can never be re-derived,
so a mutable profile would make the print contract unprovable — silently, a
phase before anyone looks. Every generated artifact references the exact
profile version it was generated from, and that reference is frozen with it.

Because it is immutable, `BrandProfile` declares no `updated_at` and carries no
maintenance trigger, departing from `DATA_MODEL.md` §1 rule 4 on the same
reasoning as `activity_event`. The departure is declared in §1's departures
table, not here.

---

## 7. Per-line override is whole-profile

A `BrandLine` either has its own complete `BrandProfile` or it has none.
Resolution is one rule: the line's profile if it has one, otherwise the brand's
current profile. There is no field-level merge and no precedence table.

Sparse override was rejected. A per-field merge poses a precedence question at
every field, and field-level merge with unstated precedence is exactly the
shape that produced CF-49 one layer up. If a line differs in one colour, it
gets a full profile whose other six values equal the master's — explicit
duplication, resolvable by inspection, and diffable.

Resolution happens at read time and is never materialised. A stored resolved
profile would drift from its parents the moment either changed.

---

## 8. Guidelines

A `BrandGuideline` is a constraint the brand states about itself in prose —
minimum clear space, forbidden placements, tone. It is advisory to humans and
inert to the renderer: nothing in the platform reads a guideline and changes
output because of it. It is captured because brand owners have them and expect
to keep them somewhere, and because a constraint that matters should become a
template rule rather than a paragraph.

A guideline that needs enforcing is a `TEMPLATE_MODEL.md` amendment, not a
longer guideline.

---

## 9. Assets

Binary files are objects in Supabase Storage under tenant-isolated paths
(ADR-008, OD-G20). Rows hold references, never content; base64-in-rows is what
broke the retiring tools (OD-G11).

`MediaAsset` is the logical file a tenant uploaded. `AssetRendition` is each
derivative — one per tier, `display` and `print`. Per OD-G20 rider 1, the
stored locator is provider, bucket and key. No column, type or function name
contains a vendor name, so a future storage decision is an object migration
rather than a schema change.

A `LogoVariant` is a named use of a `MediaAsset`: `full`, `mark` or
`wordmark`, each for light or dark ground. A profile need not carry every
combination; it must carry at least one, and the renderer names the missing
combination rather than substituting one that exists.

---

## 10. What the wizard captures, and where it lands

The wizard owns no storage (SCOPE module 02). Every field writes through Brand
or through tenant.

| Wizard step | Writes to |
|---|---|
| Company identity — legal name, trading name | `tenant`, via `TranslationKey` for displayed names |
| Business data — tax registration, addresses, contact details | `tenant` |
| Currency and locale | `tenant.base_currency`, `tenant.default_locale` (already constrained, OD-G17) |
| Brand identity — brand name, line names | `Brand`, `BrandLine`, via `TranslationKey` |
| Logo upload and variants | `MediaAsset`, `AssetRendition`, `LogoVariant` |
| Colours | `BrandTheme`, `ColorValue` |
| Typography | `Typeface` |
| Guidelines | `BrandGuideline` |

Business data lands on `tenant` rather than in a new Settings-tier entity.
`base_currency` and `default_locale` are already there; splitting the rest
into a second table would mean two reads for one screen and two places for one
fact.

The wizard may be abandoned and resumed. A partial brand is a `BrandProfile`
that has not yet been made current — not a half-written current profile. The
brand has no current profile until one is complete, and "complete" is defined
in §11.

---

## 11. Validation

A `BrandProfile` may become current only when all of these hold. Each failure
names the field and the locale or pair at fault; none is a generic "invalid".

1. Every bilingual string has an entry for every locale in
   `tenant.default_locale`'s permitted set.
2. Exactly one `BrandTheme` is the profile's default.
3. Every theme provides exactly one `ColorValue` for each of the seven
   `ColorRole`s.
4. `foreground` meets a stated contrast ratio against `background`, in every
   theme. The ratio is a platform constant, not a tenant setting — a brand
   cannot opt out of legibility.
5. At least one `LogoVariant` exists, and its `MediaAsset` has a rendition in
   both the `display` and `print` tiers.
6. A `Typeface` exists for every `(role, script)` pair the permitted locale
   set implies.

A profile failing any of these can be saved and resumed. It cannot be made
current, and nothing renders from it.

---

## 12. What this forecloses

- A free canvas. A brand supplies values into a constrained template library;
  it never supplies a layout.
- A brand string in a text column, and therefore a monolingual brand.
- A tenant-defined colour role, and with it the CF-49 collision in a new form.
- A mutable brand, and with it an unreproducible `PrintArtifact`.
- A resolved profile stored anywhere.
- A renderer that guesses: every missing value is named, never substituted.

---

*Precedence slot 9. Frozen. Read with `DOMAIN_MODEL.md` and `DATA_MODEL.md`.*
