/**
 * Quick Smoke Test for Zhorai Activity
 *
 * Run this test for fast feedback on critical bugs
 * Estimated duration: 30 seconds
 */

import { test, expect } from '@playwright/test';
import { ActivityFlowHelper, BugDetector } from './helpers/activity-helpers';

test.describe('Quick Smoke Test', () => {
  test('should load activity page without errors', async ({ page }) => {
    await page.goto('/lessons/how-machines-learn');
    await expect(page).toHaveTitle(/How machine learns/i);
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should not have infinite loop in prediction step', async ({ page }) => {
    test.setTimeout(60000); // 1 minute max

    const helper = new ActivityFlowHelper(page);

    // Fast-forward to prediction step
    await helper.navigateToActivity();
    await helper.completeIntroduction();
    await helper.selectEcosystem('Rainforest');
    await helper.completeKnowledgeVisualization();
    await helper.completeUnderstandingCheck();
    await helper.selectAnimal('Bees');

    // Add minimal sentences
    await helper.addSentences([
      'Bees live in trees',
      'They collect nectar',
    ]);

    await helper.completeSentenceList();
    await helper.completeMindmap();

    // Critical test: Check for infinite loop
    const { hasInfiniteLoop, duration } = await helper.makePrediction();

    expect(hasInfiniteLoop).toBe(false);
    expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
  });

  test('should remain responsive during prediction', async ({ page }) => {
    const helper = new ActivityFlowHelper(page);

    // Navigate to any step
    await helper.navigateToActivity();
    await page.waitForTimeout(1000);

    // Check UI responsiveness
    const isResponsive = await helper.checkUIResponsiveness();
    expect(isResponsive).toBe(true);
  });

  test('should handle missing dependencies gracefully', async ({ page }) => {
    // Test console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/lessons/how-machines-learn');
    await page.waitForLoadState('networkidle');

    // Check for critical errors
    const hasCriticalErrors = errors.some(err =>
      err.includes('Cannot read') ||
      err.includes('undefined is not') ||
      err.includes('null is not')
    );

    expect(hasCriticalErrors).toBe(false);
  });
});
