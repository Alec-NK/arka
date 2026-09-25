export interface SupplierDto {
  id: string;
  name: string;
  deleted_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierSummaryDto {
  id: string;
  name: string;
  deleted_at: string | null;
}

export interface SupplierInputDto {
  name: string;
}

export interface SupplierQueryDto {
  search?: string;
  page: number;
  page_size: number;
}

export interface SupplierPaginationDto {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface SupplierPageDto {
  data: SupplierDto[];
  meta: SupplierPaginationDto;
}
