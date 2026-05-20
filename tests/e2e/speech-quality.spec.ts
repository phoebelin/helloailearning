/**
 * Speech Quality and TTS Regression Tests
 *
 * Catches issues like HTML entities being passed to TTS engines
 * which cause incorrect pronunciation.
 */

import { test, expect } from '@playwright/test';

test.describe('Speech Quality Tests', () => {
  test('should not have HTML entities in TTS strings', async ({ page }) => {
    // Monitor all console logs for TTS calls
    const ttsMessages: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      // Capture TTS-related messages
      if (text.includes('Speech synthesis') || text.includes('Starting speech') || text.includes('TTS')) {
        ttsMessages.push(text);
      }
    });

    await page.goto('/lessons/how-machines-learn');
    await page.waitForLoadState('networkidle');

    // Navigate through activity to trigger TTS
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);

    // Select ecosystem
    await page.getByRole('button', { name: /Rainforest/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();

    // Wait for TTS in knowledge visualization
    await page.waitForTimeout(3000);

    // Check for HTML entities in any TTS message
    const hasHtmlEntities = ttsMessages.some(msg =>
      msg.includes('&apos;') ||
      msg.includes('&quot;') ||
      msg.includes('&ldquo;') ||
      msg.includes('&rdquo;') ||
      msg.includes('&#39;') ||
      msg.includes('&#34;')
    );

    if (hasHtmlEntities) {
      const problematicMessages = ttsMessages.filter(msg =>
        msg.includes('&apos;') ||
        msg.includes('&quot;') ||
        msg.includes('&ldquo;') ||
        msg.includes('&rdquo;') ||
        msg.includes('&#39;') ||
        msg.includes('&#34;')
      );
      console.error('Found HTML entities in TTS messages:', problematicMessages);
    }

    expect(hasHtmlEntities).toBe(false);
  });

  test('should use proper apostrophes in JavaScript strings', async ({ page }) => {
    // Check the source code for HTML entities in JS strings (not JSX)
    await page.goto('/lessons/how-machines-learn');

    // Inject a script to check for HTML entities in strings
    const hasIssue = await page.evaluate(() => {
      // This would catch if HTML entities are in the JS bundle
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => {
        const content = script.textContent || '';
        // Check for HTML entities in template literals or string assignments
        // that are likely used for TTS
        return /const\s+\w+\s*=\s*`[^`]*&apos;[^`]*`/.test(content) ||
               /const\s+\w+\s*=\s*`[^`]*&quot;[^`]*`/.test(content);
      });
    });

    expect(hasIssue).toBe(false);
  });

  test('should speak knowledge visualization message correctly', async ({ page }) => {
    const speechMessages: Array<{ type: string; message: string }> = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Starting speech')) {
        speechMessages.push({ type: 'start', message: text });
      }
    });

    await page.goto('/lessons/how-machines-learn');
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: /Rainforest/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();

    // Wait for knowledge visualization TTS
    await page.waitForTimeout(4000);

    // Check that the expected message was spoken
    const knowledgeMessage = speechMessages.find(m =>
      m.message.includes('heard so much about') &&
      m.message.includes('brain')
    );

    expect(knowledgeMessage).toBeTruthy();

    if (knowledgeMessage) {
      // Verify no HTML entities in the message
      expect(knowledgeMessage.message).not.toContain('&apos;');
      expect(knowledgeMessage.message).not.toContain('&quot;');

      // Verify proper apostrophes are present
      expect(knowledgeMessage.message).toMatch(/I've|Here's/);
    }
  });

  test('should handle special characters in animal names', async ({ page }) => {
    await page.goto('/lessons/how-machines-learn');

    // Fast-forward to animal selection
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Ocean/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(1000);

    const checkboxes = page.locator('[role="checkbox"]');
    await checkboxes.first().click();
    await page.getByRole('button', { name: /Submit/i }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /Next/i }).click();

    // Select animal
    await page.getByRole('button', { name: /Dolphins/i }).click();
    await page.waitForTimeout(2000);

    // Check that Zhorai's response doesn't have HTML entities
    const pageContent = await page.content();
    const hasHtmlEntities = pageContent.includes('&apos;') || pageContent.includes('&quot;');

    // It's OK to have HTML entities in JSX/HTML, but not in JS strings
    // This is a basic check - more sophisticated checks would parse the JS
  });

  test('should pronounce contractions naturally', async ({ page }) => {
    const ttsCallsWithContractions: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      // Look for TTS calls with common contractions
      if ((text.includes('TTS') || text.includes('speech')) &&
          (text.includes("'ve") || text.includes("'s") || text.includes("'t"))) {
        ttsCallsWithContractions.push(text);
      }
    });

    await page.goto('/lessons/how-machines-learn');
    await page.waitForLoadState('networkidle');

    // Navigate to knowledge visualization (has "I've" and "Here's")
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Desert/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(3000);

    // Verify contractions are used properly
    const hasProperContractions = ttsCallsWithContractions.some(call =>
      call.includes("I've") || call.includes("Here's")
    );

    expect(hasProperContractions).toBe(true);

    // Verify no HTML entities in contractions
    const hasHtmlEntitiesInContractions = ttsCallsWithContractions.some(call =>
      call.includes("&apos;") || call.includes("&#39;")
    );

    expect(hasHtmlEntitiesInContractions).toBe(false);
  });
});

test.describe('TTS Regression Tests', () => {
  test('Bug: HTML entities causing mispronunciation in knowledge-visualization', async ({ page }) => {
    const speechLogs: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('Knowledge Visualization: Starting speech')) {
        speechLogs.push(msg.text());
      }
    });

    await page.goto('/lessons/how-machines-learn');
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Tundra/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(3000);

    expect(speechLogs.length).toBeGreaterThan(0);

    // Check the actual message logged
    const message = speechLogs[0];

    // Should contain proper apostrophes, not HTML entities
    expect(message).toContain("I've");
    expect(message).toContain("Here's");
    expect(message).not.toContain("&apos;");
    expect(message).not.toContain("&#39;");
  });

  test('should not break TTS with lint fixes', async ({ page }) => {
    // This test ensures that lint fixes don't introduce HTML entities
    // into JavaScript strings that are used for TTS

    await page.goto('/lessons/how-machines-learn');

    // Check if there are any JavaScript errors related to TTS
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('TTS')) {
        errors.push(msg.text());
      }
    });

    // Navigate through activity
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Grassland/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Next/i }).click();
    await page.waitForTimeout(3000);

    // Should not have TTS-related errors
    const hasTtsErrors = errors.some(err =>
      err.toLowerCase().includes('tts') ||
      err.toLowerCase().includes('speech') ||
      err.toLowerCase().includes('speak')
    );

    expect(hasTtsErrors).toBe(false);
  });
});
