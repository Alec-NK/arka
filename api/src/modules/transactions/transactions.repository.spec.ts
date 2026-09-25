import { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../infra/prisma/prisma.service.js';
import { TransactionsRepository } from './transactions.repository.js';

describe('TransactionsRepository summary', () => {
  const aggregate = vi.fn();
  const findMany = vi.fn();
  const count = vi.fn();
  const db = { transaction: { aggregate, findMany, count } };
  const prisma = {
    $transaction: vi.fn(async (work: (client: typeof db) => unknown) =>
      work(db),
    ),
  };
  const repository = new TransactionsRepository(
    prisma as unknown as PrismaService,
  );
  const filter = {
    transactionTypeId: 'selected-type',
    supplierId: 'selected-supplier',
    search: 'invoice',
    sortOrder: 'desc' as const,
    pagination: { skip: 20, take: 20 },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(3);
  });

  it('subtracts inventory purchases and operating expenses from sales within the same filter', async () => {
    aggregate
      .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal('100.03') } })
      .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal('35.02') } })
      .mockResolvedValueOnce({ _sum: { amount: new Prisma.Decimal('10.01') } });

    const page = await repository.list('owner', filter);

    expect(page.summary).toEqual({
      currency: 'BRL',
      sales: '100.03',
      purchases: '35.02',
      expenses: '10.01',
      net: '55.00',
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20,
        where: expect.objectContaining({ supplierId: 'selected-supplier' }),
      }),
    );
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ supplierId: 'selected-supplier' }),
      }),
    );
    expect(
      aggregate.mock.calls.map(
        ([input]) => input.where.AND[1].transactionType.code,
      ),
    ).toEqual(['sale', 'purchase', 'expense']);
    for (const [input] of aggregate.mock.calls) {
      expect(input.where.AND[0]).toMatchObject({
        userId: 'owner',
        deletedAt: null,
        transactionTypeId: 'selected-type',
        supplierId: 'selected-supplier',
        OR: [
          { description: { contains: 'invoice' } },
          { reference: { contains: 'invoice' } },
        ],
      });
    }
  });

  it('returns zero totals when the filters have no matching transactions', async () => {
    aggregate.mockResolvedValue({ _sum: { amount: null } });

    const page = await repository.list('owner', filter);

    expect(page.summary).toEqual({
      currency: 'BRL',
      sales: '0.00',
      purchases: '0.00',
      expenses: '0.00',
      net: '0.00',
    });
  });
});
