import { describe, expect, it } from 'vitest';
import { monthDates } from '../../../utils/format-date';
import { toTransactionQuery } from '../../../infra/mappers/transaction.mapper';
import { readFilters, writeFilters } from './transaction-search-params';

describe('transaction month filter', () => {
 it('covers every day of the selected month, including leap years', () => {
  expect(monthDates('2024-02')).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  expect(monthDates('2025-02')).toEqual({ from: '2025-02-01', to: '2025-02-28' });
  expect(monthDates('2025-12')).toEqual({ from: '2025-12-01', to: '2025-12-31' });
  expect(monthDates('2025-13')).toBeNull();
 });

 it('reads a month from the URL and keeps the all-dates choice', () => {
  expect(readFilters(new URLSearchParams('month=2024-02'))).toMatchObject({ dateFrom: '2024-02-01', dateTo: '2024-02-29' });
  expect(readFilters(new URLSearchParams('month='))).toMatchObject({ dateFrom: '', dateTo: '' });
 });

 it('converts older date-range links to a whole month', () => {
  expect(readFilters(new URLSearchParams('from=2024-02-13&to=2024-02-18'))).toMatchObject({ dateFrom: '2024-02-01', dateTo: '2024-02-29' });
 });

 it('writes only the selected month while preserving other filters', () => {
  const filters = readFilters(new URLSearchParams('month=2024-02&type=sale&supplier=supplier-1&search=rent'));
  const params = writeFilters(new URLSearchParams('from=2024-02-13&to=2024-02-18&selected=123'), filters);
  expect(params.get('month')).toBe('2024-02');
  expect(params.has('from')).toBe(false);
  expect(params.has('to')).toBe(false);
  expect(params.get('type')).toBe('sale');
  expect(params.get('supplier')).toBe('supplier-1');
  expect(params.get('search')).toBe('rent');
  expect(params.has('selected')).toBe(false);
  expect(toTransactionQuery(readFilters(params))).toMatchObject({ supplier_id: 'supplier-1', date_from: '2024-02-01', date_to: '2024-02-29' });
 });

 it('removes the supplier query when filters are cleared', () => {
  const filters = { ...readFilters(new URLSearchParams('month=2024-02&supplier=supplier-1')), supplierId: '' };
  const params = writeFilters(new URLSearchParams('month=2024-02&supplier=supplier-1'), filters);
  expect(params.has('supplier')).toBe(false);
  expect(toTransactionQuery(filters).supplier_id).toBeUndefined();
 });
});

describe('transaction pagination', () => {
 it('requests ten items on the first page by default', () => {
  expect(toTransactionQuery(readFilters(new URLSearchParams()))).toMatchObject({ page: 1, page_size: 10 });
 });

 it.each([10, 20, 50, 100])('keeps a page size of %i in navigation links and API requests', pageSize => {
  const params = new URLSearchParams(`month=2024-02&search=rent&page=2&page_size=${pageSize}`);
  const next = writeFilters(params, { ...readFilters(params), page: 3 });
  expect(toTransactionQuery(readFilters(next))).toMatchObject({ page: 3, page_size: pageSize, search: 'rent', date_from: '2024-02-01' });
 });

 it.each(['', '0', '-10', '11', '101', '1.5', 'NaN', 'Infinity'])('falls back to ten for an unsupported page size: %s', value => {
  expect(readFilters(new URLSearchParams({ page_size: value })).pageSize).toBe(10);
 });

 it('retains filters when changing the page size and returning to the first page', () => {
  const params = new URLSearchParams('month=2024-02&type=purchase&supplier=supplier-1&search=rent&page=4&page_size=20&selected=123');
  const next = writeFilters(params, { ...readFilters(params), pageSize: 50, page: 1 });
  expect(readFilters(next)).toMatchObject({ page: 1, pageSize: 50, transactionTypeId: 'purchase', supplierId: 'supplier-1', search: 'rent', dateFrom: '2024-02-01' });
  expect(next.has('selected')).toBe(false);
 });
});
