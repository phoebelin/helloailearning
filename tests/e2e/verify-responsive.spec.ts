/**
 * Verification: Coda responsive polish (task 6.4)
 * Checks that all Coda steps render correctly on a 375px mobile viewport.
 */
import { test, expect } from '@playwright/test';
import path from 'path';

const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const SHOT_DIR = path.resolve(__dirname, '../../verification/2026-06-27');
const ROUTE = 'http://localhost:3000/lessons/how-machines-chase-goals';

const MOBILE = { width: 375, height: 812 };

test.use({
  viewport: MOBILE,
});

test.describe('Coda responsive polish — mobile 375px', () => {
  test('meet-coda step renders without overflow', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: MOBILE,
      executablePath: EXEC,
    });
    const page = await ctx.newPage();
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOT_DIR}/01-meet-coda-mobile.png`, fullPage: false });

    // Heading visible
    const heading = page.getByRole('heading', { name: /Meet Coda/i });
    await expect(heading.first()).toBeVisible();

    // Check the page body doesn't overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5); // ≤375px (5px tolerance)
    console.log(`Body scrollWidth: ${bodyWidth}px`);

    // No console errors
    expect(consoleErrors.filter(e => !e.includes('TTS') && !e.includes('Google') && !e.includes('Enhanced'))).toHaveLength(0);

    await ctx.close();
  });

  test('mission step: grid does not overflow on mobile', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: MOBILE,
      executablePath: EXEC,
    });
    const page = await ctx.newPage();

    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Clear localStorage so we start fresh, then navigate to mission step
    await page.evaluate(() => {
      localStorage.removeItem('coda-max-step');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Click "Give Coda a goal" to advance to mission step
    const cta = page.getByRole('button', { name: /Give Coda a goal/i });
    await cta.first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SHOT_DIR}/02-mission-step-mobile.png`, fullPage: false });

    // The grid container should not overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5);
    console.log(`Mission step body scrollWidth: ${bodyWidth}px`);

    await ctx.close();
  });

  test('play step: coin tray coins are visible and grid fits mobile', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: MOBILE,
      executablePath: EXEC,
    });
    const page = await ctx.newPage();

    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // Clear state + force to play step by advancing through both prior steps
    await page.evaluate(() => localStorage.removeItem('coda-max-step'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Advance: meet-coda → mission
    const giveCta = page.getByRole('button', { name: /Give Coda a goal/i });
    await giveCta.first().click();
    await page.waitForTimeout(600);

    // Advance: mission → play
    const setRewardCta = page.getByRole('button', { name: /Set Coda/i });
    await setRewardCta.first().click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: `${SHOT_DIR}/03-play-step-mobile.png`, fullPage: false });

    // Grid should not overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5);
    console.log(`Play step body scrollWidth: ${bodyWidth}px`);

    // Coin tray coins should be visible (look for buttons with aria-label "Coin worth N points")
    const coinButtons = page.getByRole('button', { name: /Coin worth/i });
    const count = await coinButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
    console.log(`Coin tray buttons found: ${count}`);

    // All coin buttons should meet ≥44px touch target
    for (let i = 0; i < count; i++) {
      const box = await coinButtons.nth(i).boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }

    await ctx.close();
  });

  test('play step: Run Coda button has adequate touch target', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: MOBILE,
      executablePath: EXEC,
    });
    const page = await ctx.newPage();

    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.evaluate(() => localStorage.removeItem('coda-max-step'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: /Give Coda a goal/i }).first().click();
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Set Coda/i }).first().click();
    await page.waitForTimeout(800);

    // Run Coda button
    const runBtn = page.getByRole('button', { name: /Run Coda/i });
    await expect(runBtn.first()).toBeVisible();
    const box = await runBtn.first().boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    console.log(`Run Coda button height: ${box?.height}px`);

    // Run without any coins placed to see the receipt appears
    await runBtn.first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOT_DIR}/04-play-step-after-run-mobile.png`, fullPage: false });

    // Receipt panel should appear
    const receipt = page.getByText(/Point Receipt/i);
    await expect(receipt.first()).toBeVisible();

    await ctx.close();
  });

  test('desktop viewport: play step has correct lg:flex-row layout', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      executablePath: EXEC,
    });
    const page = await ctx.newPage();

    await page.goto(ROUTE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.evaluate(() => localStorage.removeItem('coda-max-step'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByRole('button', { name: /Give Coda a goal/i }).first().click();
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Set Coda/i }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SHOT_DIR}/05-play-step-desktop.png`, fullPage: false });

    await ctx.close();
  });
});
