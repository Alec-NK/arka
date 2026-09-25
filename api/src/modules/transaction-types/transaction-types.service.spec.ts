import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TransactionTypesService } from './transaction-types.service.js';
import { TransactionTypesRepository } from './transaction-types.repository.js';

describe('TransactionTypesService', () => {
  const repository = {
    list: vi.fn(),
    findById: vi.fn(),
    findByIdIncludingDeleted: vi.fn(),
    softDelete: vi.fn(),
  };
  let service: TransactionTypesService;
  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TransactionTypesService,
        { provide: TransactionTypesRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(TransactionTypesService);
  });
  it.each([null, { code: 'unknown' }])(
    'rejects a missing or unsupported type',
    async (value) => {
      repository.findById.mockResolvedValue(value);
      await expect(service.requireSupported('id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
  it.each(['sale', 'purchase', 'expense'])(
    'accepts the stable %s code regardless of label',
    async (code) => {
      repository.findById.mockResolvedValue({
        id: 'id',
        code,
        name: 'Renamed',
      });
      await expect(service.requireSupported('id')).resolves.toMatchObject({
        code,
      });
    },
  );
  it.each(['income', 'transfer'])(
    'rejects the retired %s code',
    async (code) => {
      repository.findById.mockResolvedValue({ id: 'id', code, name: code });
      await expect(service.requireSupported('id')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});
