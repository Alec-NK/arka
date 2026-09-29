import { test, expect } from './fixtures';

test('existing layout breakpoints and minimum viewport do not overflow', async ({ page, api }) => {
  void api;
  await page.goto('/transactions');
  await expect(page.getByRole('heading', { name: 'Transações', exact: true })).toBeVisible();
  for (const width of [320, 400, 639, 640, 1023, 1024, 1279, 1280, 1439, 1440, 1700]) {
    await page.setViewportSize({ width, height: 1000 });
    const menu = page.getByRole('button', { name: 'Abrir navegação' });
    if (width < 1024) await expect(menu).toBeVisible();
    else await expect(menu).toBeHidden();
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
      sidebar: document.querySelector('aside')!.getBoundingClientRect().width,
      section: document.querySelector('[aria-label="Transações"]')!.getBoundingClientRect().width,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport);
    if (width >= 1024) expect(metrics.sidebar).toBe(width >= 1280 ? 216 : 80);
    const table = page.locator('[data-slot="table"]');
    if (metrics.section > 740) await expect(table).toBeVisible();
    else await expect(table).toBeHidden();
  }
});

for (const width of [390, 1440]) {
  test(`review overlay states at ${width}px`, async ({ page, api }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Adicionar transação', exact: true }).click();
    await expect(page.getByLabel('Valor (R$)')).toBeFocused();
    await page.getByRole('combobox', { name: 'Tipo', exact: true }).click();
    await page.getByRole('option', { name: 'Compra', exact: true }).click();
    await page.screenshot({ path: testInfo.outputPath('transaction-form.png'), animations: 'disabled' });
    await page.getByRole('button', { name: 'Abrir calendário' }).click();
    await expect(page.locator('[data-slot="calendar"]')).toBeVisible();
    const calendar = await page.locator('[data-slot="calendar"]').boundingBox();
    expect(calendar!.x).toBeGreaterThanOrEqual(0);
    expect(calendar!.x + calendar!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath('calendar.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: 'Fornecedor (opcional)' }).click();
    await expect(page.getByRole('option', { name: 'Distribuidora Alfa' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('supplier-picker.png'), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Nova transação' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('alertdialog', { name: 'Descartar alterações?' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('discard.png'), animations: 'disabled' });
    await page.getByRole('button', { name: 'Descartar alterações', exact: true }).click();
    await page.goto('/suppliers');
    await page.getByRole('button', { name: 'Adicionar fornecedor', exact: true }).click();
    await page.getByLabel('Nome do fornecedor').fill('Novo parceiro');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar fornecedor' }).click();
    await expect(page.getByText('Fornecedor “Novo parceiro” adicionado.')).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('notification.png'), animations: 'disabled' });
    const notice = await page.getByRole('status').filter({ hasText: 'Fornecedor “Novo parceiro” adicionado.' }).boundingBox();
    expect(Math.abs(notice!.x + notice!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(notice!.y + notice!.height - 980)).toBeLessThanOrEqual(1);
    api.transactions = [];
    await page.goto('/transactions?month=');
    await expect(page.getByRole('heading', { name: 'Sua movimentação começa aqui' })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('empty.png'), animations: 'disabled' });
    expect(errors).toEqual([]);
  });
}
