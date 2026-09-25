import type { SupplierDto, SupplierInputDto, SupplierPageDto, SupplierQueryDto } from '../dto/supplier.dto';
import type { Supplier, SupplierPage, SupplierSummary } from '../../types/supplier';

export function toSupplier(dto: SupplierDto): Supplier {
  return { id: dto.id, name: dto.name, deletedAt: dto.deleted_at ?? null, version: dto.version, createdAt: dto.created_at, updatedAt: dto.updated_at };
}

export function toSupplierSummary(dto: { id: string; name: string; deleted_at: string | null }): SupplierSummary {
  return { id: dto.id, name: dto.name, deletedAt: dto.deleted_at ?? null };
}

export function toSupplierPage(dto: SupplierPageDto): SupplierPage {
  return { data: dto.data.map(toSupplier), meta: { page: dto.meta.page, pageSize: dto.meta.page_size, total: dto.meta.total, totalPages: dto.meta.total_pages } };
}

export function toSupplierPayload(name: string): SupplierInputDto {
  return { name };
}

export function toSupplierQuery(search: string, page: number, pageSize: number): SupplierQueryDto {
  return { search: search || undefined, page, page_size: pageSize };
}
