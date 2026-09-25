import type { TransactionType as Record } from '../../../generated/prisma/client.js';
import type { TransactionType } from '../entities/transaction-type.entity.js';
import type { TransactionTypeResponseDto } from '../dto/transaction-type-response.dto.js';

export function toTransactionTypeEntity(row: Record): TransactionType {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toTransactionTypeResponse(
  entity: TransactionType,
): TransactionTypeResponseDto {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    deleted_at: entity.deletedAt?.toISOString() ?? null,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
