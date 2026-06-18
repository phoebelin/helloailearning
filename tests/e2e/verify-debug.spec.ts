import { test } from '@playwright/test';
import path from 'path';
const DIR = path.join(process.cwd(), 'verification/2026-06-16');

test('debug - click works on fresh dev server', async ({ page }) => {
  const consoleMsgs: string[] = [];
  page.on('console', msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleMsgs.push(`[pageerror] ${err.message}`));

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/lessons/how-machines-chase-goals');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // extra wait for React hydration

  // Check React fiber on button
  const btnInfo = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent?.includes('See the mission')
    );
    if (!btn) return 'no button';
    const keys = Object.keys(btn);
    const fiberKey = keys.find(k => k.startsWith('__reactFiber'));
    const propsKey = keys.find(k => k.startsWith('__reactProps'));
    return {
      hasReactFiber: !!fiberKey,
      fiberKey,
      hasReactProps: !!propsKey,
      bb: btn.getBoundingClientRect(),
      text: btn.textContent,
    };
  });
  console.log('Button React info:', JSON.stringify(btnInfo, null, 2));

  // Click button
  await page.getByRole('button', { name: /See the mission/i }).click();
  await page.waitForTimeout(2000);

  const afterClick = await page.evaluate(() => ({
    localStorage: localStorage.getItem('coda-max-step'),
    sectionCount: document.querySelectorAll('[style*="scroll-snap-align"]').length,
    h1s: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()),
  }));
  console.log('After click:', JSON.stringify(afterClick, null, 2));

  await page.screenshot({ path: `${DIR}/debug-fresh-click.png`, fullPage: false });

  // Print non-404 console messages
  const relevant = consoleMsgs.filter(m => !m.includes('404'));
  if (relevant.length) console.log('Console messages:', relevant.join('\n'));
});
