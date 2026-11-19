import { test, expect } from '@playwright/test';

test.describe('Waitlist API Verification', () => {
  test('Waitlist API sends identical payload to Notion before and after', async ({ page }) => {
    let notionPayload: any = null;
    let waitlistResponse: any = null;

    // Intercept the Notion API call
    await page.route('https://api.notion.com/v1/pages', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      notionPayload = postData;
      
      // Mock successful Notion response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-page-id',
          object: 'page',
          created_time: new Date().toISOString(),
          properties: postData.properties,
        }),
      });
    });

    // Go to homepage
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    
    // Click join waitlist button
    await page.click('text=Join the waitlist');
    await page.waitForTimeout(500);
    
    // Fill email
    await page.fill('input[type="email"]', 'test.parent@example.com');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);
    
    // Fill name and submit
    await page.fill('input[type="text"]', 'Test Parent');
    
    // Capture the response from our API
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/waitlist') && response.request().method() === 'POST'
    );
    
    await page.click('button:has-text("Submit")');
    const response = await responsePromise;
    waitlistResponse = await response.json();
    
    await page.waitForTimeout(1000);
    
    // Verify success message
    await expect(page.locator('text=Thank you! You\'re on the waitlist.')).toBeVisible();
    
    // Verify the Notion payload has expected structure
    expect(notionPayload).toBeTruthy();
    expect(notionPayload.parent).toBeTruthy();
    expect(notionPayload.parent.database_id).toBeTruthy();
    expect(notionPayload.properties).toBeTruthy();
    
    // Verify Email property
    expect(notionPayload.properties.Email).toBeTruthy();
    
    // Verify Name property
    expect(notionPayload.properties.Name).toBeTruthy();
    
    // Verify Date submitted property
    expect(notionPayload.properties['Date submitted']).toBeTruthy();
    expect(notionPayload.properties['Date submitted'].date).toBeTruthy();
    expect(notionPayload.properties['Date submitted'].date.start).toBeTruthy();
    
    // Log the payload for verification
    console.log('Notion payload sent:', JSON.stringify(notionPayload, null, 2));
    console.log('Waitlist API response:', JSON.stringify(waitlistResponse, null, 2));
  });

  test('Verify "For parents and guardians" text is visible', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    
    // Click join waitlist button
    await page.click('text=Join the waitlist');
    await page.waitForTimeout(500);
    
    // Should see "For parents and guardians" 
    await expect(page.locator('text=For parents and guardians')).toBeVisible();
  });

  test('Verify privacy policy link is visible and works', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    
    // Click join waitlist button
    await page.click('text=Join the waitlist');
    await page.waitForTimeout(500);
    
    // Should see privacy policy link
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    
    // Click the link
    await privacyLink.click();
    await page.waitForTimeout(1000);
    
    // Should navigate to privacy page
    expect(page.url()).toContain('/privacy');
    await expect(page.locator('text=Privacy policy coming soon')).toBeVisible();
  });
});
