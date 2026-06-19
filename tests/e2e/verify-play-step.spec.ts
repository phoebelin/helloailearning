/**
 * Verification spec for the in-place play step milestone.
 * Uses executablePath to point at the pre-installed Chromium.
 */
import { test, expect, chromium as chromiumBrowser } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const DIR = path.join(process.cwd(), 'verification/2026-06-18');
fs.mkdirSync(DIR, { recursive: true });

const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

async function go(page: Parameters<Parameters<typeof test>[1]>[0], url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
}

// ─── 1. Courses page ──────────────────────────────────────────────────────────
test('courses — all 4 chapter tiles visible', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  try {
    await go(page, 'http://localhost:3000/courses');
    await page.screenshot({ path: `${DIR}/01-courses.png`, fullPage: true });
    for (const ch of ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']) {
      await expect(page.getByText(ch, { exact: true })).toBeVisible();
    }
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});

// ─── 2. Meet Coda step ────────────────────────────────────────────────────────
test('coda — meet-coda: loads with 4-segment progress bar', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await go(page, 'http://localhost:3000/lessons/how-machines-chase-goals');
    await page.screenshot({ path: `${DIR}/02-meet-coda.png`, fullPage: false });
    await expect(page.getByText('Meet Coda!', { exact: true })).toBeVisible();
    // Progress bar: exactly 4 segments
    const bars = page.locator('div.h-3');
    await expect(bars).toHaveCount(4);
    await expect(page.getByRole('button', { name: /See the mission/i })).toBeVisible();
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});

// ─── 3. Mission step ─────────────────────────────────────────────────────────
test('coda — mission step: grid + ghost path + CTA', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await go(page, 'http://localhost:3000/lessons/how-machines-chase-goals');
    await page.getByRole('button', { name: /See the mission/i }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${DIR}/03-mission.png`, fullPage: false });
    await expect(page.getByText('Reach the exit')).toBeVisible();
    await expect(page.getByText('Start', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Set Coda/i })).toBeVisible();
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});

// ─── 4. Play step: initial state ─────────────────────────────────────────────
test('coda — play step: mission card + grid + coin tray + run button', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await go(page, 'http://localhost:3000/lessons/how-machines-chase-goals');
    await page.getByRole('button', { name: /See the mission/i }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Set Coda/i }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${DIR}/04-play-initial.png`, fullPage: false });

    await expect(page.getByText('Your mission').first()).toBeVisible();
    await expect(page.getByText('Start').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Coin worth \d+ points/i })).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Run Coda/i })).toBeVisible();
    expect(await page.locator('text=Point Receipt').count()).toBe(0);
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});

// ─── 5. Run with no coins → wander → receipt in-place → re-tune ──────────────
test('coda — play step: run/receipt/re-tune all in-place', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await go(page, 'http://localhost:3000/lessons/how-machines-chase-goals');
    await page.getByRole('button', { name: /See the mission/i }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Set Coda/i }).click();
    await page.waitForTimeout(900);

    // Run with no coins (wander)
    await page.getByRole('button', { name: /Run Coda/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/05-receipt-no-coins.png`, fullPage: false });

    // Receipt appears in-place
    expect(await page.locator('text=Point Receipt').count()).toBeGreaterThan(0);
    expect(await page.locator('text=Verdict').count()).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: /Re-tune/i })).toBeVisible();

    // Re-tune restores coin tray without scroll
    await page.getByRole('button', { name: /Re-tune/i }).click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/05b-retune-back.png`, fullPage: false });
    expect(await page.locator('text=Point Receipt').count()).toBe(0);
    await expect(page.getByRole('button', { name: /Coin worth \d+ points/i })).toHaveCount(3);
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});

// ─── 6. Coin on exit → "Coda made it!" ──────────────────────────────────────
test('coda — play step: coin on exit → success CTA', async ({ }) => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await go(page, 'http://localhost:3000/lessons/how-machines-chase-goals');
    await page.getByRole('button', { name: /See the mission/i }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Set Coda/i }).click();
    await page.waitForTimeout(900);

    // Place 10-pt coin on Exit
    await page.getByRole('button', { name: /Coin worth 10 points/i }).click();
    await page.waitForTimeout(200);
    const exitTile = page.locator('[role="button"]').filter({ hasText: 'Exit' }).first();
    await exitTile.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/06-coin-placed.png`, fullPage: false });
    expect(await page.locator("text=thought bubble").count()).toBeGreaterThan(0);

    // Run
    await page.getByRole('button', { name: /Run Coda/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${DIR}/07-receipt-success.png`, fullPage: false });

    await expect(page.getByRole('button', { name: /Coda made it/i })).toBeVisible();
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});
