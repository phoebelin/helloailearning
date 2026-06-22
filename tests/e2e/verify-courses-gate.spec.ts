import { test, expect } from '@playwright/test';
import path from 'path';

const DATE = '2026-06-22';
const outDir = path.join(process.cwd(), `verification/${DATE}`);

// Activity tracking uses key 'completed-activities' with format [{id, completedAt}]
function makeCompletedActivities(ids: string[]) {
  return JSON.stringify(ids.map(id => ({ id, completedAt: Date.now() })));
}

test.describe('Courses page – Chapter 4 gate', () => {
  test('Chapter 4 is locked when Pippy is not complete', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Navigate and ensure no Pippy completion in storage
    await page.goto('http://localhost:3000/courses');
    await page.evaluate(() => localStorage.removeItem('completed-activities'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // wait for client hydration

    await page.screenshot({ path: `${outDir}/courses-ch4-locked.png` });

    // The unlock message should appear
    const lockText = page.getByText(/Complete.*Pippy.*to unlock/, { exact: false });
    await expect(lockText).toBeVisible({ timeout: 8000 });

    // The Chapter 4 accessible button should NOT exist
    const ch4Button = page.locator('button').filter({ hasText: /How machines chase.*goals with Coda/s });
    await expect(ch4Button).toHaveCount(0);

    console.log('✅ Chapter 4 locked state verified');
  });

  test('Chapter 4 is accessible when Pippy is complete', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Navigate and seed Pippy completion with correct format
    await page.goto('http://localhost:3000/courses');
    await page.evaluate((val) => {
      localStorage.setItem('completed-activities', val);
    }, makeCompletedActivities(['update-understanding-pippy']));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // wait for client hydration

    await page.screenshot({ path: `${outDir}/courses-ch4-unlocked.png` });

    // Chapter 4 should show as a button (not locked)
    const ch4Button = page.locator('button').filter({ hasText: /How machines chase/i });
    await expect(ch4Button).toBeVisible({ timeout: 8000 });

    // The unlock message should NOT appear for ch4
    const lockText = page.getByText(/Complete.*Pippy.*to unlock/, { exact: false });
    await expect(lockText).toHaveCount(0);

    console.log('✅ Chapter 4 unlocked state verified');
  });

  test('Pippy lesson page still loads (how-pippy-learned-step deleted)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000/lessons/how-machines-update-understanding');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/pippy-lesson-loads.png` });

    // Page should show some content
    const body = await page.textContent('body');
    expect(body).not.toBeNull();
    expect(body!.length).toBeGreaterThan(50);

    // Filter out known benign headless errors
    const realErrors = errors.filter(e =>
      !e.includes('SpeechSynthesis') &&
      !e.includes('favicon') &&
      !e.includes('punycode')
    );
    if (realErrors.length > 0) console.warn('Console errors:', realErrors);
    expect(realErrors).toHaveLength(0);

    console.log('✅ Pippy lesson page loads without real errors');
  });

  test('Coda lesson page still loads', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/coda-lesson-loads.png` });

    const body = await page.textContent('body');
    expect(body).not.toBeNull();
    expect(body!.length).toBeGreaterThan(50);

    // Filter out known benign headless errors (TTS not available in headless)
    const realErrors = errors.filter(e =>
      !e.includes('SpeechSynthesis') &&
      !e.includes('favicon') &&
      !e.includes('punycode')
    );
    if (realErrors.length > 0) console.warn('Console errors:', realErrors);
    expect(realErrors).toHaveLength(0);

    console.log('✅ Coda lesson page loads without real errors');
  });
});
