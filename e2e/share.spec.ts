import { test, expect } from '@playwright/test';

test.describe('Share link', () => {
  test('share panel is visible after clicking Share', async ({ page }) => {
    await page.goto('/search');
    await page.getByText('Share').click();
    await expect(page.getByTestId('share-panel')).toBeVisible();
  });

  test('shareable URL contains search path', async ({ page }) => {
    await page.goto('/search?city=Abuja');
    await page.getByText('Share').click();
    const shareInput = page.getByLabel('Shareable link');
    await expect(shareInput).toHaveValue(/\/search\?/);
  });
});
