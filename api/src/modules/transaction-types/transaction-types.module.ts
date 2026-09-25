import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module.js';
import { TransactionTypesController } from './transaction-types.controller.js';
import { TransactionTypesService } from './transaction-types.service.js';
import { TransactionTypesRepository } from './transaction-types.repository.js';

@Module({
  imports: [SessionModule],
  controllers: [TransactionTypesController],
  providers: [TransactionTypesService, TransactionTypesRepository],
  exports: [TransactionTypesService],
})
export class TransactionTypesModule {}
