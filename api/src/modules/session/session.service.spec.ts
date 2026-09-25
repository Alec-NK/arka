import { Test } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { appConfig } from '../../config/app.config.js';
import { UsersService } from '../users/users.service.js';
import { SessionService } from './session.service.js';

describe('SessionService', () => {
  it.each([{ nodeEnv: 'production' }, { nodeEnv: 'development' }])(
    'fails closed without a permitted identity',
    async (config) => {
      const users = { getById: vi.fn() };
      const module = await Test.createTestingModule({
        providers: [
          SessionService,
          { provide: appConfig.KEY, useValue: config },
          { provide: UsersService, useValue: users },
        ],
      }).compile();
      await expect(module.get(SessionService).current()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(users.getById).not.toHaveBeenCalled();
    },
  );

  it('resolves a selected user and does not hide database errors', async () => {
    const id = '20000000-0000-4000-8000-000000000001';
    const users = {
      getById: vi.fn().mockResolvedValue({ id }),
      getByEmail: vi.fn().mockResolvedValue({ id }),
    };
    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: appConfig.KEY, useValue: { nodeEnv: 'test' } },
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    const session = module.get(SessionService);
    await expect(session.current(id)).resolves.toEqual({ id });
    await expect(session.create('alex@example.test')).resolves.toEqual({ id });
    expect(users.getByEmail).toHaveBeenCalledWith('alex@example.test');
    users.getById.mockRejectedValueOnce(new NotFoundException());
    await expect(session.current(id)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    const failure = new Error('Database unavailable');
    users.getById.mockRejectedValueOnce(failure);
    await expect(session.current(id)).rejects.toBe(failure);
    users.getByEmail.mockRejectedValueOnce(failure);
    await expect(session.create('alex@example.test')).rejects.toBe(failure);
  });

  it('disables both entry and identity headers in production', async () => {
    const users = { getById: vi.fn(), getByEmail: vi.fn() };
    const module = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: appConfig.KEY, useValue: { nodeEnv: 'production' } },
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    const session = module.get(SessionService);
    expect(() => session.create('alex@example.test')).toThrow(
      UnauthorizedException,
    );
    await expect(
      session.current('20000000-0000-4000-8000-000000000001'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.getById).not.toHaveBeenCalled();
    expect(users.getByEmail).not.toHaveBeenCalled();
  });
});
