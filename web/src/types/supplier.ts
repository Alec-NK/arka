export interface Supplier {
  id: string;
  name: string;
  deletedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierSummary {
  id: string;
  name: string;
  deletedAt: string | null;
}

export interface SupplierPage {
  data: Supplier[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}
