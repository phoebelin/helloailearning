/** Verification: dedicated coins-only thought bubble (task 4.4). */
import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const DIR = path.join(process.cwd(), 'verification/2026-10-09');
fs.mkdirSync(DIR, { recursive: true });
const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

test('thought bubble: empty state, then lists a placed coin, never shows mission', async () => {
  const browser = await chromium.launch({ executablePath: EXEC });
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 900 });
  try {
    await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Give Coda a goal/i }).click();
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: /Set Coda/i }).click();
    await page.waitForTimeout(900);

    await expect(page.getByTestId('thought-bubble-empty')).toBeVisible();
    await page.screenshot({ path: `${DIR}/bubble-empty.png` });

    await page.getByRole('button', { name: /Coin worth \d+ points/i }).first().click();
    const tiles = page.locator('[role="button"][tabindex="0"]').filter({ hasNot: page.locator('img') });
    // click grid tiles until a coin lands (first clickable non-coin tile)
    const n = await tiles.count();
    for (let i = 0; i < n; i++) {
      await tiles.nth(i).click({ trial: true }).catch(() => {});
      await tiles.nth(i).click().catch(() => {});
      if (await page.getByText(/square \d across/).count()) break;
      await page.getByRole('button', { name: /Coin worth \d+ points/i }).first().click().catch(() => {});
    }
    await expect(page.getByText(/square \d across, \d down/).first()).toBeVisible();
    await expect(page.getByText(/Points on the board/)).toBeVisible();
    await page.screenshot({ path: `${DIR}/bubble-with-coin.png` });
    // never leaks mission text
    const bubble = await page.getByTestId('thought-bubble').innerText();
    expect(bubble).not.toMatch(/reach the exit/i);
    expect(errors).toHaveLength(0);
  } finally { await browser.close(); }
});
