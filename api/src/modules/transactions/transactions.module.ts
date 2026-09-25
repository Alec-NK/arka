import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module.js';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module.js';
import { SuppliersModule } from '../suppliers/suppliers.module.js';
import { TransactionsController } from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';
import { TransactionsRepository } from './transactions.repository.js';

@Module({
  imports: [SessionModule, TransactionTypesModule, SuppliersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
  exports: [TransactionsService],
})
export class TransactionsModule {}
