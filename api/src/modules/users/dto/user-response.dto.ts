import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto.js';

export class UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export class PaginatedUserResponseDto {
  data: UserResponseDto[];
  meta: PaginationMetaDto;
}
