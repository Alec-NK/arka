import type { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { buildPaginationMeta } from '../../../common/utils/pagination.js';
import type { Supplier as SupplierRecord } from '../../../generated/prisma/client.js';
import type { CreateSupplierDto } from '../dto/create-supplier.dto.js';
import type { SupplierQueryDto } from '../dto/supplier-query.dto.js';
import type {
  SupplierPageResponseDto,
  SupplierResponseDto,
  SupplierSummaryDto,
} from '../dto/supplier-response.dto.js';
import type { UpdateSupplierDto } from '../dto/update-supplier.dto.js';
import type {
  CreateSupplierInput,
  Supplier,
  SupplierFilter,
  UpdateSupplierInput,
} from '../entities/supplier.entity.js';
import type { OffsetPagination } from '../../../common/utils/pagination.js';

export function toSupplierEntity(record: SupplierRecord): Supplier {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    version: record.version,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toSupplierSummary(
  supplier: Pick<Supplier, 'id' | 'name' | 'deletedAt'>,
): SupplierSummaryDto {
  return {
    id: supplier.id,
    name: supplier.name,
    deleted_at: supplier.deletedAt?.toISOString() ?? null,
  };
}

export function toSupplierResponse(supplier: Supplier): SupplierResponseDto {
  return {
    id: supplier.id,
    name: supplier.name,
    version: supplier.version,
    deleted_at: supplier.deletedAt?.toISOString() ?? null,
    created_at: supplier.createdAt.toISOString(),
    updated_at: supplier.updatedAt.toISOString(),
  };
}

export function toSupplierPageResponse(
  suppliers: Supplier[],
  total: number,
  query: PaginationQueryDto,
): SupplierPageResponseDto {
  return {
    data: suppliers.map(toSupplierResponse),
    meta: buildPaginationMeta(total, query),
  };
}

export function toCreateSupplierInput(
  dto: CreateSupplierDto,
): CreateSupplierInput {
  return { name: dto.name };
}

export function toUpdateSupplierInput(
  dto: UpdateSupplierDto,
): UpdateSupplierInput {
  return { name: dto.name, version: dto.version };
}

export function toSupplierFilter(
  dto: SupplierQueryDto,
  pagination: OffsetPagination,
): SupplierFilter {
  return { search: dto.search?.trim(), pagination };
}
