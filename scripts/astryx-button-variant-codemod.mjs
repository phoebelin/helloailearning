#!/usr/bin/env node
/*
 * astryx-button-variant-codemod.mjs — strip hardcoded Tailwind color utilities
 * from <Button> usages and let Astryx's own variant styling take over.
 *
 * Only touches Button tags with a LITERAL `className="..."` string (double-
 * quoted, no {}/cn()/template interpolation). Dynamic classNames are left
 * alone and reported — they need hand review since a computed className
 * can't be safely string-matched.
 *
 * For each literal className:
 *   1. Split into utility tokens, classify each as color-related or not.
 *   2. Strip the color tokens; keep layout/spacing/typography tokens.
 *   3. If the tag has no explicit `variant=` prop, infer one from the
 *      ORIGINAL (pre-strip) color tokens using conservative rules. If no
 *      rule confidently matches, the button is reported as NEEDS REVIEW
 *      and left completely untouched (no strip, no variant) rather than
 *      guessed.
 *   4. If `variant=` is already explicit, leave it as-is — only strip colors.
 *
 * Usage:
 *   node scripts/astryx-button-variant-codemod.mjs --dry <dir...>
 *   node scripts/astryx-button-variant-codemod.mjs        <dir...>
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const EXTS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const SKIP = ["bert-demo", "test-speech", "test-tts", "sentiment-test", "components/ui/button.tsx"];
const dry = process.argv.includes("--dry");
const dirs = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (dirs.length === 0) {
  console.error("Usage: node scripts/astryx-button-variant-codemod.mjs [--dry] <dir...>");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "__tests__") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (EXTS.has(extname(p)) && !SKIP.some((skip) => p.includes(skip))) out.push(p);
  }
  return out;
}

// A token is color-related if it sets a background, text, border, or ring
// color (including arbitrary hex values), across any variant prefix
// (hover:, focus:, active:, disabled:, dark:, group-hover:).
const COLOR_PROP = /^(bg|text|border|ring|from|to|via|fill|stroke|divide|placeholder|decoration|outline|caret|accent|shadow)-/;
const NAMED_COLOR = /-(red|blue|green|yellow|amber|orange|purple|pink|indigo|teal|cyan|emerald|slate|gray|zinc|violet|fuchsia|rose|sky|lime|black|white|neutral|stone)(-\d{2,3})?(\/\d{1,3})?$/;
const HEX_COLOR = /-\[#[0-9a-fA-F]{3,8}\]/;
const SEMANTIC_COLOR = /-(primary|secondary|accent|destructive|muted|card|popover|background|foreground|input|ring)(-foreground)?(\/\d{1,3})?$/;

function isColorToken(tok) {
  // strip variant prefixes (hover:, dark:, group-hover:, disabled:, etc.)
  const base = tok.replace(/^([a-z-]+:)+/, "");
  if (!COLOR_PROP.test(base)) return false;
  return NAMED_COLOR.test(base) || HEX_COLOR.test(base) || SEMANTIC_COLOR.test(base);
}

function classifyIntent(tokens) {
  const hasWhiteText = tokens.some((t) => /(^|:)text-white$/.test(t));
  const hasDarkText = tokens.some((t) => /(^|:)text-black$/.test(t) || /(^|:)text-gray-(7|8|9)00$/.test(t));
  const hasBorder = tokens.some((t) => /(^|:)border(-|$)/.test(t) && !/border-transparent/.test(t));
  const hasBgWhiteOrTransparentOrNone = !tokens.some((t) => /^bg-/.test(t)) ||
    tokens.some((t) => /^bg-white$/.test(t) || /^bg-transparent$/.test(t));
  const solidBg = tokens.find((t) => /^bg-(?!white$|transparent$)/.test(t) && isColorToken(t));
  const isRedBg = solidBg && /-(red|rose)(-\d{2,3})?$/.test(solidBg.replace(/^bg-/, "")) || tokens.some((t) => /^bg-destructive$/.test(t));
  const onlyHoverColors = tokens.every((t) => !isColorToken(t) || /^hover:/.test(t) || /^group-hover:/.test(t)) &&
    tokens.some((t) => isColorToken(t));

  if (isRedBg) return "destructive";
  if (hasWhiteText && solidBg) return null; // solid-color CTA -> Astryx default/primary, no variant needed
  if (hasBorder && hasBgWhiteOrTransparentOrNone && hasDarkText) return "outline";
  if (onlyHoverColors && !solidBg) return "ghost";
  if (!tokens.some(isColorToken)) return "SKIP_NO_COLOR"; // nothing to strip
  return "REVIEW";
}

function processClassName(original) {
  const tokens = original.trim().split(/\s+/);
  const colorTokens = tokens.filter(isColorToken);
  if (colorTokens.length === 0) return { changed: false };
  const kept = tokens.filter((t) => !isColorToken(t));
  const intent = classifyIntent(tokens);
  return { changed: true, kept, colorTokens, intent };
}

const REVIEW_LOG = [];
let filesChanged = 0, buttonsChanged = 0, buttonsSkippedDynamic = 0, buttonsSkippedNoColor = 0;

for (const dir of dirs) {
  for (const file of walk(dir)) {
    let src = readFileSync(file, "utf8");
    let fileChanged = false;

    // Find each <Button ...> opening tag by balanced-bracket scan from "<Button" to the closing ">".
    const tagStarts = [];
    let idx = 0;
    while ((idx = src.indexOf("<Button", idx)) !== -1) {
      // must be a tag boundary, not e.g. "<ButtonGroup"
      const after = src[idx + 7];
      if (after === " " || after === "\n" || after === ">" || after === "\t") tagStarts.push(idx);
      idx += 7;
    }

    // Process tags back-to-front so string index shifts from earlier edits don't invalidate later offsets.
    for (let i = tagStarts.length - 1; i >= 0; i--) {
      const start = tagStarts[i];
      let depth = 0, j = start, end = -1;
      for (; j < src.length; j++) {
        const c = src[j];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (c === ">" && depth === 0) { end = j; break; }
      }
      if (end === -1) continue;
      const tag = src.slice(start, end + 1);

      const dynamicClassName = /className=\{/.test(tag);
      const literalMatch = tag.match(/className="([^"]*)"/);
      const hasExplicitVariant = /\bvariant=/.test(tag);

      if (dynamicClassName && !literalMatch) {
        buttonsSkippedDynamic++;
        REVIEW_LOG.push({ file, line: src.slice(0, start).split("\n").length, reason: "dynamic className (cn()/template) — skipped, needs hand review", snippet: tag.slice(0, 120).replace(/\s+/g, " ") });
        continue;
      }
      if (!literalMatch) { buttonsSkippedNoColor++; continue; }

      const result = processClassName(literalMatch[1]);
      if (!result.changed) { buttonsSkippedNoColor++; continue; }

      // A variant already on the tag means the author already made the call —
      // just strip colors, never re-classify or override it.
      if (!hasExplicitVariant && result.intent === "REVIEW") {
        REVIEW_LOG.push({ file, line: src.slice(0, start).split("\n").length, reason: "no variant set + ambiguous color pattern — not auto-classified", snippet: literalMatch[1] });
        continue;
      }

      const newClassName = result.kept.join(" ").trim();
      let newTag;
      if (newClassName) {
        newTag = tag.replace(`className="${literalMatch[1]}"`, `className="${newClassName}"`);
      } else if (new RegExp(`^[ \\t]*className="${literalMatch[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\n`, "m").test(tag)) {
        // className sat alone on its own line — remove the whole line (including its
        // newline) rather than leave a blank line with trailing indentation behind.
        newTag = tag.replace(new RegExp(`^[ \\t]*className="${literalMatch[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\n`, "m"), "");
      } else {
        // className shared a line with other content (e.g. "<Button className=\"...\">").
        // Removing it can leave exactly one stray space directly before the tag's own
        // closing bracket. Require a non-whitespace char right before that space so an
        // indented `>` sitting alone on its own line (preceded by a newline) is never
        // touched — only a same-line artifact matches.
        newTag = tag.replace(`className="${literalMatch[1]}"`, "").replace(/([^\s]) +(\/?>)$/, "$1$2");
      }

      if (!hasExplicitVariant && (result.intent === "ghost" || result.intent === "destructive" || result.intent === "outline")) {
        newTag = newTag.replace(/^<Button/, `<Button variant="${result.intent}"`);
      }

      src = src.slice(0, start) + newTag + src.slice(end + 1);
      fileChanged = true;
      buttonsChanged++;
    }

    if (fileChanged) {
      filesChanged++;
      console.log(`${dry ? "would edit" : "edited"}  ${file}`);
      if (!dry) writeFileSync(file, src, "utf8");
    }
  }
}

console.log(`\n${dry ? "[dry run] " : ""}${buttonsChanged} button(s) updated across ${filesChanged} file(s).`);
console.log(`${buttonsSkippedNoColor} button(s) had no color classes to strip (untouched).`);
console.log(`${buttonsSkippedDynamic} button(s) skipped (dynamic className — see review log).`);

if (REVIEW_LOG.length) {
  console.log(`\n⚠  ${REVIEW_LOG.length} item(s) need manual review:\n`);
  for (const r of REVIEW_LOG) {
    console.log(`  ${r.file}:${r.line}  [${r.reason}]`);
    console.log(`     ${r.snippet}`);
  }
} else {
  console.log("\n✓ no manual-review items.");
}
