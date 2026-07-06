#!/usr/bin/env node
/*
 * astryx-color-codemod.mjs — Phase 4 of the Astryx migration.
 *
 * Rewrites hardcoded Tailwind palette classes (text-gray-500, bg-purple-50,
 * border-red-300, …) to the semantic utilities defined in app/tokens.css.
 * Variant prefixes (hover:, dark:, sm:, group-hover:) and opacity suffixes
 * (/50) are preserved automatically because only the color token is matched.
 *
 * Usage:
 *   node scripts/astryx-color-codemod.mjs --dry <dir...>   # report only, no writes
 *   node scripts/astryx-color-codemod.mjs <dir...>         # apply in place
 *
 * Run it ONE activity at a time so each commit is small and bisectable, e.g.:
 *   node scripts/astryx-color-codemod.mjs --dry components/activity            # Zhorai
 *   node scripts/astryx-color-codemod.mjs        components/activities/mori
 *   node scripts/astryx-color-codemod.mjs        components/activities/pippy
 *   node scripts/astryx-color-codemod.mjs        components/activities/coda
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/* raw Tailwind class -> semantic utility (see app/tokens.css) */
const MAP = {
  // neutrals — gray
  "text-gray-900": "text-fg",        "text-gray-800": "text-fg",
  "text-gray-700": "text-fg-muted",  "text-gray-600": "text-fg-muted",  "text-gray-500": "text-fg-muted",
  "text-gray-400": "text-fg-subtle", "text-gray-300": "text-fg-subtle",
  "bg-gray-50": "bg-fill", "bg-gray-100": "bg-fill", "bg-gray-200": "bg-fill",
  "bg-gray-300": "bg-fill-disabled", "bg-gray-400": "bg-fill-disabled", "bg-gray-500": "bg-fill-disabled",
  "bg-gray-800": "bg-fill-inverted", "bg-gray-900": "bg-fill-inverted",
  "border-gray-100": "border-hairline", "border-gray-200": "border-hairline",
  "border-gray-300": "border-hairline-strong", "border-gray-400": "border-hairline-strong",
  "border-gray-500": "border-hairline-strong", "border-gray-800": "border-hairline-strong",
  "fill-gray-500": "fill-fg-muted", "fill-gray-600": "fill-fg-muted",
  "fill-gray-700": "fill-fg", "fill-gray-800": "fill-fg",
  "decoration-gray-400": "decoration-fg-subtle",

  // danger — red -> critical
  "text-red-400": "text-critical", "text-red-500": "text-critical", "text-red-600": "text-critical",
  "text-red-700": "text-critical", "text-red-800": "text-critical",
  "bg-red-50": "bg-critical-muted", "bg-red-100": "bg-critical-muted",
  "bg-red-500": "bg-critical", "bg-red-600": "bg-critical", "bg-red-700": "bg-critical",
  "border-red-200": "border-critical", "border-red-300": "border-critical", "border-red-400": "border-critical",
  "ring-red-300": "ring-critical",

  // success — green -> positive
  "text-green-300": "text-positive", "text-green-400": "text-positive", "text-green-500": "text-positive",
  "text-green-600": "text-positive", "text-green-700": "text-positive", "text-green-800": "text-positive",
  "bg-green-50": "bg-positive-muted", "bg-green-100": "bg-positive-muted", "bg-green-950": "bg-positive",
  "border-green-200": "border-positive", "border-green-300": "border-positive",
  "border-green-400": "border-positive", "border-green-900": "border-positive",
  "ring-green-300": "ring-positive",

  // warning — yellow + amber -> caution
  "text-yellow-100": "text-caution", "text-yellow-300": "text-caution", "text-yellow-400": "text-caution",
  "text-yellow-600": "text-caution", "text-yellow-700": "text-caution", "text-yellow-800": "text-caution",
  "text-yellow-900": "text-caution", "text-amber-800": "text-caution", "text-amber-900": "text-caution",
  "bg-yellow-50": "bg-caution-muted", "bg-yellow-100": "bg-caution-muted",
  "bg-yellow-900": "bg-caution", "bg-yellow-950": "bg-caution",
  "bg-amber-50": "bg-caution-muted", "bg-amber-100": "bg-caution-muted",
  "border-yellow-100": "border-caution", "border-yellow-200": "border-caution",
  "border-yellow-400": "border-caution", "border-yellow-900": "border-caution",
  "border-amber-200": "border-caution", "border-amber-300": "border-caution",

  // info — blue -> info (custom token)
  "text-blue-100": "text-info", "text-blue-300": "text-info", "text-blue-400": "text-info",
  "text-blue-600": "text-info", "text-blue-700": "text-info", "text-blue-800": "text-info", "text-blue-900": "text-info",
  "bg-blue-50": "bg-info-muted", "bg-blue-100": "bg-info-muted",
  "bg-blue-500": "bg-info", "bg-blue-600": "bg-info", "bg-blue-950": "bg-info",
  "border-blue-200": "border-info", "border-blue-500": "border-info",
  "border-blue-600": "border-info", "border-blue-900": "border-info",

  // accent — purple + orange -> brand (single accent)
  "text-purple-400": "text-brand", "text-purple-600": "text-brand",
  "text-purple-700": "text-brand", "text-purple-800": "text-brand",
  "bg-purple-50": "bg-brand-muted", "bg-purple-100": "bg-brand-muted",
  "bg-purple-600": "bg-brand", "bg-purple-700": "bg-brand",
  "border-purple-100": "border-brand", "border-purple-200": "border-brand",
  "border-purple-300": "border-brand", "border-purple-500": "border-brand", "border-purple-600": "border-brand",
  "ring-purple-300": "ring-brand", "ring-purple-500": "ring-brand",
  "text-orange-600": "text-brand", "text-orange-700": "text-brand", "text-orange-800": "text-brand",
  "bg-orange-50": "bg-brand-muted", "bg-orange-400": "bg-brand", "bg-orange-500": "bg-brand",
  "border-orange-100": "border-brand", "border-orange-400": "border-brand", "border-orange-600": "border-brand",
};

/* longest-first so no shorter token is a prefix of a longer one; the lookahead
   already guards shade digits (gray-50 vs gray-500) and opacity (/50). */
const RULES = Object.keys(MAP)
  .sort((a, b) => b.length - a.length)
  .map((from) => ({
    re: new RegExp(`(?<![-\\w])${from}(?![-\\w\\d])`, "g"),
    to: MAP[from],
  }));

const LEFTOVER = /(?<![-\w])(bg|text|border|ring|from|to|via|fill|stroke|divide|placeholder|decoration|outline)-(purple|blue|green|red|amber|yellow|orange|pink|indigo|teal|cyan|emerald|slate|gray|zinc|violet|fuchsia|rose|sky|lime)-\d{2,3}/g;

const EXTS = new Set([".tsx", ".ts", ".jsx", ".js"]);

/* Dev/demo scaffolding — skipped. These carry decorative styling (e.g. the
   bg-black + text-green-400 "terminal" look in bert-demo) that is NOT semantic
   and must not fold into text-positive. */
const SKIP = ["bert-demo", "test-speech", "test-tts", "sentiment-test"];
const dry = process.argv.includes("--dry");
const dirs = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (dirs.length === 0) {
  console.error("Usage: node scripts/astryx-color-codemod.mjs [--dry] <dir...>");
  process.exit(1);
}

function walk(entry, out = []) {
  const stat = statSync(entry);
  if (!stat.isDirectory()) {
    if (EXTS.has(extname(entry)) && !SKIP.some((skip) => entry.includes(skip))) out.push(entry);
    return out;
  }
  for (const name of readdirSync(entry)) {
    if (name === "node_modules" || name === "__tests__") continue;
    const p = join(entry, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p)) && !SKIP.some((skip) => p.includes(skip))) out.push(p);
  }
  return out;
}

let filesChanged = 0, totalReplacements = 0;
const leftovers = new Map();

for (const dir of dirs) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    let out = src, count = 0;
    for (const { re, to } of RULES) {
      out = out.replace(re, () => { count++; return to; });
    }
    if (count > 0) {
      filesChanged++;
      totalReplacements += count;
      console.log(`${dry ? "would edit" : "edited"}  ${file}  (${count})`);
      if (!dry) writeFileSync(file, out, "utf8");
    }
    // report any hardcoded palette class the map didn't cover
    for (const m of out.matchAll(LEFTOVER)) {
      leftovers.set(m[0], (leftovers.get(m[0]) || 0) + 1);
    }
  }
}

console.log(`\n${dry ? "[dry run] " : ""}${totalReplacements} replacement(s) across ${filesChanged} file(s).`);
if (leftovers.size) {
  console.log(`\n⚠  ${leftovers.size} uncovered palette class(es) remain — add to MAP or handle by hand:`);
  for (const [cls, n] of [...leftovers].sort((a, b) => b[1] - a[1])) console.log(`   ${cls}  ×${n}`);
} else {
  console.log("✓ no uncovered hardcoded palette classes remain.");
}
