import type { Prisma } from '../../../generated/prisma/client.js';
import type { OffsetPagination } from '../../../common/utils/pagination.js';
import type { CreateTransactionDto } from '../dto/create-transaction.dto.js';
import type { UpdateTransactionDto } from '../dto/update-transaction.dto.js';
import type { TransactionQueryDto } from '../dto/transaction-query.dto.js';
import type { TransactionResponseDto } from '../dto/transaction-response.dto.js';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
} from '../entities/transaction.entity.js';
import {
  toTransactionTypeEntity,
  toTransactionTypeResponse,
} from '../../transaction-types/mappers/transaction-type.mapper.js';
import {
  toSupplierEntity,
  toSupplierSummary,
} from '../../suppliers/mappers/supplier.mapper.js';

type Record = Prisma.TransactionGetPayload<{
  include: { transactionType: true; supplier: true };
}>;

export function toTransactionEntity(row: Record): Transaction {
  return {
    id: row.id,
    userId: row.userId,
    transactionTypeId: row.transactionTypeId,
    transactionType: toTransactionTypeEntity(row.transactionType),
    supplierId: row.supplierId,
    supplier: row.supplier ? toSupplierEntity(row.supplier) : null,
    amount: row.amount.toFixed(2),
    currency: row.currency,
    transactionDate: row.transactionDate.toISOString().slice(0, 10),
    description: row.description,
    reference: row.reference,
    notes: row.notes,
    version: row.version,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
export function toTransactionResponse(
  entity: Transaction,
): TransactionResponseDto {
  return {
    id: entity.id,
    transaction_type_id: entity.transactionTypeId,
    transaction_type: toTransactionTypeResponse(entity.transactionType),
    supplier_id: entity.supplierId,
    supplier: entity.supplier ? toSupplierSummary(entity.supplier) : null,
    amount: entity.amount,
    currency: entity.currency,
    transaction_date: entity.transactionDate,
    description: entity.description,
    reference: entity.reference,
    notes: entity.notes,
    version: entity.version,
    deleted_at: entity.deletedAt?.toISOString() ?? null,
    created_at: entity.createdAt.toISOString(),
    updated_at: entity.updatedAt.toISOString(),
  };
}
export function toCreateTransactionInput(
  dto: CreateTransactionDto,
): CreateTransactionInput {
  return {
    transactionTypeId: dto.transaction_type_id,
    amount: dto.amount,
    currency: dto.currency,
    transactionDate: dto.transaction_date,
    description: dto.description ?? '',
    reference: dto.reference,
    notes: dto.notes,
    supplierId: dto.supplier_id,
  };
}
export function toUpdateTransactionInput(
  dto: UpdateTransactionDto,
): UpdateTransactionInput {
  const input: UpdateTransactionInput = { version: dto.version };
  if (dto.transaction_type_id !== undefined)
    input.transactionTypeId = dto.transaction_type_id;
  if (dto.amount !== undefined) input.amount = dto.amount;
  if (dto.currency !== undefined) input.currency = dto.currency;
  if (dto.transaction_date !== undefined)
    input.transactionDate = dto.transaction_date;
  if (dto.description !== undefined) input.description = dto.description ?? '';
  if (dto.reference !== undefined) input.reference = dto.reference;
  if (dto.notes !== undefined) input.notes = dto.notes;
  if (dto.supplier_id !== undefined) input.supplierId = dto.supplier_id;
  return input;
}
export function toTransactionFilter(
  dto: TransactionQueryDto,
  pagination: OffsetPagination,
): TransactionFilter {
  return {
    dateFrom: dto.date_from,
    dateTo: dto.date_to,
    transactionTypeId: dto.transaction_type_id,
    supplierId: dto.supplier_id,
    search: dto.search?.trim(),
    sortOrder: dto.sort_order,
    pagination,
  };
}
