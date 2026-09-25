import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { SessionService } from './session.service.js';
import { SessionController } from './session.controller.js';

@Module({
  imports: [UsersModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}
