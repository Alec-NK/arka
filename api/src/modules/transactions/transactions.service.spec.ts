import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionsService } from './transactions.service.js';
import { TransactionsRepository } from './transactions.repository.js';
import { TransactionTypesService } from '../transaction-types/transaction-types.service.js';
import { SuppliersService } from '../suppliers/suppliers.service.js';

describe('TransactionsService', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  };
  const types = { requireSupported: vi.fn() };
  const suppliers = { requireOwned: vi.fn() };
  let service: TransactionsService;
  const input = {
    transactionTypeId: 'type',
    amount: '12.30',
    currency: 'BRL',
    transactionDate: '2025-05-30',
    description: 'Payment',
  };
  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: TransactionsRepository, useValue: repository },
        { provide: TransactionTypesService, useValue: types },
        { provide: SuppliersService, useValue: suppliers },
      ],
    }).compile();
    service = module.get(TransactionsService);
  });
  it.each(['0.00', '-1.00', '1.001', '1', '100000000000000000.00'])(
    'rejects invalid amount %s',
    async (amount) => {
      await expect(
        service.create('owner', { ...input, amount }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    },
  );
  it('passes ownership and exact large amounts to persistence', async () => {
    repository.create.mockResolvedValue({
      ...input,
      amount: '99999999999999999.99',
    });
    await service.create('owner', { ...input, amount: '99999999999999999.99' });
    expect(repository.create).toHaveBeenCalledWith(
      'owner',
      expect.objectContaining({ amount: '99999999999999999.99' }),
    );
  });
  it('rejects reversed date ranges', async () => {
    await expect(
      service.list('owner', {
        dateFrom: '2025-06-01',
        dateTo: '2025-05-01',
        sortOrder: 'desc',
        pagination: { skip: 0, take: 20 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('hides missing and non-owned transactions', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById('owner', 'other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
  it('does not write a stale edit', async () => {
    repository.findById.mockResolvedValue({ ...input, version: 2 });
    await expect(
      service.update('owner', 'id', { version: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });
  it('checks the retained type and amount for a partial edit', async () => {
    repository.findById.mockResolvedValue({ ...input, version: 1 });
    repository.update.mockResolvedValue({ ...input, version: 2, notes: null });
    await service.update('owner', 'id', { version: 1, notes: null });
    expect(types.requireSupported).toHaveBeenCalledWith('type');
    expect(repository.update).toHaveBeenCalledWith('owner', 'id', {
      version: 1,
      notes: null,
    });
  });
  it('checks supplier ownership when linking a transaction', async () => {
    repository.create.mockResolvedValue({ ...input, version: 1 });
    await service.create('owner', { ...input, supplierId: 'supplier' });
    expect(suppliers.requireOwned).toHaveBeenCalledWith('owner', 'supplier');
  });
  it('detects a concurrent edit after validation', async () => {
    repository.findById.mockResolvedValue({ ...input, version: 1 });
    repository.update.mockResolvedValue(null);
    await expect(
      service.update('owner', 'id', { version: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('requires the current version for deletion', async () => {
    repository.findById.mockResolvedValue({ ...input, version: 2 });
    repository.softDelete.mockResolvedValue(false);
    await expect(service.remove('owner', 'id', 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
