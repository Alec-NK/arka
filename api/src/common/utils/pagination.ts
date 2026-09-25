import type { PaginationMetaDto } from '../dto/pagination-meta.dto.js';
import type { PaginationQueryDto } from '../dto/pagination-query.dto.js';

export interface OffsetPagination {
  skip: number;
  take: number;
}

export function toOffsetPagination(
  query: PaginationQueryDto,
): OffsetPagination {
  return {
    skip: (query.page - 1) * query.page_size,
    take: query.page_size,
  };
}

export function buildPaginationMeta(
  total: number,
  query: PaginationQueryDto,
): PaginationMetaDto {
  return {
    page: query.page,
    page_size: query.page_size,
    total,
    total_pages: Math.ceil(total / query.page_size),
  };
}
