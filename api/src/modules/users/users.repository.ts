import { Injectable } from '@nestjs/common';
import type { OffsetPagination } from '../../common/utils/pagination.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from './entities/user.entity.js';
import { toUserEntity } from './mappers/user.mapper.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(pagination: OffsetPagination): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      where: { deletedAt: null },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    });
    return records.map(toUserEntity);
  }

  count(): Promise<number> {
    return this.prisma.user.count({ where: { deletedAt: null } });
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? toUserEntity(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return record ? toUserEntity(record) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const record = await this.prisma.user.create({
      data: { email: input.email, name: input.name },
    });
    return toUserEntity(record);
  }

  async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const rows = await this.prisma.user.updateManyAndReturn({
      where: { id, deletedAt: null },
      data: { email: input.email, name: input.name },
    });
    return rows[0] ? toUserEntity(rows[0]) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    return this.prisma.$transaction(async (db) => {
      const deletedAt = new Date();
      const user = await db.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt },
      });
      if (user.count !== 1) return false;
      await db.supplier.updateMany({
        where: { userId: id, deletedAt: null },
        data: { deletedAt, version: { increment: 1 } },
      });
      await db.transaction.updateMany({
        where: { userId: id, deletedAt: null },
        data: { deletedAt, version: { increment: 1 } },
      });
      return true;
    });
  }
}
