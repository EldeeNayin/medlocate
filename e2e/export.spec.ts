import { test, expect } from '@playwright/test';

test.describe('CSV Export', () => {
  test('export panel renders on search page', async ({ page }) => {
    await page.goto('/search');
    await page.getByText('Export CSV').click();
    await expect(page.getByTestId('csv-export-panel')).toBeVisible();
  });

  test('all column checkboxes are present', async ({ page }) => {
    await page.goto('/search');
    await page.getByText('Export CSV').click();
    for (const col of ['Name', 'Address', 'Phone', 'Email', 'Specialties', 'Rating']) {
      await expect(page.getByLabel(col)).toBeVisible();
    }
  });
});
