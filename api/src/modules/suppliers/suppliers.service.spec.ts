import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SuppliersRepository } from './suppliers.repository.js';
import { SuppliersService } from './suppliers.service.js';

describe('SuppliersService', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  };
  let service: SuppliersService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: SuppliersRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(SuppliersService);
  });

  it('hides missing and non-owned suppliers', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.getById('owner', 'other')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a supplier with its current version', async () => {
    const current = {
      id: 'supplier',
      userId: 'owner',
      name: 'Acme',
      version: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repository.findById.mockResolvedValue(current);
    repository.update.mockResolvedValue({
      ...current,
      name: 'ACME',
      version: 2,
    });
    await expect(
      service.update('owner', 'supplier', { name: 'ACME', version: 1 }),
    ).resolves.toMatchObject({ name: 'ACME', version: 2 });
  });

  it('rejects stale supplier edits before writing', async () => {
    repository.findById.mockResolvedValue({ version: 2 });
    await expect(
      service.update('owner', 'supplier', { name: 'ACME', version: 1 }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
