import { Injectable, NotFoundException } from '@nestjs/common';
import type { OffsetPagination } from '../../common/utils/pagination.js';
import type {
  CreateUserInput,
  UpdateUserInput,
  User,
} from './entities/user.entity.js';
import { UsersRepository } from './users.repository.js';

export interface UserPage {
  users: User[];
  total: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async list(pagination: OffsetPagination): Promise<UserPage> {
    const [users, total] = await Promise.all([
      this.users.findMany(pagination),
      this.users.count(),
    ]);
    return { users, total };
  }

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  create(input: CreateUserInput): Promise<User> {
    return this.users.create(input);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.users.findByEmail(email.trim());
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await this.getById(id);
    const updated = await this.users.update(id, input);
    if (!updated) throw new NotFoundException(`User ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.getById(id);
    if (!(await this.users.softDelete(id))) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}
