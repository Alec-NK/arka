import { test, expect } from './fixtures';

for (const width of [390, 1100, 1440]) {
  test(`existing page appearance at ${width}px`, async ({ page, api }) => {
    void api;
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/transactions');
    await expect(page.locator('[data-transaction-trigger="transaction-0"]:visible')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`transactions-${width}.png`);
    await page.goto('/suppliers');
    await expect(page.getByText('Distribuidora Alfa').first()).toBeVisible();
    await expect(page).toHaveScreenshot(`suppliers-${width}.png`);
    await page.getByRole('button', { name: 'Adicionar fornecedor', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Compare unfocused geometry; keyboard focus is verified in the interaction suite.
    await page.getByLabel('Nome do fornecedor').blur();
    await expect(page).toHaveScreenshot(`supplier-form-${width}.png`);
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('arka-session'));
    // The fixture initializes authenticated tabs. Remove that initializer for this navigation.
    await page.addInitScript(() => localStorage.removeItem('arka-session'));
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Entrar no Arka' })).toBeVisible();
    await expect(page).toHaveScreenshot(`login-${width}.png`);
  });
}
