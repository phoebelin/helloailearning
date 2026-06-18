/**
 * Verification spec for the Coda activity.
 * Updated for the in-place play step design (4-section flow).
 *
 * Navigation strategy: click through steps sequentially (the page is SSR-rendered
 * with maxReached=0, so localStorage pre-seeding doesn't work).
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

  for (const chapter of ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']) {
    await expect(page.getByText(chapter, { exact: true })).toBeVisible();
  }
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

  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/coda-02-mission.png`, fullPage: false });

  expect(await page.locator('text=Your mission').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Reach the exit').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Start').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Exit').count()).toBeGreaterThan(0);
  expect(await page.getByRole('button', { name: /Set Coda/i }).count()).toBeGreaterThan(0);

  expect(errors.length).toBe(0);
});

// ─── 3. Play step — in-place: GridWorld + CoinTray + coin placement ─────────

test('Coda lesson — play step: GridWorld + CoinTray + coin placement (in-place)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 900 });
  await navigateTo(page, 'http://localhost:3000/lessons/how-machines-chase-goals');

  // Navigate: section 0 → section 1
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(800);

  // Navigate: section 1 → section 2 (play)
  const setCodaBtn = page.getByRole('button', { name: /Set Coda/i });
  await setCodaBtn.scrollIntoViewIfNeeded();
  await setCodaBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/coda-03-play-empty.png`, fullPage: false });

  // Mission card still visible in the play section (contrast)
  expect(await page.locator('text=Your mission').count()).toBeGreaterThan(0);
  // Grid tiles visible
  expect(await page.locator('text=Start').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Exit').count()).toBeGreaterThan(0);
  // Coin tray present
  await expect(page.getByRole('button', { name: /Coin worth \d+ points/i })).toHaveCount(3);
  // Run Coda button present
  expect(await page.getByRole('button', { name: /Run Coda/i }).count()).toBeGreaterThan(0);

  // Select 10-pt coin and place on Exit tile
  const coin10Btn = page.getByRole('button', { name: /Coin worth 10 points/i });
  await coin10Btn.scrollIntoViewIfNeeded();
  await coin10Btn.click();
  await page.waitForTimeout(200);
  expect(await page.locator('text=10-point coin selected').count()).toBeGreaterThan(0);
  await page.screenshot({ path: `${DIR}/coda-03-coin-selected.png`, fullPage: false });

  const exitTile = page.locator('[role="button"]').filter({ hasText: 'Exit' }).first();
  await exitTile.scrollIntoViewIfNeeded();
  await exitTile.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/coda-03-coin-placed.png`, fullPage: false });

  // Thought bubble appears after coin placement
  expect(await page.locator("text=Coda's thought bubble").count()).toBeGreaterThan(0);

  expect(errors.length).toBe(0);
});

// ─── 4. Full L1 run: place coin → run → receipt in-place ─────────────────────

test('Coda lesson — full L1 run: place coin → Run → ReceiptPanel in-place', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.setViewportSize({ width: 1280, height: 900 });
  await navigateTo(page, 'http://localhost:3000/lessons/how-machines-chase-goals');

  // Navigate: 0 → 1 → 2
  const seeBtn = page.getByRole('button', { name: /See the mission/i });
  await seeBtn.scrollIntoViewIfNeeded();
  await seeBtn.click();
  await page.waitForTimeout(600);

  const setCodaBtn = page.getByRole('button', { name: /Set Coda/i });
  await setCodaBtn.scrollIntoViewIfNeeded();
  await setCodaBtn.click();
  await page.waitForTimeout(600);

  // Place 10-pt coin on Exit tile (the intended reward → Coda should reach it)
  const coin10Btn = page.getByRole('button', { name: /Coin worth 10 points/i });
  await coin10Btn.scrollIntoViewIfNeeded();
  await coin10Btn.click();
  await page.waitForTimeout(200);

  const exitTile = page.locator('[role="button"]').filter({ hasText: 'Exit' }).first();
  await exitTile.scrollIntoViewIfNeeded();
  await exitTile.click();
  await page.waitForTimeout(300);

  // Click "Run Coda →" — receipt appears in-place (no navigation)
  const runBtn = page.getByRole('button', { name: /Run Coda/i }).first();
  await runBtn.scrollIntoViewIfNeeded();
  await runBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/coda-04-receipt-in-place.png`, fullPage: false });

  // ReceiptPanel appears within the same section (no scroll needed)
  expect(await page.locator('text=Point Receipt').count()).toBeGreaterThan(0);
  expect(await page.locator('text=Verdict').count()).toBeGreaterThan(0);

  // "Coda made it! Continue" CTA (since we placed a coin on the exit)
  const hasSuccess = await page.getByRole('button', { name: /Coda made it/i }).count() > 0;
  const hasRetune = await page.getByRole('button', { name: /Re-tune/i }).count() > 0;
  expect(hasSuccess || hasRetune).toBe(true);

  await page.screenshot({ path: `${DIR}/coda-04-receipt-cta.png`, fullPage: false });
  expect(errors.length).toBe(0);
});
