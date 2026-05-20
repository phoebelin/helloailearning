/**
 * Helper utilities for testing the Zhorai activity
 */

import { Page, expect } from '@playwright/test';

export class ActivityFlowHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the activity page
   */
  async navigateToActivity() {
    await this.page.goto('/lessons/how-machines-learn');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Complete the introduction step
   */
  async completeIntroduction() {
    await expect(this.page.getByRole('heading', { name: /How machine learns/i })).toBeVisible();
    await this.page.getByRole('button', { name: /Continue/i }).click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Select an ecosystem
   */
  async selectEcosystem(ecosystem: 'Desert' | 'Ocean' | 'Rainforest' | 'Grassland' | 'Tundra') {
    await this.page.getByRole('button', { name: new RegExp(ecosystem, 'i') }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Complete knowledge visualization step
   */
  async completeKnowledgeVisualization() {
    await this.page.waitForTimeout(2000); // Wait for TTS
    const nextButton = this.page.getByRole('button', { name: /Next/i });
    await nextButton.waitFor({ state: 'visible', timeout: 10000 });
    await nextButton.click();
  }

  /**
   * Complete understanding check
   */
  async completeUnderstandingCheck(numAnswers: number = 2) {
    const checkboxes = this.page.locator('[role="checkbox"]');
    const count = await checkboxes.count();

    for (let i = 0; i < Math.min(numAnswers, count); i++) {
      await checkboxes.nth(i).click();
      await this.page.waitForTimeout(200);
    }

    await this.page.getByRole('button', { name: /Submit/i }).click();
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Select an animal
   */
  async selectAnimal(animal: 'Bees' | 'Dolphins' | 'Monkeys' | 'Zebras') {
    await this.page.getByRole('button', { name: new RegExp(animal, 'i') }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Add sentences about the animal
   */
  async addSentences(sentences: string[]) {
    for (const sentence of sentences) {
      const textarea = this.page.getByPlaceholder(/Tell Zhorai about/i);
      await textarea.fill(sentence);
      await this.page.getByRole('button', { name: /Add sentence/i }).click();
      await this.page.waitForTimeout(500);
    }

    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: /Continue/i }).click();
  }

  /**
   * Complete sentence list review
   */
  async completeSentenceList() {
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Complete mindmap display
   */
  async completeMindmap() {
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Trigger prediction and monitor for infinite loops
   */
  async makePrediction(): Promise<{ hasInfiniteLoop: boolean; duration: number }> {
    const startTime = Date.now();
    const consoleLogs: string[] = [];

    // Monitor console for repeated errors
    this.page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Click ask button
    const askButton = this.page.getByRole('button', { name: /Press and speak/i });
    await askButton.click();
    await this.page.waitForTimeout(1000);

    // Wait for prediction chart with timeout
    try {
      await this.page.waitForSelector('[data-testid="prediction-chart"]', {
        timeout: 10000,
        state: 'visible'
      });

      const duration = Date.now() - startTime;

      // Check for repeated console logs (sign of infinite loop)
      const logCounts = consoleLogs.reduce((acc, log) => {
        acc[log] = (acc[log] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const hasRepeatedLogs = Object.values(logCounts).some(count => count > 10);

      return {
        hasInfiniteLoop: hasRepeatedLogs,
        duration
      };
    } catch (error) {
      return {
        hasInfiniteLoop: true,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check if UI is responsive
   */
  async checkUIResponsiveness(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const start = Date.now();
        requestAnimationFrame(() => {
          const responseTime = Date.now() - start;
          resolve(responseTime < 100);
        });
        setTimeout(() => resolve(false), 1000);
      });
    });
  }

  /**
   * Monitor memory usage
   */
  async getMemoryUsage(): Promise<number> {
    const metrics = await this.page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    return metrics;
  }

  /**
   * Complete reflection step
   */
  async completeReflection() {
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: /Next/i }).click();
  }

  /**
   * Verify completion
   */
  async verifyCompletion() {
    await expect(this.page.getByText(/Great job/i)).toBeVisible();
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics: any[] = [];

  constructor(private page: Page) {
    this.startMonitoring();
  }

  private startMonitoring() {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.metrics.push({
          type: 'error',
          text: msg.text(),
          timestamp: Date.now()
        });
      }
    });
  }

  getErrors(): any[] {
    return this.metrics.filter(m => m.type === 'error');
  }

  hasRepeatedErrors(): boolean {
    const errorCounts: Record<string, number> = {};

    this.metrics.forEach(m => {
      if (m.type === 'error') {
        errorCounts[m.text] = (errorCounts[m.text] || 0) + 1;
      }
    });

    return Object.values(errorCounts).some(count => count > 5);
  }

  clear() {
    this.metrics = [];
  }
}

/**
 * Bug detection utilities
 */
export class BugDetector {
  /**
   * Detect infinite loop by monitoring repeated function calls
   */
  static async detectInfiniteLoop(page: Page, maxDuration: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    const callCounts: Record<string, number> = {};

    // Inject monitoring script
    await page.evaluate(() => {
      (window as any).callMonitor = {};

      // Override console methods to detect repeated calls
      const originalLog = console.log;
      console.log = function(...args) {
        const key = args.join(' ');
        (window as any).callMonitor[key] = ((window as any).callMonitor[key] || 0) + 1;
        originalLog.apply(console, args);
      };
    });

    // Wait and check
    await page.waitForTimeout(maxDuration);

    const monitor = await page.evaluate(() => (window as any).callMonitor);

    // Check if any call was made more than 20 times
    return Object.values(monitor).some((count: any) => count > 20);
  }

  /**
   * Detect memory leak by monitoring heap size
   */
  static async detectMemoryLeak(page: Page, duration: number = 5000): Promise<boolean> {
    const initialMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    await page.waitForTimeout(duration);

    const finalMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory increased by more than 50MB
    return (finalMemory - initialMemory) > 50 * 1024 * 1024;
  }
}
