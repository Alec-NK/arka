import type { SupplierSummary } from './supplier';

export interface TransactionType { id: string; code: string; name: string; deletedAt: string | null }
export interface Transaction {
  id: string; transactionTypeId: string; transactionType: TransactionType; supplierId: string | null; supplier: SupplierSummary | null; amount: string; currency: string;
  transactionDate: string; description: string; reference: string | null; notes: string | null; version: number;
  deletedAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface TransactionInput { transactionTypeId: string; supplierId: string | null; amount: string; currency: string; transactionDate: string; description: string; reference: string | null; notes: string | null }
export interface TransactionFilters { dateFrom: string; dateTo: string; transactionTypeId: string; supplierId: string; search: string; sortOrder: 'asc' | 'desc'; page: number; pageSize: number }
export interface TransactionPage { data: Transaction[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; summary: { sales: string; purchases: string; expenses: string; net: string; currency: string } }
