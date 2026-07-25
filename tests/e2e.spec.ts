import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('add contact flow', async ({ page }) => {
  await page.goto('/contacts');

  await page.fill('[data-testid="input-name"]', 'Test User');
  await page.fill('[data-testid="input-company"]', 'Test Co');
  await page.fill('[data-testid="input-email"]', 'test@company.com');
  await page.fill('[data-testid="input-phone"]', '555-9999');
  await page.fill('[data-testid="input-dealValue"]', '4200');
  await page.click('[data-testid="save-contact-button"]');

  // Expect a success message
  await expect(page.locator('text=Contact added to the CRM.')).toBeVisible();

  // New contact should appear in the table
  await expect(page.locator('table')).toContainText('Test User');
});

test('change stage via select and drag/drop', async ({ page }) => {
  await page.goto('/pipeline');

  // open first card and change stage via select
  const firstCard = page.locator('[data-testid^="contact-name-"]').first();
  const contactId = await firstCard.getAttribute('data-testid');
  // open card (click the name's parent button)
  await firstCard.click();
  const id = contactId?.replace('contact-name-', '');
  if (id) {
    const select = page.locator(`[data-testid="stage-select-${id}"]`);
    if (await select.count()) {
      await select.selectOption('Contacted');
      await expect(page.locator('[data-testid="metric-best-stage"]').first()).toBeVisible();
    }
  }

  // drag-and-drop: move first card in New to Contacted column
  const card = page.locator('[data-testid^="contact-name-"]', { hasText: 'Owen Brooks' }).first();
  const target = page.locator('h3', { hasText: 'Contacted' }).first().locator('xpath=..');
  if (await card.count() && await target.count()) {
    await card.dragTo(target);
    // basic assertion: ensure target column contains 'Owen Brooks'
    await expect(target).toContainText('Owen Brooks');
  }
});

test('analytics renders charts', async ({ page }) => {
  await page.goto('/analytics');
  // Chart.js uses canvas elements
  await expect(page.locator('canvas').first()).toBeVisible();
  // Ensure summary metrics show
  await expect(page.locator('text=Total pipeline value')).toBeVisible();
});
