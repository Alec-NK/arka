import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto.js';

export class SupplierSummaryDto {
  id: string;
  name: string;
  deleted_at: string | null;
}

export class SupplierResponseDto extends SupplierSummaryDto {
  version: number;
  created_at: string;
  updated_at: string;
}

export class SupplierPageResponseDto {
  data: SupplierResponseDto[];
  meta: PaginationMetaDto;
}
