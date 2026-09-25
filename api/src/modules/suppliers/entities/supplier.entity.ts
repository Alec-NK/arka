import type { OffsetPagination } from '../../../common/utils/pagination.js';

export interface Supplier {
  id: string;
  userId: string;
  name: string;
  version: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierInput {
  name: string;
}

export interface UpdateSupplierInput {
  name: string;
  version: number;
}

export interface SupplierFilter {
  search?: string;
  pagination: OffsetPagination;
}

export interface SupplierPage {
  suppliers: Supplier[];
  total: number;
}
