import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository.js';
import { TransactionTypesService } from '../transaction-types/transaction-types.service.js';
import { SuppliersService } from '../suppliers/suppliers.service.js';
import type {
  CreateTransactionInput,
  TransactionFilter,
  UpdateTransactionInput,
} from './entities/transaction.entity.js';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly repository: TransactionsRepository,
    private readonly types: TransactionTypesService,
    private readonly suppliers: SuppliersService,
  ) {}

  async list(userId: string, filter: TransactionFilter) {
    if (filter.dateFrom && filter.dateTo && filter.dateFrom > filter.dateTo)
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    if (filter.transactionTypeId)
      await this.types.requireFilterable(filter.transactionTypeId);
    return this.repository.list(userId, filter);
  }

  async getById(userId: string, id: string) {
    const transaction = await this.repository.findById(userId, id);
    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  private validateAmount(amount: string) {
    if (
      !/^(?:0|[1-9]\d{0,16})\.\d{2}$/.test(amount) ||
      BigInt(amount.replace('.', '')) <= 0n
    )
      throw new BadRequestException(
        'Amount must be greater than zero, with exactly two decimal places',
      );
  }

  async create(userId: string, input: CreateTransactionInput) {
    this.validateAmount(input.amount);
    await this.types.requireSupported(input.transactionTypeId);
    if (input.supplierId)
      await this.suppliers.requireOwned(userId, input.supplierId);
    const transaction = await this.repository.create(userId, input);
    if (!transaction) throw new NotFoundException('User not found');
    return transaction;
  }

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    const current = await this.getById(userId, id);
    if (input.version !== current.version)
      throw new ConflictException(
        'This transaction changed. Refresh it before saving.',
      );
    this.validateAmount(input.amount ?? current.amount);
    const transactionTypeId =
      input.transactionTypeId ?? current.transactionTypeId;
    if (
      !current.transactionType?.deletedAt ||
      (input.transactionTypeId !== undefined &&
        input.transactionTypeId !== current.transactionTypeId)
    )
      await this.types.requireSupported(transactionTypeId);
    if (input.supplierId && input.supplierId !== current.supplierId)
      await this.suppliers.requireOwned(userId, input.supplierId);
    const updated = await this.repository.update(userId, id, input);
    if (!updated)
      throw new ConflictException(
        'This transaction changed. Refresh it before saving.',
      );
    return updated;
  }

  async remove(userId: string, id: string, version: number) {
    await this.getById(userId, id);
    if (!(await this.repository.softDelete(userId, id, version)))
      throw new ConflictException(
        'This transaction changed. Refresh it before deleting.',
      );
  }
}
