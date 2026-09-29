import { test as base, expect, type Page } from '@playwright/test';
import type { SupplierDto } from '../src/infra/dto/supplier.dto';
import type { TransactionDto, TransactionTypeDto } from '../src/infra/dto/transaction.dto';

const timestamp = '2026-09-15T12:00:00Z';
export const types: TransactionTypeDto[] = [
  { id: 'sale', code: 'sale', name: 'Venda', deleted_at: null },
  { id: 'purchase', code: 'purchase', name: 'Compra', deleted_at: null },
  { id: 'expense', code: 'expense', name: 'Despesa', deleted_at: null },
];
export const supplier = (id: string, name: string): SupplierDto => ({ id, name, deleted_at: null, version: 1, created_at: timestamp, updated_at: timestamp });
export const transaction = (index: number): TransactionDto => ({
  id: `transaction-${index}`, transaction_type_id: types[index % 3].id, transaction_type: types[index % 3],
  supplier_id: index % 3 === 1 ? 'supplier-1' : null,
  supplier: index % 3 === 1 ? { id: 'supplier-1', name: 'Distribuidora Alfa', deleted_at: null } : null,
  amount: ['2450.00', '890.50', '175.90'][index % 3], currency: 'BRL', transaction_date: '2026-09-15',
  description: ['Venda de produtos', 'Reposição de estoque', 'Material de escritório'][index % 3],
  reference: index === 1 ? 'NF-1024' : null, notes: index === 1 ? 'Entrega recebida e conferida.' : null,
  version: 1, deleted_at: null, created_at: timestamp, updated_at: timestamp,
});
export interface ApiFixture {
  transactions: TransactionDto[];
  suppliers: SupplierDto[];
  failNext: { method: string; path: string; status: number; message: string; persistent?: boolean } | null;
  delay: number;
  requests: { method: string; path: string; body: Record<string, unknown> | null; search: string }[];
}

export async function mockApi(page: Page): Promise<ApiFixture> {
  const state: ApiFixture = {
    transactions: Array.from({ length: 24 }, (_, index) => transaction(index)),
    suppliers: [supplier('supplier-1', 'Distribuidora Alfa'), supplier('supplier-2', 'Mercado Central'), supplier('supplier-3', 'Papelaria São Paulo')],
    failNext: null, delay: 0, requests: [],
  };
  await page.clock.setFixedTime(new Date(timestamp));
  await page.addInitScript(() => localStorage.setItem('arka-session', JSON.stringify({ state: { userId: 'user-1' }, version: 0 })));
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    const method = request.method();
    const body = request.postDataJSON() as Record<string, unknown> | null;
    state.requests.push({ method, path, body, search: url.search });
    if (state.delay) await new Promise(resolve => setTimeout(resolve, state.delay));
    if (state.failNext?.method === method && state.failNext.path === path) {
      const failure = state.failNext;
      if (!failure.persistent) state.failNext = null;
      await route.fulfill({ status: failure.status, json: { message: failure.message } });
      return;
    }
    if (path === '/session') return route.fulfill({ json: { id: 'user-1', name: 'Alex Silva', email: 'alex@example.test' } });
    if (path === '/transaction-types') return route.fulfill({ json: { data: types, meta: { page: 1, page_size: 100, total: 3, total_pages: 1 } } });
    const isSupplier = path.startsWith('/suppliers');
    const id = path.split('/')[2];
    if (method === 'GET' && id) return route.fulfill({ json: isSupplier ? state.suppliers.find(item => item.id === id) : state.transactions.find(item => item.id === id) });
    if (method === 'POST' || method === 'PATCH') {
      if (isSupplier) {
        let item = state.suppliers.find(item => item.id === id);
        if (!item) { item = supplier(`supplier-${state.suppliers.length + 1}`, String(body?.name)); state.suppliers.push(item); }
        else { item.name = String(body?.name); item.version++; }
        return route.fulfill({ json: item });
      }
      let item = state.transactions.find(item => item.id === id);
      if (!item) { item = transaction(state.transactions.length); state.transactions.unshift(item); }
      Object.assign(item, body, { version: item.version + 1 });
      item.transaction_type = types.find(type => type.id === item.transaction_type_id)!;
      item.supplier = state.suppliers.find(value => value.id === item.supplier_id) ?? null;
      return route.fulfill({ json: item });
    }
    if (method === 'DELETE') {
      if (isSupplier) state.suppliers = state.suppliers.filter(item => item.id !== id);
      else state.transactions = state.transactions.filter(item => item.id !== id);
      return route.fulfill({ status: 204 });
    }
    const search = (url.searchParams.get('search') || '').toLocaleLowerCase('pt-BR');
    let data: (TransactionDto | SupplierDto)[] = isSupplier
      ? state.suppliers.filter(item => item.name.toLocaleLowerCase('pt-BR').includes(search))
      : state.transactions.filter(item => `${item.description} ${item.reference || ''}`.toLocaleLowerCase('pt-BR').includes(search)
        && (!url.searchParams.get('transaction_type_id') || item.transaction_type_id === url.searchParams.get('transaction_type_id'))
        && (!url.searchParams.get('supplier_id') || item.supplier_id === url.searchParams.get('supplier_id')));
    const total = data.length;
    const pageSize = Number(url.searchParams.get('page_size') || 20);
    const current = Number(url.searchParams.get('page') || 1);
    data = data.slice((current - 1) * pageSize, current * pageSize);
    return route.fulfill({ json: { data, meta: { page: current, page_size: pageSize, total, total_pages: Math.ceil(total / pageSize) },
      ...(!isSupplier && { summary: { currency: 'BRL', sales: '19600.00', purchases: '7124.00', expenses: '1407.20', net: '11068.80' } }) } });
  });
  return state;
}

export const test = base.extend<{ api: ApiFixture }>({
  api: async ({ page }, provide) => { await provide(await mockApi(page)); },
});
export { expect };
