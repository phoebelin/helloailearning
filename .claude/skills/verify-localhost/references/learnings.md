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

## 2026-06-14 — Seed: Chrome MCP often absent in headless/cloud routine runs
- **Symptom:** mcp__Claude_in_Chrome__* tools unavailable when invoked from the daily
  roadmap routine (no interactive browser/extension session).
- **Root cause:** the Claude-in-Chrome extension is interactively authenticated; headless
  cron/cloud runs don't have it connected.
- **Workaround/fix applied:** use the Playwright headless fallback (already a repo dep) for
  screenshots and console/network capture.
- **Prevention for next run:** in headless contexts, skip straight to the Playwright
  fallback instead of waiting on Chrome MCP to time out.
