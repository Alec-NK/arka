import { BadRequestException, Injectable } from '@nestjs/common';
import type { OffsetPagination } from '../../common/utils/pagination.js';
import { TransactionTypesRepository } from './transaction-types.repository.js';

@Injectable()
export class TransactionTypesService {
  constructor(private readonly repository: TransactionTypesRepository) {}

  list(pagination: OffsetPagination, includeDeleted = false) {
    return this.repository.list(pagination, includeDeleted);
  }

  async requireSupported(id: string) {
    const type = await this.repository.findById(id);
    if (!type || !['sale', 'purchase', 'expense'].includes(type.code)) {
      throw new BadRequestException('Select a valid transaction type');
    }
    return type;
  }

  async requireFilterable(id: string) {
    const type = await this.repository.findByIdIncludingDeleted(id);
    if (!type || !['sale', 'purchase', 'expense'].includes(type.code)) {
      throw new BadRequestException('Select a valid transaction type');
    }
    return type;
  }

  softDelete(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }
}
