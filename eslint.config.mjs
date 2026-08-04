import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// ARCHITECTURE.md §6 row 7, and AGENTS.md §3 as a signed hard rule: "No
// user-derived value reaches an HTML-injection sink." CF-02 is the legacy
// defect behind it — 53 unescaped innerHTML sites across the five retiring
// tools, with no escape helper, sanitiser or allow-list in any of them, and a
// reachability chain that ends in imported JSON rendered as markup on every
// page load.
//
// Written as AST selectors rather than a string scan, which is PR-22's rule in
// the form a linter can take. Grepping for "innerHTML" fires on the ledger row
// that documents the defect and on this comment; a selector matches only a real
// member expression, JSX attribute or object property in parsed source, so it
// cannot be tripped by documentation and cannot be evaded by reformatting,
// aliasing the property or writing it as a computed key.
//
// Reads are caught alongside writes. The sink is the write, but no read exists
// in this codebase either, and a rule that has to decide which side of an
// assignment it is on is a rule with a seam in it.
//
// No exemption is granted in advance and none is needed today: the whole tree
// is clean of all three. A legitimate use takes an inline disable comment on
// the line itself, carrying the reason and naming what sanitises the value. A
// file-wide or config-wide exemption is not that.
//
// Do not spell a disable directive out in a comment here. ESLint reads
// directive comments wherever they appear, including inside prose in this very
// file, and registers the words after it as rule names.
const htmlInjectionSinks = [
  {
    selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
    message:
      "dangerouslySetInnerHTML is an HTML-injection sink (ARCHITECTURE.md §6, CF-02). Render text as a child, or take an inline disable stating what sanitises the value.",
  },
  {
    selector:
      'Property[key.name="dangerouslySetInnerHTML"], Property[key.value="dangerouslySetInnerHTML"]',
    message:
      "dangerouslySetInnerHTML is an HTML-injection sink (ARCHITECTURE.md §6, CF-02), including when spread onto an element from an object.",
  },
  {
    selector: "MemberExpression[computed=false][property.name=/^(inner|outer)HTML$/]",
    message:
      "innerHTML and outerHTML are HTML-injection sinks (ARCHITECTURE.md §6, CF-02). Use textContent, or take an inline disable stating what sanitises the value.",
  },
  {
    selector: "MemberExpression[computed=true][property.value=/^(inner|outer)HTML$/]",
    message:
      "innerHTML and outerHTML are HTML-injection sinks (ARCHITECTURE.md §6, CF-02), including through a computed property key.",
  },
  {
    selector: "Property[key.name=/^(inner|outer)HTML$/], Property[key.value=/^(inner|outer)HTML$/]",
    message:
      "innerHTML and outerHTML are HTML-injection sinks (ARCHITECTURE.md §6, CF-02), including when assigned through an object literal.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "b2s/no-html-injection-sink",
    rules: {
      "no-restricted-syntax": ["error", ...htmlInjectionSinks],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "legacy/**"]),
]);

export default eslintConfig;
