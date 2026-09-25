import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { User } from './entities/user.entity.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

const ada: User = {
  id: '3f0c6c4e-1d2b-4d7e-9a8f-0b1c2d3e4f50',
  email: 'ada@example.com',
  name: 'Ada',
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('UsersService', () => {
  const repository = {
    findMany: vi.fn(),
    count: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  };
  let service: UsersService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  describe('list', () => {
    it('returns the page and the total count', async () => {
      repository.findMany.mockResolvedValue([ada]);
      repository.count.mockResolvedValue(1);

      await expect(service.list({ skip: 0, take: 20 })).resolves.toEqual({
        users: [ada],
        total: 1,
      });
      expect(repository.findMany).toHaveBeenCalledWith({ skip: 0, take: 20 });
    });
  });

  describe('getById', () => {
    it('returns the user when it exists', async () => {
      repository.findById.mockResolvedValue(ada);
      await expect(service.getById(ada.id)).resolves.toEqual(ada);
    });

    it('throws NotFoundException when it does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.getById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('delegates to the repository', async () => {
      repository.create.mockResolvedValue(ada);
      const input = { email: ada.email, name: ada.name };

      await expect(service.create(input)).resolves.toEqual(ada);
      expect(repository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('update', () => {
    it('updates an existing user', async () => {
      repository.findById.mockResolvedValue(ada);
      repository.update.mockResolvedValue({ ...ada, name: 'Ada Lovelace' });

      await expect(
        service.update(ada.id, { name: 'Ada Lovelace' }),
      ).resolves.toMatchObject({ name: 'Ada Lovelace' });
      expect(repository.update).toHaveBeenCalledWith(ada.id, {
        name: 'Ada Lovelace',
      });
    });

    it('does not touch the repository when the user is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes an existing user', async () => {
      repository.findById.mockResolvedValue(ada);
      repository.softDelete.mockResolvedValue(true);

      await expect(service.remove(ada.id)).resolves.toBeUndefined();
      expect(repository.softDelete).toHaveBeenCalledWith(ada.id);
    });

    it('throws NotFoundException when the user is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
