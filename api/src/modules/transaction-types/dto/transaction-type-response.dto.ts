import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto.js';

export class TransactionTypeResponseDto {
  id: string;
  code: string;
  name: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export class TransactionTypePageResponseDto {
  data: TransactionTypeResponseDto[];
  meta: PaginationMetaDto;
}
