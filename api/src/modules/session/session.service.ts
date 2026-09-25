import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config/app.config.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class SessionService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly users: UsersService,
  ) {}

  create(email: string) {
    this.assertDevelopmentMode();
    return this.users.getByEmail(email);
  }

  async current(userId?: string) {
    this.assertDevelopmentMode();
    if (!userId || !isUUID(userId))
      throw new UnauthorizedException('Selecione um usuário para continuar.');
    try {
      return await this.users.getById(userId);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new UnauthorizedException(
          'Este usuário não está mais disponível. Entre novamente.',
        );
      throw error;
    }
  }

  private assertDevelopmentMode() {
    if (this.config.nodeEnv === 'production')
      throw new UnauthorizedException(
        'A seleção de usuário está disponível apenas no ambiente de desenvolvimento.',
      );
  }
}
