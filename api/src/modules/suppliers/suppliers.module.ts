import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module.js';
import { SuppliersController } from './suppliers.controller.js';
import { SuppliersRepository } from './suppliers.repository.js';
import { SuppliersService } from './suppliers.service.js';

@Module({
  imports: [SessionModule],
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersRepository],
  exports: [SuppliersService],
})
export class SuppliersModule {}
