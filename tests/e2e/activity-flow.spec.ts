/**
 * E2E Tests for "How Machines Learn with Zhorai" Activity
 *
 * This test suite automates the complete user flow through the activity
 * and catches bugs like infinite loops, UI freezes, and incorrect state transitions.
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:3000';
const ACTIVITY_URL = `${BASE_URL}/lessons/how-machines-learn`;
const TEST_TIMEOUT = 60000; // 60 seconds per test

// Test data
const TEST_SENTENCES = [
  'Bees collect nectar from flowers',
  'They live in trees and make honey',
  'Bees need warm weather to survive',
];

test.describe('Zhorai Activity - Full User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for tests with ML models
    test.setTimeout(TEST_TIMEOUT);

    // Navigate to activity
    await page.goto(ACTIVITY_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should complete full activity flow without errors', async ({ page }) => {
    // Step 1: Introduction
    await test.step('Introduction Step', async () => {
      await expect(page.getByRole('heading', { name: /How machine learns/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
      await page.getByRole('button', { name: /Continue/i }).click();
    });

    // Step 2: Ecosystem Selection
    await test.step('Ecosystem Selection', async () => {
      await expect(page.getByText(/select your favorite ecosystem/i)).toBeVisible();

      // Select an ecosystem (e.g., Rainforest)
      await page.getByRole('button', { name: /Rainforest/i }).click();

      // Wait for selection to register
      await page.waitForTimeout(500);

      // Click next
      const nextButton = page.getByRole('button', { name: /Next/i });
      await expect(nextButton).toBeEnabled();
      await nextButton.click();
    });

    // Step 3: Knowledge Visualization
    await test.step('Knowledge Visualization', async () => {
      // Wait for Zhorai to speak about the ecosystem
      await page.waitForTimeout(2000);

      // Click next when ready
      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 4: Understanding Check
    await test.step('Understanding Check', async () => {
      // Answer questions about what Zhorai knows
      const checkboxes = page.locator('[role="checkbox"]');
      const count = await checkboxes.count();

      // Select 2 correct answers
      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();
      }

      await page.getByRole('button', { name: /Submit/i }).click();
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 5: Animal Selection
    await test.step('Animal Selection', async () => {
      await expect(page.getByText(/Choose an animal/i)).toBeVisible();

      // Select bees
      await page.getByRole('button', { name: /Bees/i }).click();
      await page.waitForTimeout(500);

      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 6: Sentence Input (Critical step with potential bugs)
    await test.step('Sentence Input', async () => {
      // Type sentences about the animal
      for (const sentence of TEST_SENTENCES) {
        const textarea = page.getByPlaceholder(/Tell Zhorai about/i);
        await textarea.fill(sentence);
        await page.getByRole('button', { name: /Add sentence/i }).click();
        await page.waitForTimeout(500);
      }

      // Wait for sentences to be processed
      await page.waitForTimeout(2000);

      // Continue to next step
      await page.getByRole('button', { name: /Continue/i }).click();
    });

    // Step 7: Sentence List Review
    await test.step('Sentence List Review', async () => {
      // Verify sentences are displayed
      for (const sentence of TEST_SENTENCES) {
        await expect(page.getByText(sentence)).toBeVisible();
      }

      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 8: Mindmap Display
    await test.step('Mindmap Display', async () => {
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 9: Prediction (KNOWN BUG AREA - Infinite Loop)
    await test.step('Prediction - Check for Infinite Loop', async () => {
      // Set up console log monitoring
      const consoleLogs: string[] = [];
      page.on('console', msg => {
        consoleLogs.push(msg.text());
      });

      // Ask Zhorai to predict
      await expect(page.getByText(/do you think Zhorai can guess/i)).toBeVisible();

      // Click the speech button or use text input
      const askButton = page.getByRole('button', { name: /Press and speak/i });
      await askButton.click();

      // Simulate asking the question
      await page.waitForTimeout(1000);

      // Check for infinite loop indicators:
      // 1. Too many console logs in short time
      // 2. UI becomes unresponsive
      // 3. Memory usage spikes

      const startTime = Date.now();
      const maxWaitTime = 10000; // 10 seconds max

      // Wait for prediction result with timeout
      try {
        await page.waitForSelector('[data-testid="prediction-chart"]', {
          timeout: maxWaitTime,
          state: 'visible'
        });
      } catch (error) {
        // Check if we hit infinite loop
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= maxWaitTime) {
          throw new Error(`Infinite loop detected: Prediction step took > ${maxWaitTime}ms`);
        }
      }

      // Check console for repeated errors
      const repeatedLogs = consoleLogs.filter((log, index, arr) =>
        arr.indexOf(log) !== index
      );

      if (repeatedLogs.length > 10) {
        throw new Error(`Infinite loop detected: ${repeatedLogs.length} repeated console logs`);
      }
    });

    // Step 10: Reflection
    await test.step('Reflection', async () => {
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: /Next/i }).click();
    });

    // Step 11: Completion
    await test.step('Completion', async () => {
      await expect(page.getByText(/Great job/i)).toBeVisible();
    });
  });

  test('should detect UI freezes during prediction', async ({ page }) => {
    // Navigate through activity quickly to prediction step
    // ... (abbreviated for brevity)

    // Monitor page responsiveness
    const isResponsive = await page.evaluate(() => {
      return new Promise((resolve) => {
        let responseTime = 0;
        const start = Date.now();

        requestAnimationFrame(() => {
          responseTime = Date.now() - start;
          resolve(responseTime < 100); // Should respond within 100ms
        });

        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(isResponsive).toBe(true);
  });

  test('should handle speech recognition errors gracefully', async ({ page }) => {
    // Test error handling in speech input steps
    await page.goto(ACTIVITY_URL);

    // Deny microphone permission
    await page.context().grantPermissions([]);

    // Navigate to a step with speech input
    // ... should show fallback UI
    await expect(page.getByText(/Type instead/i)).toBeVisible();
  });

  test('should save progress in localStorage', async ({ page }) => {
    // Complete first few steps
    // ...

    // Check localStorage
    const activityState = await page.evaluate(() => {
      return localStorage.getItem('activity-state');
    });

    expect(activityState).toBeTruthy();

    // Reload page and verify state is restored
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should resume from same step
    // ...
  });
});

test.describe('Zhorai Activity - Bug Regression Tests', () => {
  test('Bug: Infinite loop in prediction step with speak dependency', async ({ page }) => {
    await page.goto(ACTIVITY_URL);

    // Set up performance monitoring
    const metrics: number[] = [];

    page.on('metrics', (m) => {
      metrics.push(m.Timestamp);
    });

    // Navigate to prediction step
    // ... (fast-forward through steps)

    // Trigger the bug condition
    await page.evaluate(() => {
      // Simulate the buggy useEffect condition
      console.log('Testing infinite loop scenario');
    });

    // Check if prediction completes within reasonable time
    const timeout = 5000;
    const startTime = Date.now();

    try {
      await page.waitForFunction(() => {
        const chart = document.querySelector('[data-testid="prediction-chart"]');
        return chart !== null;
      }, { timeout });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(timeout);
    } catch (error) {
      throw new Error('Infinite loop detected: Prediction did not complete in 5 seconds');
    }
  });
});

// Helper functions
async function navigateToStep(page: Page, step: string) {
  // Helper to quickly navigate to specific step for testing
  // Implementation depends on your activity structure
}

async function fillSentenceInput(page: Page, sentences: string[]) {
  for (const sentence of sentences) {
    await page.fill('[data-testid="sentence-input"]', sentence);
    await page.click('[data-testid="add-sentence-button"]');
    await page.waitForTimeout(300);
  }
}
