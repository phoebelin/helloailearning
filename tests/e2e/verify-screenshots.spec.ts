import { test } from '@playwright/test';
import path from 'path';

const DIR = path.join(process.cwd(), 'verification/2026-06-16');

test('screenshot courses page', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/courses');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${DIR}/diag-courses.png`, fullPage: true });
});

test('screenshot coda lesson - meet step', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${DIR}/diag-coda-meet.png`, fullPage: false });
});

test('screenshot coda lesson - after click see mission', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /See the mission/i }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${DIR}/diag-coda-after-mission-click.png`, fullPage: true });
  // Also get all text content to debug
  const body = await page.locator('body').innerText();
  console.log('PAGE TEXT (first 500 chars):', body.substring(0, 500));
});
