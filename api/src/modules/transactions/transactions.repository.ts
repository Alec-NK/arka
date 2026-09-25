import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { toTransactionEntity } from './mappers/transaction.mapper.js';
import type {
  CreateTransactionInput,
  TransactionFilter,
  TransactionPage,
  UpdateTransactionInput,
} from './entities/transaction.entity.js';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
    filter: TransactionFilter,
  ): Promise<TransactionPage> {
    const search = filter.search?.replace(/[\\%_]/g, '\\$&');
    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      user: { deletedAt: null },
      transactionTypeId: filter.transactionTypeId,
      supplierId: filter.supplierId,
      transactionDate: {
        gte: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
        lte: filter.dateTo ? new Date(filter.dateTo) : undefined,
      },
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { reference: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return this.prisma.$transaction(
      async (db) => {
        const rows = await db.transaction.findMany({
          where,
          include: { transactionType: true, supplier: true },
          orderBy: [
            { transactionDate: filter.sortOrder },
            { id: filter.sortOrder },
          ],
          skip: filter.pagination.skip,
          take: filter.pagination.take,
        });
        const total = await db.transaction.count({ where });
        const sales = await db.transaction.aggregate({
          where: { AND: [where, { transactionType: { code: 'sale' } }] },
          _sum: { amount: true },
        });
        const purchases = await db.transaction.aggregate({
          where: { AND: [where, { transactionType: { code: 'purchase' } }] },
          _sum: { amount: true },
        });
        const expenses = await db.transaction.aggregate({
          where: { AND: [where, { transactionType: { code: 'expense' } }] },
          _sum: { amount: true },
        });
        const incoming = sales._sum.amount ?? new Prisma.Decimal(0);
        const inventory = purchases._sum.amount ?? new Prisma.Decimal(0);
        const operating = expenses._sum.amount ?? new Prisma.Decimal(0);
        return {
          transactions: rows.map(toTransactionEntity),
          total,
          summary: {
            currency: 'BRL',
            sales: incoming.toFixed(2),
            purchases: inventory.toFixed(2),
            expenses: operating.toFixed(2),
            net: incoming.minus(inventory).minus(operating).toFixed(2),
          },
        };
      },
      { isolationLevel: 'RepeatableRead' },
    );
  }

  async findById(userId: string, id: string) {
    const row = await this.prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null, user: { deletedAt: null } },
      include: { transactionType: true, supplier: true },
    });
    return row ? toTransactionEntity(row) : null;
  }

  async create(userId: string, input: CreateTransactionInput) {
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return null;
      const row = await db.transaction.create({
        data: {
          ...input,
          userId,
          transactionDate: new Date(input.transactionDate),
        },
        include: { transactionType: true, supplier: true },
      });
      return toTransactionEntity(row);
    });
  }

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    const { version, transactionDate, ...data } = input;
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return null;
      const rows = await db.transaction.updateManyAndReturn({
        where: {
          id,
          userId,
          deletedAt: null,
          version,
          user: { deletedAt: null },
        },
        data: {
          ...data,
          ...(transactionDate
            ? { transactionDate: new Date(transactionDate) }
            : {}),
          version: { increment: 1 },
        },
        include: { transactionType: true, supplier: true },
      });
      return rows[0] ? toTransactionEntity(rows[0]) : null;
    });
  }

  async softDelete(
    userId: string,
    id: string,
    version: number,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return false;
      const result = await db.transaction.updateMany({
        where: {
          id,
          userId,
          version,
          deletedAt: null,
          user: { deletedAt: null },
        },
        data: { deletedAt: new Date(), version: { increment: 1 } },
      });
      return result.count === 1;
    });
  }
}
