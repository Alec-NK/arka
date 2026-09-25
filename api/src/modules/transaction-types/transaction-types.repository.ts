import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type { OffsetPagination } from '../../common/utils/pagination.js';
import { toTransactionTypeEntity } from './mappers/transaction-type.mapper.js';

@Injectable()
export class TransactionTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(pagination: OffsetPagination, includeDeleted = false) {
    const where = includeDeleted ? undefined : { deletedAt: null };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transactionType.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { code: 'asc' },
      }),
      this.prisma.transactionType.count({ where }),
    ]);
    return { types: rows.map(toTransactionTypeEntity), total };
  }

  async findById(id: string) {
    const row = await this.prisma.transactionType.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? toTransactionTypeEntity(row) : null;
  }

  async findByIdIncludingDeleted(id: string) {
    const row = await this.prisma.transactionType.findUnique({
      where: { id },
    });
    return row ? toTransactionTypeEntity(row) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.prisma.transactionType.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count === 1;
  }
}
