import { test, expect } from '@playwright/test';

test.describe('Waitlist Forms Verification', () => {
  test('Screenshot homepage waitlist form', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    
    // Screenshot initial state
    await page.screenshot({ path: 'verification/2026-11-19/homepage-initial.png', fullPage: true });
    
    // Click join waitlist button (the one in Hero section)
    await page.click('text=Join the waitlist');
    await page.waitForTimeout(1000);
    
    // Screenshot email step
    await page.screenshot({ path: 'verification/2026-11-19/homepage-email-step.png', fullPage: true });
    
    // Enter email and continue
    await page.fill('input[type="email"]', 'parent@example.com');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Screenshot name step (with "For parents and guardians" and privacy link)
    await page.screenshot({ path: 'verification/2026-11-19/homepage-name-step.png', fullPage: true });
  });

  test('Screenshot login page waitlist form', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    // Screenshot initial state
    await page.screenshot({ path: 'verification/2026-11-19/login-initial.png', fullPage: true });
    
    // Click join waitlist button
    await page.click('text=Join the waitlist');
    await page.waitForTimeout(1000);
    
    // Screenshot email step
    await page.screenshot({ path: 'verification/2026-11-19/login-email-step.png', fullPage: true });
    
    // Enter email and continue
    await page.fill('input[type="email"]', 'parent@example.com');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Screenshot name step
    await page.screenshot({ path: 'verification/2026-11-19/login-name-step.png', fullPage: true });
  });

  test('Screenshot bottom section waitlist form', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(2000);
    
    // Scroll to bottom section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Screenshot initial state
    await page.screenshot({ path: 'verification/2026-11-19/bottom-section-initial.png', fullPage: true });
    
    // Click join waitlist button in bottom section
    const buttons = await page.locator('text=Join the waitlist').all();
    // Click the last one (bottom section)
    await buttons[buttons.length - 1].click();
    await page.waitForTimeout(1000);
    
    // Screenshot email step
    await page.screenshot({ path: 'verification/2026-11-19/bottom-section-email-step.png', fullPage: true });
    
    // Enter email and continue
    await page.fill('input[type="email"]', 'parent@example.com');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Screenshot name step
    await page.screenshot({ path: 'verification/2026-11-19/bottom-section-name-step.png', fullPage: true });
  });

  test('Screenshot privacy page', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/2026-11-19/privacy-page.png', fullPage: true });
  });

  test('Spot-check courses page', async ({ page }) => {
    await page.goto('http://localhost:3000/courses');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/2026-11-19/courses-page.png', fullPage: true });
  });

  test('Spot-check lesson page', async ({ page }) => {
    await page.goto('http://localhost:3000/lessons/how-machines-learn');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/2026-11-19/lesson-page.png', fullPage: true });
  });
});
