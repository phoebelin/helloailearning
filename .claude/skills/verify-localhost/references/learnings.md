# verify-localhost — learnings log

Append an entry every time you hit a blocker. Read this file at the start of every run and
apply known workarounds proactively. Newest entries at the bottom.

Format:
```
## <YYYY-MM-DD> — <short blocker title>
- **Symptom:** what you observed
- **Root cause:** why it happened
- **Workaround/fix applied:** what unblocked it
- **Prevention for next run:** what to do up front next time
```

---

## 2026-06-18 — Playwright Chromium download blocked; pre-installed version works
- **Symptom:** `npx playwright install chromium` fails with download error (network policy).
- **Root cause:** Cloud environment blocks downloading new browser binaries.
- **Workaround/fix applied:** Used pre-installed headless shell at
  `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` via
  `chromiumBrowser.launch({ executablePath: EXEC })` in the test.
- **Prevention for next run:** Always use this executablePath in custom Playwright specs;
  avoid `npx playwright install`.

## 2026-06-18 — Curly apostrophes and multi-section selectors in Coda specs
- **Symptom:** `getByText("Coda's thought bubble")` with straight apostrophe found 0
  elements; `getByText('Exit')` strict mode violation; `getByText('Your mission')`
  strict mode violation.
- **Root cause:** (1) Components use `&rsquo;` (U+2019) — rendered as `'`, not `'`.
  (2) Multiple scroll sections stay in DOM, so a selector can match the same text in
  section 1 AND section 2 simultaneously.
- **Workaround/fix applied:** Use partial text (e.g. `text=thought bubble`), `{ exact: true }`
  on unambiguous labels, `.first()` for labels that appear in multiple live sections.
- **Prevention for next run:** In multi-section scroll layouts, always add `.first()` or
  a more specific ancestor locator. Avoid matching `&rsquo;` with straight apostrophes.

## 2026-06-14 — Seed: Chrome MCP often absent in headless/cloud routine runs
- **Symptom:** mcp__Claude_in_Chrome__* tools unavailable when invoked from the daily
  roadmap routine (no interactive browser/extension session).
- **Root cause:** the Claude-in-Chrome extension is interactively authenticated; headless
  cron/cloud runs don't have it connected.
- **Workaround/fix applied:** use the Playwright headless fallback (already a repo dep) for
  screenshots and console/network capture.
- **Prevention for next run:** in headless contexts, skip straight to the Playwright
  fallback instead of waiting on Chrome MCP to time out.
