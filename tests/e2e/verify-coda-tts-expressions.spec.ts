/**
 * Verification spec for: Coda character expression states + meet-coda TTS + copy pass
 * Branch: roadmap/coda-character-tts-copy
 *
 * Navigation pattern: setViewportSize(1280×900) + click-through CTAs (same as
 * verify-play-step.spec.ts). Scroll-snap IntersectionObserver fires reliably at this
 * viewport in headless Chromium — localStorage pre-seeding is NOT used because
 * Next.js SSR discards the localStorage value during hydration.
 */
import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:3000';
const SS_DIR = path.join(__dirname, '../../verification/2026-06-21');
fs.mkdirSync(SS_DIR, { recursive: true });

test.describe('Coda character expressions + TTS copy verification', () => {
  test('meet-coda step: correct copy, CTA, and mute button present', async () => {
    const browser = await chromium.launch({ executablePath: EXEC, headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.goto(`${BASE}/lessons/how-machines-chase-goals`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SS_DIR}/01-meet-coda-step.png`, fullPage: false });

    // Coda image present
    await expect(page.locator('img[alt="Coda"]').first()).toBeVisible();

    // Blindness copy — exact phrase from the component
    await expect(page.locator('text=only whatever earns the most points').first()).toBeVisible();

    // Pippy callback
    await expect(page.locator('text=You just helped Pippy').first()).toBeVisible();

    // CTA says "Give Coda a goal" (not the old "See the mission")
    await expect(page.getByRole('button', { name: 'Give Coda a goal' })).toBeVisible();
    expect(await page.getByRole('button', { name: 'See the mission' }).count()).toBe(0);

    // Mute button: renders only when isMounted && isSupported — informational only
    const muteCount = await page.getByText('Mute Coda').count();
    console.log(`Mute button count (0 = TTS unsupported, 1 = TTS supported in this env): ${muteCount}`);

    await browser.close();
  });

  test('mission section text present after clicking Give Coda a goal', async () => {
    const browser = await chromium.launch({ executablePath: EXEC, headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.goto(`${BASE}/lessons/how-machines-chase-goals`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Click CTA to advance to section 1 (MissionStep)
    await page.getByRole('button', { name: /Give Coda a goal/i }).click();
    await page.waitForTimeout(900);

    await page.screenshot({ path: `${SS_DIR}/02-mission-step-rendered.png`, fullPage: false });

    // MissionCard renders missionText = "Reach the exit."
    await expect(page.getByText('Reach the exit').first()).toBeVisible();

    // Mission card "Your mission" header
    await expect(page.getByText('Your mission').first()).toBeVisible();

    // Grid present in section 1
    const grids = page.locator('[style*="grid-template-columns"]');
    expect(await grids.count()).toBeGreaterThan(0);

    // "Coda can't read this" disclaimer
    await expect(page.locator('text=Coda can').first()).toBeVisible();

    await browser.close();
  });

  test('play step: grid, Coda idle, run → receipt + expression badge', async () => {
    const browser = await chromium.launch({ executablePath: EXEC, headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(`${BASE}/lessons/how-machines-chase-goals`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    // Navigate to section 1 (MissionStep)
    await page.getByRole('button', { name: /Give Coda a goal/i }).click();
    await page.waitForTimeout(900);

    // Navigate to section 2 (PlayStep)
    await page.getByRole('button', { name: /Set Coda/i }).click();
    await page.waitForTimeout(900);

    await page.screenshot({ path: `${SS_DIR}/03-play-step-initial.png`, fullPage: false });

    // GridWorld present
    const grids = page.locator('[style*="grid-template-columns"]');
    const gridCount = await grids.count();
    console.log(`Grids in DOM: ${gridCount}`);
    expect(gridCount).toBeGreaterThan(0);

    // Coda img visible in play step
    await expect(page.locator('img[alt="Coda"]').first()).toBeVisible();

    // "Run Coda →" button visible
    const runButton = page.getByRole('button', { name: /Run Coda/i }).first();
    await expect(runButton).toBeVisible();

    // Click Run Coda
    await runButton.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${SS_DIR}/04-play-animating.png`, fullPage: false });

    // Receipt panel appears quickly once the run result is computed
    await expect(page.locator('text=Point Receipt').first()).toBeVisible({ timeout: 8000 });

    // Wait for the expression badge to appear — badge only shows when animation completes
    // (isAnimating → false → expression changes from 'moving' to 'confused'/'happy'/'frozen')
    // Use waitForFunction to avoid brittle fixed timeouts.
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('span')).some(s => {
        const t = s.textContent || '';
        return t.includes('❓') || t.includes('⭐') || t.includes('❄️');
      });
    }, { timeout: 10000 });

    await page.screenshot({ path: `${SS_DIR}/05-play-after-animation.png`, fullPage: false });

    // Re-tune or success button
    const actionBtn = page.locator('button', { hasText: /Re-tune|Coda made it/ }).first();
    await expect(actionBtn).toBeVisible();

    // Coda image still present after run
    await expect(page.locator('img[alt="Coda"]').first()).toBeVisible();

    // Expression badge (❓ confused/wandered, ⭐ happy, ❄️ frozen)
    const badgeSpans = page.locator('span').filter({ hasText: /❓|⭐|❄️/ });
    const badgeCount = await badgeSpans.count();
    console.log(`Expression badge(s) found: ${badgeCount}`);
    expect(badgeCount).toBeGreaterThan(0);

    // No fatal page errors (not TTS-related)
    const fatal = errors.filter(e =>
      !e.includes('Speech') &&
      !e.includes('speechSynthesis') &&
      !e.includes('TTS')
    );
    console.log('Fatal errors (non-TTS):', fatal);
    expect(fatal).toHaveLength(0);

    await browser.close();
  });

  test('no fatal console errors on page load', async () => {
    const browser = await chromium.launch({ executablePath: EXEC, headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    const errors: string[] = [];

    page.on('pageerror', e => errors.push(e.message));

    await page.goto(`${BASE}/lessons/how-machines-chase-goals`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const fatalErrors = errors.filter(e =>
      !e.includes('Speech') &&
      !e.includes('speechSynthesis') &&
      !e.includes('TTS') &&
      !e.includes('Failed to load resource') &&
      !e.includes('ERR_NAME_NOT_RESOLVED')
    );

    console.log('All errors:', errors);
    console.log('Fatal:', fatalErrors);
    expect(fatalErrors).toHaveLength(0);

    await browser.close();
  });
});
