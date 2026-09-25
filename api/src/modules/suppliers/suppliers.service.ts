import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateSupplierInput,
  Supplier,
  SupplierFilter,
  UpdateSupplierInput,
} from './entities/supplier.entity.js';
import { SuppliersRepository } from './suppliers.repository.js';

@Injectable()
export class SuppliersService {
  constructor(private readonly repository: SuppliersRepository) {}

  list(userId: string, filter: SupplierFilter) {
    return this.repository.list(userId, filter);
  }

  async getById(userId: string, id: string): Promise<Supplier> {
    const supplier = await this.repository.findById(userId, id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(userId: string, input: CreateSupplierInput): Promise<Supplier> {
    const supplier = await this.repository.create(userId, input);
    if (!supplier) throw new NotFoundException('User not found');
    return supplier;
  }

  async update(
    userId: string,
    id: string,
    input: UpdateSupplierInput,
  ): Promise<Supplier> {
    const current = await this.getById(userId, id);
    if (input.version !== current.version)
      throw new ConflictException(
        'This supplier changed. Refresh it before saving.',
      );
    const updated = await this.repository.update(userId, id, input);
    if (!updated)
      throw new ConflictException(
        'This supplier changed. Refresh it before saving.',
      );
    return updated;
  }

  async remove(userId: string, id: string, version: number): Promise<void> {
    const current = await this.getById(userId, id);
    if (current.version !== version)
      throw new ConflictException(
        'This supplier changed. Refresh it before deleting.',
      );
    if (!(await this.repository.softDelete(userId, id, version)))
      throw new ConflictException(
        'This supplier changed. Refresh it before deleting.',
      );
  }

  requireOwned(userId: string, id: string): Promise<Supplier> {
    return this.getById(userId, id);
  }
}
