/**
 * Verification spec for the Coda interactive grid milestone.
 * Tests: courses layout fix (6.1a), GridWorld + CoinTray + MissionCard + ReceiptPanel rendering.
 *
 * Navigation strategy: click through steps sequentially (the page is SSR-rendered
 * with maxReached=0, so localStorage pre-seeding doesn't work). After each button
 * click, scroll the next button into view before clicking.
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const DIR = path.join(process.cwd(), 'verification/2026-06-16');

async function navigateTo(page: Parameters<Parameters<typeof test>[1]>[0], url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600); // wait for React hydration
}

// ─── 1. Courses page layout ───────────────────────────────────────────────────

test('Courses page — all 4 chapter tiles visible on 1280px viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.setViewportSize({ width: 1280, height: 800 });
  await navigateTo(page, 'http://localhost:3000/courses');
  await page.screenshot({ path: `${DIR}/courses-1280px.png`, fullPage: true });

  // All 4 chapter headings present and visible
  for (const chapter of ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']) {
    await expect(page.getByText(chapter, { exact: true })).toBeVisible();
  }
  // Coda locked tile shows unlock message
  await expect(page.getByText(/update understanding with Pippy to unlock/i)).toBeVisible();

  const realErrors = errors.filter(e => !e.includes('404'));
  expect(realErrors.length).toBe(0);
});

// ─── 2. Mission step — MissionCard + GridWorld ────────────────────────────────

test('Coda lesson — mission step: MissionCard and GridWorld with ghost path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 900 });
  await navigateTo(page, 'http://localhost:3000/lessons/how-machines-chase-goals');

  // Click "See the mission" to advance to section 1
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/coda-02-mission.png`, fullPage: false });

  // Section 1 is now in the DOM
  expect(await page.locator('text=Your mission').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Reach the exit').count()).toBeGreaterThan(0);
  // GridWorld tile labels
  expect(await page.locator('text=Start').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Exit').count()).toBeGreaterThan(0);
  // "Set Coda's reward" CTA
  expect(await page.getByRole('button', { name: /Set Coda/i }).count()).toBeGreaterThan(0);

  expect(errors.length).toBe(0);
});

// ─── 3. SetReward step — GridWorld + CoinTray + coin placement ─────────────────

test('Coda lesson — set-reward step: GridWorld + CoinTray + coin placement', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 900 });
  await navigateTo(page, 'http://localhost:3000/lessons/how-machines-chase-goals');

  // Navigate: section 0 → section 1
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(800);

  // Navigate: section 1 → section 2
  const setCodaBtn = page.getByRole('button', { name: /Set Coda/i });
  await setCodaBtn.scrollIntoViewIfNeeded();
  await setCodaBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/coda-03-set-reward-empty.png`, fullPage: false });

  // Set-reward section in DOM
  expect(await page.locator('h1:has-text("Give Coda a reward")').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Select a coin value, then tap a tile').count()).toBeGreaterThan(0);
  // GridWorld tiles
  expect(await page.locator('text=Start').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Exit').count()).toBeGreaterThan(0);

  // 3 coin buttons
  await expect(page.getByRole('button', { name: /Coin worth \d+ points/i })).toHaveCount(3);

  // Select 10-pt coin
  const coin10Btn = page.getByRole('button', { name: /Coin worth 10 points/i });
  await coin10Btn.scrollIntoViewIfNeeded();
  await coin10Btn.click();
  await page.waitForTimeout(200);
  expect(await page.locator('text=10-point coin selected').count()).toBeGreaterThan(0);
  await page.screenshot({ path: `${DIR}/coda-03-coin-selected.png`, fullPage: false });

  // Place coin on Exit tile
  const exitTile = page.locator('[role="button"]').filter({ hasText: 'Exit' }).first();
  await exitTile.scrollIntoViewIfNeeded();
  await exitTile.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/coda-03-coin-placed.png`, fullPage: false });

  // Reward summary panel appears
  const summaryCount =
    await page.locator("text=Coda's reward (what it sees)").count() +
    await page.locator("text=Coda’s reward (what it sees)").count();
  expect(summaryCount).toBeGreaterThan(0);

  // Run Coda button exists
  expect(await page.getByRole('button', { name: /Run Coda/i }).count()).toBeGreaterThan(0);

  expect(errors.length).toBe(0);
});

// ─── 4. Full flow: run step → receipt ─────────────────────────────────────────

test('Coda lesson — full L1 run: place coin → run → ReceiptPanel with verdict', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 900 });
  await navigateTo(page, 'http://localhost:3000/lessons/how-machines-chase-goals');

  // Navigate: section 0 → 1 → 2
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(600);

  const setCodaBtn = page.getByRole('button', { name: /Set Coda/i });
  await setCodaBtn.scrollIntoViewIfNeeded();
  await setCodaBtn.click();
  await page.waitForTimeout(600);

  // Place 10-pt coin on Exit tile
  const coin10Btn = page.getByRole('button', { name: /Coin worth 10 points/i });
  await coin10Btn.scrollIntoViewIfNeeded();
  await coin10Btn.click();
  await page.waitForTimeout(200);

  const exitTile = page.locator('[role="button"]').filter({ hasText: 'Exit' }).first();
  await exitTile.scrollIntoViewIfNeeded();
  await exitTile.click();
  await page.waitForTimeout(300);

  // Section 2: click "Run Coda" → goes to section 3 (run step)
  const runBtn1 = page.getByRole('button', { name: /Run Coda/i }).first();
  await runBtn1.scrollIntoViewIfNeeded();
  await runBtn1.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/coda-04-run-step.png`, fullPage: false });

  // Section 3 should now have "Ready to run" heading and "Run Coda →" button
  expect(await page.locator('h1:has-text("Ready to run")').count()).toBeGreaterThan(0);
  expect(await page.locator('text=thought bubble').count()).toBeGreaterThan(0);

  // Section 3: click "Run Coda →" → runs agent → goes to section 4 (receipt)
  // Use exact text to distinguish from section 2's "Run Coda" button (still in DOM)
  const runBtn2 = page.getByRole('button', { name: 'Run Coda →', exact: true });
  await runBtn2.scrollIntoViewIfNeeded();
  await runBtn2.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/coda-05-receipt.png`, fullPage: false });

  // ReceiptPanel in DOM
  expect(await page.locator('text=Point Receipt').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Verdict').count()).toBeGreaterThan(0);

  // CTA present
  const hasAnyCTA =
    (await page.getByRole('button', { name: /Re-tune/i }).count()) > 0 ||
    (await page.getByRole('button', { name: /Coda made it/i }).count()) > 0;
  expect(hasAnyCTA).toBe(true);

  await page.screenshot({ path: `${DIR}/coda-05-receipt-final.png`, fullPage: false });
  expect(errors.length).toBe(0);
});
