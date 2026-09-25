import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type {
  CreateSupplierInput,
  SupplierFilter,
  UpdateSupplierInput,
} from './entities/supplier.entity.js';
import { toSupplierEntity } from './mappers/supplier.mapper.js';

@Injectable()
export class SuppliersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, filter: SupplierFilter) {
    const search = filter.search?.replace(/[\\%_]/g, '\\$&');
    const where: Prisma.SupplierWhereInput = {
      userId,
      deletedAt: null,
      user: { deletedAt: null },
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: filter.pagination.skip,
        take: filter.pagination.take,
      }),
      this.prisma.supplier.count({ where }),
    ]);
    return { suppliers: rows.map(toSupplierEntity), total };
  }

  async findById(userId: string, id: string) {
    const row = await this.prisma.supplier.findFirst({
      where: { id, userId, deletedAt: null, user: { deletedAt: null } },
    });
    return row ? toSupplierEntity(row) : null;
  }

  async create(userId: string, input: CreateSupplierInput) {
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return null;
      const row = await db.supplier.create({
        data: { userId, name: input.name },
      });
      return toSupplierEntity(row);
    });
  }

  async update(userId: string, id: string, input: UpdateSupplierInput) {
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return null;
      const rows = await db.supplier.updateManyAndReturn({
        where: {
          id,
          userId,
          version: input.version,
          deletedAt: null,
          user: { deletedAt: null },
        },
        data: { name: input.name, version: { increment: 1 } },
      });
      return rows[0] ? toSupplierEntity(rows[0]) : null;
    });
  }

  async softDelete(userId: string, id: string, version: number) {
    return this.prisma.$transaction(async (db) => {
      const owners = await db.$queryRaw<{ id: string }[]>`
        SELECT id FROM users
        WHERE id = ${userId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      if (!owners.length) return false;
      const result = await db.supplier.updateMany({
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
