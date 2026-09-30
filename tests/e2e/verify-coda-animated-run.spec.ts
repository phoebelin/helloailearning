/**
 * Coda play step: the run trail draws progressively, the receipt waits until the
 * run finishes, and "Skip to the result" jumps straight to the receipt.
 */
import { test, expect, chromium as chromiumBrowser } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const DIR = path.join(process.cwd(), 'verification/2026-09-30');
fs.mkdirSync(DIR, { recursive: true });

const EXEC =
  process.env.PW_CHROMIUM_EXEC ??
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

async function openPlay(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Give Coda a goal/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /Set Coda/i }).click();
  await page.waitForTimeout(900);
  await page.getByRole('button', { name: /Coin worth 10 points/i }).click();
  await page.locator('[role="button"]').filter({ hasText: 'Exit' }).first().click();
  await page.waitForTimeout(300);
}

test('coda run — trail draws progressively, receipt waits, skip works', async () => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && !/Web Speech API/.test(m.text()) && errors.push(m.text()));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await openPlay(page);
    // Trail tiles are the ones with the blue run border.
    const trail = () => page.locator('div[style*="rgb(29, 78, 216)"]').count();
    await page.getByRole('button', { name: /Run Coda/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${DIR}/01-run-in-progress.png` });
    const early = await trail();
    await expect(page.getByText(/chasing points/i)).toBeVisible();
    expect(await page.locator('text=Point Receipt').count()).toBe(0);
    await page.waitForTimeout(1200);
    const later = await trail();
    expect(later).toBeGreaterThan(early);
    await page.waitForSelector('text=Point Receipt', { timeout: 15000 });
    await page.screenshot({ path: `${DIR}/02-run-finished-receipt.png` });
    await expect(page.getByRole('button', { name: /Coda made it/i })).toBeVisible();

    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

test('coda run — skip to the result', async () => {
  const browser = await chromiumBrowser.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await openPlay(page);
    await page.getByRole('button', { name: /Run Coda/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Skip to the result/i }).click();
    await expect(page.locator('text=Point Receipt').first()).toBeVisible({ timeout: 2000 });
    await page.screenshot({ path: `${DIR}/03-after-skip.png` });
    await expect(page.getByRole('button', { name: /Coda made it/i })).toBeVisible();
  } finally {
    await browser.close();
  }
});
