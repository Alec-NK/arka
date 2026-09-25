import type { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { buildPaginationMeta } from '../../../common/utils/pagination.js';
import type { User as UserRecord } from '../../../generated/prisma/client.js';
import type { CreateUserDto } from '../dto/create-user.dto.js';
import type { UpdateUserDto } from '../dto/update-user.dto.js';
import type {
  PaginatedUserResponseDto,
  UserResponseDto,
} from '../dto/user-response.dto.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from '../entities/user.entity.js';

export function toUserEntity(record: UserRecord): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    deleted_at: user.deletedAt?.toISOString() ?? null,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export function toPaginatedUserResponse(
  users: User[],
  total: number,
  query: PaginationQueryDto,
): PaginatedUserResponseDto {
  return {
    data: users.map(toUserResponse),
    meta: buildPaginationMeta(total, query),
  };
}

export function toCreateUserInput(dto: CreateUserDto): CreateUserInput {
  return { email: dto.email, name: dto.name ?? null };
}

export function toUpdateUserInput(dto: UpdateUserDto): UpdateUserInput {
  const input: UpdateUserInput = {};
  if (dto.email !== undefined) input.email = dto.email;
  if (dto.name !== undefined) input.name = dto.name;
  return input;
}
