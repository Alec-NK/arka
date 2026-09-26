import type { TransactionFilters } from '../../../types/transaction';
import { currentMonth, monthDates } from '../../../utils/format-date';
export const TRANSACTION_PAGE_SIZES = [10, 20, 50, 100] as const;
function validDate(value: string | null): string | null {
 if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
 const date = new Date(`${value}T00:00:00Z`);
 return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value ? value : null;
}
export function readFilters(params: URLSearchParams): TransactionFilters {
 const selectedMonth = params.get('month');
 const legacyDate = validDate(params.get('from')) || validDate(params.get('to'));
 const dates = selectedMonth === '' || (selectedMonth === null && params.get('from') === '' && params.get('to') === '')
  ? { from: '', to: '' }
  : monthDates(selectedMonth ?? legacyDate?.slice(0, 7) ?? '') ?? currentMonth();
 const page = Number(params.get('page') || '1');
 const requestedSize = Number(params.get('page_size'));
 const pageSize = TRANSACTION_PAGE_SIZES.find(size => size === requestedSize) ?? 10;
 return { dateFrom: dates.from, dateTo: dates.to, transactionTypeId: params.get('type') || '', supplierId: params.get('supplier') || '', search: (params.get('search') || '').slice(0,200), sortOrder: params.get('sort') === 'asc' ? 'asc' : 'desc', page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 1000000) : 1, pageSize };
}
export function writeFilters(params: URLSearchParams, filters: TransactionFilters): URLSearchParams {
 const next = new URLSearchParams(params); next.set('month',filters.dateFrom.slice(0,7)); next.delete('from'); next.delete('to'); next.set('page',String(filters.page)); next.set('sort',filters.sortOrder);
 if (filters.pageSize === 10) next.delete('page_size'); else next.set('page_size', String(filters.pageSize));
 if (filters.search) next.set('search',filters.search); else next.delete('search');
 if (filters.transactionTypeId) next.set('type',filters.transactionTypeId); else next.delete('type');
 if (filters.supplierId) next.set('supplier',filters.supplierId); else next.delete('supplier');
 next.delete('selected'); return next;
}
