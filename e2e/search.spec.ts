import { test, expect } from '@playwright/test';

test.describe('Hospital Search', () => {
  test('search page loads and shows search bar', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('search', { name: /search hospitals/i })).toBeVisible();
  });

  test('typing a query updates the URL', async ({ page }) => {
    await page.goto('/search');
    await page.getByRole('searchbox').fill('Lagos');
    await page.getByText('Search').click();
    await expect(page).toHaveURL(/q=Lagos/);
  });

  test('shareable URL reproduces search', async ({ page }) => {
    await page.goto('/search?city=Lagos&specialty=maternity');
    // Filter chips should reflect URL params — extend once filter UI is wired to URL
    await expect(page.getByTestId('filter-panel')).toBeVisible();
  });
});
