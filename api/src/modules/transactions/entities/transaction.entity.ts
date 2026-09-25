import type { TransactionType } from '../../transaction-types/entities/transaction-type.entity.js';
import type { Supplier } from '../../suppliers/entities/supplier.entity.js';
import type { OffsetPagination } from '../../../common/utils/pagination.js';

export interface Transaction {
  id: string;
  userId: string;
  transactionTypeId: string;
  transactionType: TransactionType;
  supplierId: string | null;
  supplier: Supplier | null;
  amount: string;
  currency: string;
  transactionDate: string;
  description: string;
  reference: string | null;
  notes: string | null;
  version: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  transactionTypeId: string;
  amount: string;
  currency: string;
  transactionDate: string;
  description: string;
  reference?: string | null;
  notes?: string | null;
  supplierId?: string | null;
}
export type UpdateTransactionInput = Partial<CreateTransactionInput> & {
  version: number;
};
export interface TransactionFilter {
  dateFrom?: string;
  dateTo?: string;
  transactionTypeId?: string;
  supplierId?: string;
  search?: string;
  sortOrder: 'asc' | 'desc';
  pagination: OffsetPagination;
}
export interface TransactionPage {
  transactions: Transaction[];
  total: number;
  summary: {
    currency: string;
    sales: string;
    purchases: string;
    expenses: string;
    net: string;
  };
}
