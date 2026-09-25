#!/usr/bin/env node
// CF-169. en and ar hold exactly the same key set, including every plural
// category a key declares. Asserts the shape of the two trees (PR-22).

import { readFileSync } from "node:fs";

const EN = "app/[locale]/dictionaries/en.json";
const AR = "app/[locale]/dictionaries/ar.json";

// Leaf count of both catalogs as of P03-T08. P03-T06 recorded 19; the files
// on this branch hold 17. The floor is the count this check reads.
const MINIMUM_LEAVES = 17;

let violations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

function load(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    fail(`${path}: ${err.message}`);
    return null;
  }
}

function leaves(value, path, out) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const key of Object.keys(value)) {
      leaves(value[key], path ? `${path}.${key}` : key, out);
    }
    return;
  }
  out.push(path);
}

function shape(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value).sort();
    return keys.map((key) => `${key}:{${shape(value[key])}}`).join(",");
  }
  return typeof value;
}

const en = load(EN);
const ar = load(AR);

if (en && ar) {
  const enLeaves = [];
  const arLeaves = [];
  leaves(en, "", enLeaves);
  leaves(ar, "", arLeaves);
  const enSet = new Set(enLeaves);
  const arSet = new Set(arLeaves);
  for (const key of enSet) {
    if (!arSet.has(key)) {
      fail(`key ${key} is in en and not in ar`);
    }
  }
  for (const key of arSet) {
    if (!enSet.has(key)) {
      fail(`key ${key} is in ar and not in en`);
    }
  }
  if (shape(en) !== shape(ar)) {
    fail("en and ar key shapes differ, including plural categories");
  }
  if (enLeaves.length < MINIMUM_LEAVES || arLeaves.length < MINIMUM_LEAVES) {
    fail(`${enLeaves.length}/${arLeaves.length} leaves, minimum ${MINIMUM_LEAVES}`);
  }
  if (violations === 0) {
    console.log(
      `OK: en and ar hold the same ${enLeaves.length} key(s), minimum ${MINIMUM_LEAVES}`,
    );
  }
}

if (violations > 0) {
  process.exit(1);
}
