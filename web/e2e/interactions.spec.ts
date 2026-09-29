import { test, expect, supplier } from './fixtures';

test('login, validation and session navigation', async ({ page, api }) => {
  void api;
  await page.addInitScript(() => localStorage.removeItem('arka-session'));
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Entrar', exact: true })).toBeDisabled();
  await page.getByLabel('E-mail').fill('alex@example.test');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/transactions/);
  await expect(page.getByRole('heading', { name: 'Transações', exact: true })).toBeVisible();
});

test('supplier draft survives discard cancellation, conflict and retry', async ({ page, api }) => {
  await page.goto('/suppliers');
  await page.getByRole('button', { name: 'Editar fornecedor Distribuidora Alfa' }).click();
  const name = page.getByLabel('Nome do fornecedor');
  await expect(name).toBeFocused();
  await name.fill('Distribuidora Alfa — rascunho');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog', { name: 'Descartar alterações?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar editando' })).toBeFocused();
  await page.getByRole('button', { name: 'Continuar editando' }).click();
  await expect(name).toHaveValue('Distribuidora Alfa — rascunho');
  await expect(name).toBeFocused();
  api.failNext = { method: 'PATCH', path: '/suppliers/supplier-1', status: 409, message: 'This supplier changed. Refresh it before saving.' };
  api.suppliers[0].name = 'Alfa no servidor';
  api.suppliers[0].version = 2;
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();
  await page.getByRole('button', { name: 'Carregar versão recente' }).click();
  await expect(name).toHaveValue('Distribuidora Alfa — rascunho');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Fornecedor atualizado. As transações vinculadas usam o novo nome.')).toBeVisible();
  expect(api.requests.filter(item => item.method === 'PATCH').at(-1)?.body?.version).toBe(2);
});

test('busy supplier save blocks close, and failure keeps the draft', async ({ page, api }) => {
  await page.goto('/suppliers');
  const trigger = page.getByRole('button', { name: 'Adicionar fornecedor', exact: true });
  await trigger.click();
  await page.getByLabel('Nome do fornecedor').fill('Novo parceiro');
  api.delay = 600;
  api.failNext = { method: 'POST', path: '/suppliers', status: 400, message: 'Não foi possível salvar.' };
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar fornecedor' }).click();
  await expect(page.getByRole('button', { name: 'Salvando…' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Novo fornecedor' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar.');
  await expect(page.getByLabel('Nome do fornecedor')).toHaveValue('Novo parceiro');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Descartar alterações', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('transaction creation, nested calendar and supplier creation preserve payloads', async ({ page, api }) => {
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Adicionar transação', exact: true }).click();
  await expect(page.getByLabel('Valor (R$)')).toBeFocused();
  await page.getByLabel('Valor (R$)').fill('12550');
  await page.getByRole('combobox', { name: 'Tipo', exact: true }).click();
  await page.getByRole('option', { name: 'Compra', exact: true }).click();
  await page.getByRole('combobox', { name: 'Fornecedor (opcional)' }).click();
  const search = page.getByRole('combobox', { name: 'Buscar opções de fornecedores' });
  await search.fill('Parceiro novo');
  await page.getByRole('option', { name: 'Criar “Parceiro novo”' }).click();
  await expect(page.getByRole('combobox', { name: 'Fornecedor (opcional)' })).toContainText('Parceiro novo');
  await page.getByRole('button', { name: 'Abrir calendário' }).click();
  await expect(page.locator('[data-slot="calendar"]')).toBeVisible();
  await page.locator('[data-day="18/09/2026"]').click();
  await expect(page.getByLabel('Data', { exact: true })).toHaveValue('18/09/2026');
  await page.getByRole('button', { name: 'Abrir calendário' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Nova transação' })).toBeVisible();
  await expect(page.getByLabel('Data', { exact: true })).toBeFocused();
  await page.getByLabel('Data', { exact: true }).fill('29/02/2024');
  await page.getByRole('dialog', { name: 'Nova transação' }).getByRole('button', { name: 'Adicionar transação' }).click();
  await expect(page.getByRole('dialog', { name: 'Nova transação' })).toHaveCount(0);
  const request = api.requests.find(item => item.method === 'POST' && item.path === '/transactions');
  expect(request?.body).toMatchObject({ amount: '125.50', transaction_date: '2024-02-29', transaction_type_id: 'purchase', supplier_id: 'supplier-4' });
});

test('required type and invalid dates prevent transaction submission', async ({ page, api }) => {
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Adicionar transação', exact: true }).click();
  await page.getByLabel('Valor (R$)').fill('10000');
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar transação' }).click();
  await expect(page.getByRole('combobox', { name: 'Tipo', exact: true })).toBeFocused();
  await page.getByRole('combobox', { name: 'Tipo', exact: true }).click();
  await page.getByRole('option', { name: 'Venda', exact: true }).click();
  await page.getByLabel('Data', { exact: true }).fill('31/02/2026');
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar transação' }).click();
  expect(api.requests.some(item => item.method === 'POST' && item.path === '/transactions')).toBe(false);
  await expect(page.getByLabel('Data', { exact: true })).toBeFocused();
});

test('filter selection and month application preserve URL semantics', async ({ page, api }) => {
  void api;
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Filtros', exact: true }).click();
  await page.getByRole('combobox', { name: 'Tipo de transação' }).click();
  await page.getByRole('option', { name: 'Compra', exact: true }).click();
  await expect(page).toHaveURL(/type=purchase/);
  await page.getByRole('combobox', { name: 'Tipo de transação' }).click();
  await page.getByRole('option', { name: 'Todos os tipos' }).click();
  await expect(page).not.toHaveURL(/__arka_all__|type=/);
  await page.getByRole('button', { name: 'setembro de 2026', exact: true }).click();
  await page.getByRole('combobox', { name: 'Mês', exact: true }).click();
  await page.getByRole('option', { name: 'fevereiro', exact: true }).click();
  await page.getByLabel('Ano', { exact: true }).fill('2024');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page).toHaveURL(/month=2024-02/);
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).click();
  await expect(page).toHaveURL(/month=(&|$)/);
});

test('pagination and search keep server query values', async ({ page, api }) => {
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole('combobox', { name: 'Itens por página' }).click();
  await page.getByRole('option', { name: '50', exact: true }).click();
  await expect.poll(() => api.requests.filter(item => item.path === '/transactions').at(-1)?.search).toContain('page_size=50');
  await page.getByRole('textbox', { name: 'Pesquisar transações' }).fill('Reposição');
  await expect(page).toHaveURL(/search=Reposi/);
  await expect(page.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
});

test('supplier combobox supports keyboard paging, clear and archived selections', async ({ page, api }) => {
  api.suppliers = Array.from({ length: 23 }, (_, index) => supplier(`supplier-${index + 1}`, `Parceiro ${index + 1}`));
  api.suppliers[0].deleted_at = '2026-09-01T12:00:00Z';
  api.transactions[1].supplier = api.suppliers[0];
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Ações para Reposição de estoque' }).first().click();
  await page.getByRole('menuitem', { name: 'Editar transação' }).click();
  await expect(page.getByLabel('Valor (R$)')).toBeFocused();
  await expect(page.getByText('Fornecedor arquivado. O vínculo histórico foi preservado.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Fornecedor (opcional)' }).click();
  await page.getByRole('button', { name: 'Próximos fornecedores' }).click();
  await expect(page.getByRole('option', { name: 'Parceiro 21' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Buscar opções de fornecedores' }).focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Fornecedor (opcional)' })).toContainText('Parceiro 21');
  await page.getByRole('button', { name: 'Limpar fornecedor' }).click();
  await expect(page.getByRole('combobox', { name: 'Fornecedor (opcional)' })).toContainText('Pesquisar ou criar fornecedor');
  await expect(page.getByRole('combobox', { name: 'Fornecedor (opcional)' })).toBeFocused();
});

test('destructive confirmations remain open after failure and succeed on retry', async ({ page, api }) => {
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Ações para Venda de produtos' }).first().click();
  await page.getByRole('menuitem', { name: 'Excluir transação' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Excluir transação?' });
  api.failNext = { method: 'DELETE', path: '/transactions/transaction-0', status: 400, message: 'Falha temporária.' };
  await dialog.getByRole('button', { name: 'Excluir transação', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Falha temporária.');
  await dialog.getByRole('button', { name: 'Excluir transação', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Transação excluída. Seus totais estão atualizados.')).toBeVisible();
  await page.getByRole('button', { name: 'Dispensar notificação' }).click();
  await expect(page.getByText('Transação excluída. Seus totais estão atualizados.')).toHaveCount(0);
});

test('mobile navigation, sheets, and desktop details retain breakpoints', async ({ page, api }) => {
  void api;
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/transactions');
  await page.getByRole('button', { name: 'Abrir navegação' }).click();
  await page.getByRole('dialog', { name: 'Navegação' }).getByRole('link', { name: 'Fornecedores' }).click();
  await expect(page).toHaveURL(/suppliers/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/transactions?selected=transaction-1');
  await expect(page.getByRole('dialog', { name: 'Detalhes da transação' })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Detalhes da transação' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar detalhes da transação' }).click();
  await expect(page.locator('[data-transaction-trigger="transaction-1"]:visible')).toBeFocused();
});

test('empty, loading and error states remain usable', async ({ page, api }) => {
  api.transactions = [];
  api.delay = 300;
  await page.goto('/transactions?month=');
  await expect(page.getByRole('status', { name: 'Carregando transações' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sua movimentação começa aqui' })).toBeVisible();
  api.failNext = { method: 'GET', path: '/suppliers', status: 400, message: 'Falha de consulta.', persistent: true };
  await page.goto('/suppliers');
  await expect(page.getByRole('alert')).toContainText('Falha de consulta.');
  api.failNext = null;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('Distribuidora Alfa').first()).toBeVisible();
});

test('transaction conflicts preserve edited fields and adopt fresh server fields', async ({ page, api }) => {
  await page.goto('/transactions');
  const trigger = page.getByRole('button', { name: 'Ações para Reposição de estoque' }).first();
  await trigger.click();
  await page.getByRole('menuitem', { name: 'Editar transação' }).click();
  await expect(page.getByLabel('Valor (R$)')).toBeFocused();
  await page.getByLabel('Descrição (opcional)').fill('Meu rascunho');
  api.transactions[1].notes = 'Notas atualizadas no servidor';
  api.transactions[1].version = 2;
  api.failNext = { method: 'PATCH', path: '/transactions/transaction-1', status: 409, message: 'This transaction changed. Refresh it before saving.' };
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.getByRole('button', { name: 'Carregar versão recente' }).click();
  await expect(page.getByLabel('Descrição (opcional)')).toHaveValue('Meu rascunho');
  await expect(page.getByLabel('Observações')).toHaveValue('Notas atualizadas no servidor');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('dialog', { name: 'Editar transação' })).toHaveCount(0);
  expect(api.requests.filter(item => item.method === 'PATCH').at(-1)?.body).toMatchObject({ version: 2, description: 'Meu rascunho', notes: 'Notas atualizadas no servidor' });
  await trigger.click();
  await page.getByRole('menuitem', { name: 'Excluir transação' }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('supplier archive confirms, retries and updates the list', async ({ page, api }) => {
  await page.goto('/suppliers');
  await page.getByRole('button', { name: 'Arquivar fornecedor Mercado Central' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Arquivar fornecedor?' });
  api.failNext = { method: 'DELETE', path: '/suppliers/supplier-2', status: 409, message: 'This supplier changed. Refresh it before saving.' };
  api.suppliers[1].version = 2;
  await dialog.getByRole('button', { name: 'Arquivar fornecedor', exact: true }).click();
  await dialog.getByRole('button', { name: 'Revisar fornecedor atualizado' }).click();
  await dialog.getByRole('button', { name: 'Arquivar fornecedor', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ver transações de Mercado Central' })).toHaveCount(0);
  expect(api.requests.filter(item => item.method === 'DELETE').at(-1)?.search).toContain('version=2');
});
