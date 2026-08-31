#!/usr/bin/env node
// ARCHITECTURE.md §6 and ADR-010 — every mutation input is schema-validated
// before any database access. The structural location is
// features/<module>/actions.ts: every exported mutation validates its input
// through a zod schema at entry.
//
// Asserted positively, per PR-22. This guard does not scan for the substring
// "zod". It parses each actions.ts as TypeScript and requires that the first
// statement of every exported function is a .parse() / .safeParse() call whose
// callee is a schema binding — a named import from a module whose specifier
// is exactly "zod" or whose path ends in /schema, or a local const constructed
// from such a binding — and whose argument subtree uses the function's input
// parameter. JSON.parse, Date.parse and the other platform .parse methods are
// not schemas and do not count.
//
// PR-27 — a check states the minimum it expected to examine and fails when it
// examined less. `OK: 0 action file(s) scanned` at exit 0 is the defect this
// floor exists to close. Floors below are the true counts as of the commit
// that lands this guard with its first target (P02-T14). Raise them the day
// either count grows; never lower either to make a shrinking result pass.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { extname, join, sep } from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const FEATURES_DIR = "features";
const ACTIONS_FILENAME = "actions.ts";

// P02-T14 — one module (access), one actions.ts, four exported mutations.
const MINIMUM_ACTION_FILES = 1;
const MINIMUM_MUTATIONS = 4;

const SCHEMA_PATH = /(^|\/)schema(\.ts|\.js)?$/;
const ZOD_SPECIFIER = "zod";
const PLATFORM_PARSE = new Set(["JSON", "Date", "URL", "Number", "Math", "Object", "Array", "String", "Boolean"]);

function fail(message) {
  console.error(`FAIL: ${message}`);
}

function hasExportModifier(node) {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

function identifierText(node) {
  if (node && ts.isIdentifier(node)) return node.text;
  if (node && ts.isStringLiteral(node)) return node.text;
  return null;
}

function moduleSpecifierOf(decl) {
  if (!decl.moduleSpecifier || !ts.isStringLiteral(decl.moduleSpecifier)) {
    return null;
  }
  return decl.moduleSpecifier.text.replace(/\\/g, "/");
}

function isSchemaModule(specifier) {
  if (specifier === ZOD_SPECIFIER) return true;
  return SCHEMA_PATH.test(specifier);
}

function collectSchemaBindings(sourceFile) {
  const bindings = new Set();
  const zNames = new Set();

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue;
    const specifier = moduleSpecifierOf(stmt);
    if (specifier === null) continue;

    const fromZod = specifier === ZOD_SPECIFIER;
    const fromSchema = isSchemaModule(specifier);
    if (!fromZod && !fromSchema) continue;

    const clause = stmt.importClause;
    if (clause.name && fromZod) {
      zNames.add(clause.name.text);
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        const imported = identifierText(element.propertyName || element.name);
        const local = identifierText(element.name);
        if (!local) continue;
        if (fromZod && (imported === "z" || imported === "default")) {
          zNames.add(local);
        } else {
          bindings.add(local);
        }
      }
    }
    if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings) && fromZod) {
      zNames.add(clause.namedBindings.name.text);
    }
  }

  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      const name = identifierText(decl.name);
      if (!name || !decl.initializer) continue;
      if (isZodConstruct(decl.initializer, zNames, bindings)) {
        bindings.add(name);
      }
    }
  }

  return { bindings, zNames };
}

function isZodConstruct(expr, zNames, bindings) {
  let current = expr;
  for (let depth = 0; depth < 12; depth += 1) {
    if (ts.isCallExpression(current)) {
      current = current.expression;
      continue;
    }
    if (ts.isPropertyAccessExpression(current)) {
      const obj = current.expression;
      if (ts.isIdentifier(obj) && (zNames.has(obj.text) || bindings.has(obj.text))) {
        return true;
      }
      current = obj;
      continue;
    }
    if (ts.isIdentifier(current) && (zNames.has(current.text) || bindings.has(current.text))) {
      return true;
    }
    return false;
  }
  return false;
}

function isSchemaParseCall(expr, bindings, zNames) {
  if (!ts.isCallExpression(expr)) return false;
  const callee = expr.expression;
  if (!ts.isPropertyAccessExpression(callee)) return false;
  const method = callee.name.text;
  if (method !== "parse" && method !== "safeParse") return false;
  const obj = callee.expression;
  if (ts.isIdentifier(obj) && PLATFORM_PARSE.has(obj.text)) return false;
  if (ts.isIdentifier(obj) && bindings.has(obj.text)) return true;
  return isZodConstruct(obj, zNames, bindings);
}

function subtreeUsesParam(node, paramNames) {
  let found = false;
  const visit = (n) => {
    if (found) return;
    if (ts.isIdentifier(n) && paramNames.has(n.text)) {
      found = true;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

function firstStatement(body) {
  if (!body) return null;
  if (ts.isBlock(body)) {
    for (const stmt of body.statements) {
      if (ts.isEmptyStatement(stmt)) continue;
      return stmt;
    }
    return null;
  }
  return body;
}

function statementIsEntryParse(stmt, paramNames, bindings, zNames) {
  if (!stmt) return false;

  const checkExpr = (expr) =>
    isSchemaParseCall(expr, bindings, zNames) && subtreeUsesParam(expr, paramNames);

  if (ts.isExpressionStatement(stmt)) {
    return checkExpr(stmt.expression);
  }
  if (ts.isVariableStatement(stmt)) {
    for (const decl of stmt.declarationList.declarations) {
      if (decl.initializer && checkExpr(decl.initializer)) return true;
    }
    return false;
  }
  if (ts.isReturnStatement(stmt) && stmt.expression) {
    return checkExpr(stmt.expression);
  }
  if (!ts.isBlock(stmt) && !ts.isIfStatement(stmt) && checkExpr(stmt)) {
    return true;
  }
  return false;
}

function exportedMutations(sourceFile) {
  const out = [];

  const considerFunction = (name, params, body) => {
    if (!name || !body) return;
    out.push({ name, params, body });
  };

  for (const stmt of sourceFile.statements) {
    if (ts.isFunctionDeclaration(stmt) && hasExportModifier(stmt)) {
      considerFunction(identifierText(stmt.name), stmt.parameters, stmt.body);
      continue;
    }
    if (ts.isVariableStatement(stmt) && hasExportModifier(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        const name = identifierText(decl.name);
        const init = decl.initializer;
        if (!name || !init) continue;
        if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
          considerFunction(name, init.parameters, init.body);
        }
      }
    }
  }
  return out;
}

function paramNamesOf(parameters) {
  const names = new Set();
  for (const param of parameters) {
    const text = identifierText(param.name);
    if (text) names.add(text);
  }
  return names;
}

function actionFiles() {
  let entries;
  try {
    entries = readdirSync(FEATURES_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      fail(
        `${FEATURES_DIR}/ does not exist — ADR-010's mutation boundary is ` +
          `${FEATURES_DIR}/*/actions.ts, and a missing root is not a pass (PR-27)`,
      );
      process.exit(1);
    }
    throw err;
  }

  const files = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = join(FEATURES_DIR, entry.name, ACTIONS_FILENAME);
    try {
      if (statSync(candidate).isFile()) files.push(candidate.split(sep).join("/"));
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }
  return files;
}

function parseFile(path) {
  const text = readFileSync(path, "utf8");
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

const files = actionFiles();

if (files.length < MINIMUM_ACTION_FILES) {
  fail(
    `${files.length} action file(s) scanned under ${FEATURES_DIR}/*/actions.ts, ` +
      `minimum ${MINIMUM_ACTION_FILES}. This guard examined less than its own ` +
      `floor (PR-27)`,
  );
  process.exit(1);
}

let mutationCount = 0;
let validatedCount = 0;
let violations = 0;

for (const path of files) {
  if (extname(path) !== ".ts") continue;
  const sourceFile = parseFile(path);
  const { bindings, zNames } = collectSchemaBindings(sourceFile);
  const mutations = exportedMutations(sourceFile);

  for (const mutation of mutations) {
    mutationCount += 1;
    const names = paramNamesOf(mutation.params);
    if (names.size === 0) {
      violations += 1;
      fail(
        `${path} exports mutation '${mutation.name}' with no input parameter, ` +
          `so nothing is validated at entry (ADR-010)`,
      );
      continue;
    }
    const first = firstStatement(mutation.body);
    if (statementIsEntryParse(first, names, bindings, zNames)) {
      validatedCount += 1;
      continue;
    }
    violations += 1;
    fail(
      `${path} exports mutation '${mutation.name}' that does not validate its ` +
        `input through a zod schema at entry (ADR-010)`,
    );
  }
}

if (mutationCount < MINIMUM_MUTATIONS) {
  violations += 1;
  fail(
    `examined ${mutationCount} exported mutation(s) across ${files.length} ` +
      `action file(s), minimum ${MINIMUM_MUTATIONS} (PR-27)`,
  );
}

if (validatedCount < MINIMUM_MUTATIONS && violations === 0) {
  violations += 1;
  fail(
    `validated ${validatedCount} mutation(s) at entry, minimum ${MINIMUM_MUTATIONS} (PR-27)`,
  );
}

if (violations > 0) {
  process.exit(1);
}

console.log(
  `OK: ${files.length} action file(s) scanned (minimum ${MINIMUM_ACTION_FILES}); ` +
    `${validatedCount} exported mutation(s) validated at entry through a zod ` +
    `schema (minimum ${MINIMUM_MUTATIONS}) [${files.join(", ")}]`,
);
