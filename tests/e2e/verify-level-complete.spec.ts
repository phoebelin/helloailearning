/**
 * Verification spec for level-complete "what changed" panel milestone.
 * Uses pre-installed headless Chromium (cloud env).
 */
import { chromium, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:3000';
const SHOT_DIR = path.join(__dirname, '../../verification/2026-06-20');

const consoleErrors: string[] = [];
const networkFails: string[] = [];

async function shot(page: Page, name: string) {
  const p = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`Screenshot: ${name}.png`);
}

async function scrollTo(page: Page, sectionIndex: number) {
  await page.evaluate((idx: number) => {
    const sections = document.querySelectorAll('[style*="scroll-snap-align"]');
    const target = sections[idx] as HTMLElement | undefined;
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, sectionIndex);
  await page.waitForTimeout(600);
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: EXEC,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('favicon') && !resp.url().includes('_next/static/chunks/')) {
      networkFails.push(`${resp.status()} ${resp.url()}`);
    }
  });

  // ---- 1. Load the lesson ----
  console.log('Navigating to /lessons/how-machines-chase-goals...');
  await page.goto(`${BASE}/lessons/how-machines-chase-goals`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await shot(page, '01-meet-coda-initial');

  // ---- 2. Advance past meet-coda → mission ----
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.waitFor({ timeout: 5000 });
  await seeBtn.click();
  await page.waitForTimeout(1200);
  await shot(page, '02-mission-step');

  // ---- 3. Advance past mission → play ----
  const setCTAs = page.getByRole('button', { name: /Set the reward|reward/i });
  if (await setCTAs.count() > 0) {
    await setCTAs.first().click();
  } else {
    // Try clicking any "next" button in section 1
    const nextBtn = page.getByRole('button', { name: /next|continue|reward/i }).first();
    await nextBtn.click();
  }
  await page.waitForTimeout(1200);
  await shot(page, '03-play-step-initial');

  // ---- 4a. First run (FAIL): no coins, just click Run ----
  console.log('Running Coda with no coins (expected: wandered)...');
  const runBtn1 = page.getByRole('button', { name: /Run Coda/i }).first();
  await runBtn1.waitFor({ timeout: 5000 });
  await runBtn1.click();
  await page.waitForTimeout(1500);
  await shot(page, '04-play-first-run-result');

  // ---- 4b. Re-tune (go back to coin placement) ----
  const retuneBtn = page.getByRole('button', { name: /Re-tune/i }).first();
  if (await retuneBtn.isVisible()) {
    await retuneBtn.click();
    await page.waitForTimeout(800);
    await shot(page, '05-play-retune');
  }

  // ---- 4c. Drag a coin via keyboard fallback (click-select + click-tile) ----
  // The play step has a click fallback: select a value, then click a tile.
  // We need to place a coin on the exit tile (x=3, y=3 for a 4x4 grid).
  // The coin tray has value buttons; the grid tiles are divs with data.

  // Select coin value from tray (click on a coin card in the tray)
  const coinCards = page.locator('[data-coin-value]');
  const coinCount = await coinCards.count();
  console.log(`Found ${coinCount} coin cards with data-coin-value`);

  if (coinCount > 0) {
    await coinCards.first().click();
  } else {
    // Try clicking a button with "10" or similar value in the coin tray
    const coinButtons = page.getByRole('button').filter({ hasText: /^10$/ });
    if (await coinButtons.count() > 0) {
      await coinButtons.first().click();
    } else {
      // Try any numbered button
      const numBtn = page.getByRole('button').filter({ hasText: /^\d+$/ }).first();
      if (await numBtn.isVisible()) await numBtn.click();
    }
  }
  await page.waitForTimeout(500);

  // Click the exit tile (last tile in grid, text "Exit")
  const exitTile = page.getByText('Exit').first();
  if (await exitTile.isVisible()) {
    await exitTile.click();
    await page.waitForTimeout(500);
    await shot(page, '06-coin-placed-on-exit');
  }

  // ---- 4d. Second run (expected: reachedTarget) ----
  console.log('Running Coda with coin on exit (expected: reachedTarget)...');
  const runBtn2 = page.getByRole('button', { name: /Run Coda/i }).first();
  await runBtn2.waitFor({ timeout: 5000 });
  await runBtn2.click();
  await page.waitForTimeout(1500);
  await shot(page, '07-play-second-run-result');

  // ---- 5. Advance to level-complete ----
  const successBtn = page.getByRole('button', { name: /Coda made it|Continue/i }).first();
  if (await successBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await successBtn.click();
    await page.waitForTimeout(1500);
    await shot(page, '08-level-complete');

    // Verify the level-complete content
    const pageContent = await page.content();

    const hasWhatChanged = pageContent.includes('What changed') || pageContent.includes('what changed');
    const hasTakeaway = pageContent.includes('What just happened');
    const hasNextLevel = pageContent.includes('Next level');
    const hasDoneForNow = pageContent.includes("done for now") || pageContent.includes("I’m done");
    const hasCelebration = pageContent.includes('canvas'); // Celebration renders a canvas

    console.log(`\n=== Level-complete checks ===`);
    console.log(`  "What changed" panel: ${hasWhatChanged ? '✓ FOUND' : '✗ MISSING'}`);
    console.log(`  "What just happened" takeaway: ${hasTakeaway ? '✓ FOUND' : '✗ MISSING'}`);
    console.log(`  "Next level!" CTA: ${hasNextLevel ? '✓ FOUND' : '✗ MISSING'}`);
    console.log(`  "I'm done for now" CTA: ${hasDoneForNow ? '✓ FOUND' : '✗ MISSING'}`);
    console.log(`  Celebration canvas: ${hasCelebration ? '✓ FOUND' : '✗ MISSING'}`);

    // ---- 6. Check "I'm done for now" button ----
    const doneBtn = page.getByRole('button', { name: /done for now/i });
    if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await doneBtn.click();
      await page.waitForTimeout(1200);
      await shot(page, '09-session-summary-via-done');

      const summaryContent = await page.content();
      const hasSessionSummary = summaryContent.includes('reward designer') || summaryContent.includes('Great work');
      console.log(`  Session summary after "I'm done for now": ${hasSessionSummary ? '✓ FOUND' : '✗ MISSING'}`);
    } else {
      console.log('  "I\'m done for now" button: NOT VISIBLE (may be hidden at L2+ or already on session-summary)');
    }
  } else {
    console.log('WARNING: Did not reach level-complete — play step success button not found');
    await shot(page, '08-play-step-stuck');
  }

  // ---- Console and network summary ----
  console.log(`\n=== Console errors: ${consoleErrors.length} ===`);
  consoleErrors.forEach(e => console.log(`  ERROR: ${e}`));
  console.log(`\n=== Network failures: ${networkFails.length} ===`);
  networkFails.forEach(f => console.log(`  FAIL: ${f}`));

  await browser.close();
  console.log('\nVerification spec complete.');
})().catch(err => {
  console.error('Spec failed with error:', err);
  process.exit(1);
});
