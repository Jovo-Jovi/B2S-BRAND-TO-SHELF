#!/usr/bin/env node
// CF-170, holding CF-74. A duplicate string inside one catalog namespace is
// a finding unless this list names the keys and the reason. A listed pair
// that is no longer a duplicate fails too, so the list cannot rot.

import { readFileSync } from "node:fs";

const CATALOGS = [
  "app/[locale]/dictionaries/en.json",
  "app/[locale]/dictionaries/ar.json",
];

// Namespaces present as of P03-T08 were 2. P03-T12 adds data: 3.
// P03-T13 adds gallery: 4.
const MINIMUM_NAMESPACES = 4;

// access.title is the page name. access.signInSubmit is the submit control.
// They are the same words in both locales because that is the name of the
// page and the name of the action. One key would make a button-label change
// rewrite the document title.
const JUSTIFIED = [
  {
    namespace: "access",
    keys: ["title", "signInSubmit"],
    reason: "page name and submit control",
  },
  {
    namespace: "gallery",
    keys: ["localeAr", "typefaceArabic"],
    reason: "the language name and the Arabic-script section are the same word",
  },
];

let violations = 0;

function fail(message) {
  violations += 1;
  console.error(`FAIL: ${message}`);
}

function groupsIn(namespace, value) {
  const byText = new Map();
  for (const [key, leaf] of Object.entries(value)) {
    if (typeof leaf !== "string") {
      continue;
    }
    const list = byText.get(leaf) ?? [];
    list.push(key);
    byText.set(leaf, list);
  }
  return [...byText.values()]
    .filter((keys) => keys.length > 1)
    .map((keys) => keys.slice().sort());
}

function sameKeys(a, b) {
  return a.length === b.length && a.every((key, i) => key === b[i]);
}

let namespacesSeen = 0;

for (const path of CATALOGS) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    fail(`${path}: ${err.message}`);
    continue;
  }
  const namespaces = Object.keys(data).filter(
    (key) => data[key] !== null && typeof data[key] === "object",
  );
  namespacesSeen = Math.max(namespacesSeen, namespaces.length);
  for (const namespace of namespaces) {
    const found = groupsIn(namespace, data[namespace]);
    const listed = JUSTIFIED.filter((entry) => entry.namespace === namespace);
    for (const keys of found) {
      const match = listed.find((entry) => sameKeys(entry.keys.slice().sort(), keys));
      if (!match) {
        fail(`${path} ${namespace} duplicate [${keys.join(", ")}] is not justified`);
      } else if (!match.reason) {
        fail(`${path} ${namespace} [${keys.join(", ")}] has no reason`);
      }
    }
    for (const entry of listed) {
      const keys = entry.keys.slice().sort();
      if (!found.some((group) => sameKeys(group, keys))) {
        fail(`${path} ${namespace} lists [${keys.join(", ")}] but those keys are not a duplicate`);
      }
    }
  }
}

if (namespacesSeen < MINIMUM_NAMESPACES) {
  fail(`${namespacesSeen} namespace(s) examined, minimum ${MINIMUM_NAMESPACES}`);
}

if (violations > 0) {
  process.exit(1);
}

console.log(
  `OK: duplicate catalog values are justified; ${namespacesSeen} namespace(s), minimum ${MINIMUM_NAMESPACES}; ${JUSTIFIED.length} justified pair(s)`,
);
