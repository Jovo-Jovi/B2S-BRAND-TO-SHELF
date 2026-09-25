// Shared reader for the component gates (CF-173, CF-174). It parses the
// `component` blocks in DESIGN_SURFACE.md and the implemented primitives
// under components/ui/. A missing path is reported, never thrown: the
// two-way probe removes and empties these targets and a stack is not a proof.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

export const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
export const SPEC_PATH = join(REPO, "docs", "product", "DESIGN_SURFACE.md");
export const UI_DIR = join(REPO, "components", "ui");

export const MINIMUM_IMPLEMENTED = 11;
export const MINIMUM_BLOCKS = 21;
export const MINIMUM_VARIANT_MEMBERS = 25;
export const MINIMUM_SIZE_MEMBERS = 22;
export const MINIMUM_ENFORCED_STATES = 66;

function bracketList(value) {
  const match = value.match(/\[([^\]]*)\]/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBlocks(text) {
  const blocks = [];
  const fence = /```component\n([\s\S]*?)```/g;
  let match = fence.exec(text);
  while (match) {
    const body = match[1];
    const name = body.match(/^name:\s*(\S+)/m)?.[1] ?? "";
    const variants = bracketList(body.match(/^variants:\s*(.+)$/m)?.[1] ?? "");
    const sizes = bracketList(body.match(/^sizes:\s*(.+)$/m)?.[1] ?? "");
    const states = [];
    let inStates = false;
    for (const line of body.split("\n")) {
      if (/^states:/.test(line)) {
        inStates = true;
        continue;
      }
      if (inStates && /^[A-Za-z]/.test(line)) {
        inStates = false;
      }
      if (!inStates) continue;
      const state = line.match(/^\s{2}([A-Za-z0-9_]+):\s*(.*)$/);
      if (!state) continue;
      states.push({
        key: state[1],
        na: state[2].trim().toLowerCase().startsWith("n/a"),
      });
    }
    if (name) blocks.push({ name, variants, sizes, states });
    match = fence.exec(text);
  }
  return blocks;
}

function unwrap(node) {
  let current = node;
  while (ts.isParenthesizedTypeNode(current)) current = current.type;
  return current;
}

function literalMembers(typeNode) {
  const type = unwrap(typeNode);
  if (ts.isUnionTypeNode(type)) {
    const members = [];
    for (const part of type.types) {
      const inner = unwrap(part);
      if (!ts.isLiteralTypeNode(inner) || !ts.isStringLiteral(inner.literal)) return null;
      members.push(inner.literal.text);
    }
    return members;
  }
  if (ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) {
    return [type.literal.text];
  }
  return null;
}

export function typeLiteralMembers(text, typeName, fileName = "source.tsx") {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let members = null;
  function visit(node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      members = literalMembers(node.type);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return members;
}

function exportedAliases(text, fileName) {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  function visit(node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text.endsWith("Variant")) {
      const exported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
      if (exported) {
        const name = node.name.text.slice(0, -"Variant".length);
        found.push({
          name,
          variants: literalMembers(node.type),
          sizes: null,
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  for (const item of found) {
    item.sizes = typeLiteralMembers(text, `${item.name}Size`, fileName);
  }
  return found.filter((item) => item.variants);
}

export function discoverImplementations(uiDir) {
  if (!existsSync(uiDir)) return [];
  const implementations = [];
  for (const entry of readdirSync(uiDir)) {
    const dir = join(uiDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".tsx") || file.endsWith(".test.tsx")) continue;
      const full = join(dir, file);
      const aliases = exportedAliases(readFileSync(full, "utf8"), file);
      for (const alias of aliases) {
        implementations.push({ ...alias, dir, file: full });
      }
    }
  }
  return implementations;
}

export function loadCatalog(specPath = SPEC_PATH, uiDir = UI_DIR) {
  const specMissing = !existsSync(specPath);
  const uiMissing = !existsSync(uiDir);
  let specUnreadable = false;
  let blocks = [];
  if (!specMissing) {
    try {
      const stats = statSync(specPath);
      if (!stats.isFile()) specUnreadable = true;
      else blocks = parseBlocks(readFileSync(specPath, "utf8"));
    } catch (err) {
      if (err && err.code === "ENOENT") {
        return { specMissing: true, uiMissing, specUnreadable: false, blocks: [], implementations: [] };
      }
      throw err;
    }
  }
  let implementations = [];
  if (!uiMissing) {
    try {
      implementations = discoverImplementations(uiDir);
    } catch (err) {
      if (err && err.code === "ENOENT") {
        return { specMissing, uiMissing: true, specUnreadable, blocks, implementations: [] };
      }
      throw err;
    }
  }
  return { specMissing, uiMissing, specUnreadable, blocks, implementations };
}

export function setDiff(actual, expected) {
  const missing = expected.filter((item) => !actual.includes(item));
  const extra = actual.filter((item) => !expected.includes(item));
  if (missing.length === 0 && extra.length === 0) return null;
  return { missing, extra };
}

export function coveredStatesInSource(text, fileName = "source.test.tsx") {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const covered = new Set();
  function marksCoverage(callback) {
    let jsx = false;
    let assertion = false;
    const texts = new Set();
    function walk(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) texts.add(node.text);
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) jsx = true;
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        const name = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : "";
        if (name === "expect" || name === "assert") assertion = true;
      }
      ts.forEachChild(node, walk);
    }
    walk(callback);
    if (jsx && assertion) {
      for (const text of texts) covered.add(text);
    }
  }
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const name = ts.isIdentifier(callee) ? callee.text : "";
      if ((name === "it" || name === "test") && node.arguments[1]) {
        const callback = node.arguments[1];
        if (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) {
          marksCoverage(callback.body ?? callback);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return covered;
}

export function coveredStatesInDirectory(dir) {
  const covered = new Set();
  if (!existsSync(dir)) return covered;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".test.ts") && !file.endsWith(".test.tsx")) continue;
    const text = readFileSync(join(dir, file), "utf8");
    for (const state of coveredStatesInSource(text, file)) covered.add(state);
  }
  return covered;
}

export function enforcedStates(block) {
  return block.states.filter((state) => !state.na).map((state) => state.key);
}
