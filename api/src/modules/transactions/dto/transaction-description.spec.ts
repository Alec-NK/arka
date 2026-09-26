import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto.js';
import { UpdateTransactionDto } from './update-transaction.dto.js';
import {
  toCreateTransactionInput,
  toUpdateTransactionInput,
} from '../mappers/transaction.mapper.js';

const requiredFields = {
  transaction_type_id: '28aec79a-050f-4bb5-80c2-c1f542487981',
  amount: '12.30',
  currency: 'BRL',
  transaction_date: '2026-09-26',
};

describe('optional transaction descriptions', () => {
  it.each([undefined, null, '', '   '])(
    'accepts and normalizes an empty description (%s) on creation',
    async (description) => {
      const dto = plainToInstance(CreateTransactionDto, {
        ...requiredFields,
        ...(description === undefined ? {} : { description }),
      });
      expect(await validate(dto)).toEqual([]);
      expect(toCreateTransactionInput(dto).description).toBe('');
    },
  );

  it('trims a supplied description', async () => {
    const dto = plainToInstance(CreateTransactionDto, {
      ...requiredFields,
      description: '  Stock purchase  ',
    });
    expect(await validate(dto)).toEqual([]);
    expect(toCreateTransactionInput(dto).description).toBe('Stock purchase');
  });

  it.each([42, {}, 'x'.repeat(256)])(
    'rejects invalid description values',
    async (description) => {
      const dto = plainToInstance(CreateTransactionDto, {
        ...requiredFields,
        description,
      });
      expect((await validate(dto)).map(error => error.property)).toContain('description');
    },
  );

  it('preserves an existing description when a partial update omits it', async () => {
    const dto = plainToInstance(UpdateTransactionDto, { version: 1 });
    expect(await validate(dto)).toEqual([]);
    expect(toUpdateTransactionInput(dto)).not.toHaveProperty('description');
  });

  it.each([null, '', '   '])('allows clearing a description (%s)', async (description) => {
    const dto = plainToInstance(UpdateTransactionDto, { version: 1, description });
    expect(await validate(dto)).toEqual([]);
    expect(toUpdateTransactionInput(dto).description).toBe('');
  });
});
