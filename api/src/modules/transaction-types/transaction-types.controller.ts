import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  buildPaginationMeta,
  toOffsetPagination,
} from '../../common/utils/pagination.js';
import { SessionGuard } from '../session/session.guard.js';
import { TransactionTypesService } from './transaction-types.service.js';
import { toTransactionTypeResponse } from './mappers/transaction-type.mapper.js';
import type { TransactionTypePageResponseDto } from './dto/transaction-type-response.dto.js';
import { TransactionTypeQueryDto } from './dto/transaction-type-query.dto.js';

@ApiTags('transaction-types')
@UseGuards(SessionGuard)
@Controller('transaction-types')
export class TransactionTypesController {
  constructor(private readonly service: TransactionTypesService) {}

  @Get()
  async list(
    @Query() query: TransactionTypeQueryDto,
  ): Promise<TransactionTypePageResponseDto> {
    const result = await this.service.list(
      toOffsetPagination(query),
      query.include_deleted,
    );
    return {
      data: result.types.map(toTransactionTypeResponse),
      meta: buildPaginationMeta(result.total, query),
    };
  }
}
