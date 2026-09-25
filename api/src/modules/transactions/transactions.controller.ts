import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  buildPaginationMeta,
  toOffsetPagination,
} from '../../common/utils/pagination.js';
import { SessionGuard } from '../session/session.guard.js';
import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { TransactionQueryDto } from './dto/transaction-query.dto.js';
import { DeleteTransactionQueryDto } from './dto/delete-transaction-query.dto.js';
import type {
  TransactionPageResponseDto,
  TransactionResponseDto,
} from './dto/transaction-response.dto.js';
import {
  toCreateTransactionInput,
  toUpdateTransactionInput,
  toTransactionFilter,
  toTransactionResponse,
} from './mappers/transaction.mapper.js';

@ApiTags('transactions')
@UseGuards(SessionGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  async list(
    @CurrentUser() userId: string,
    @Query() query: TransactionQueryDto,
  ): Promise<TransactionPageResponseDto> {
    const page = await this.service.list(
      userId,
      toTransactionFilter(query, toOffsetPagination(query)),
    );
    return {
      data: page.transactions.map(toTransactionResponse),
      meta: buildPaginationMeta(page.total, query),
      summary: page.summary,
    };
  }

  @Get(':id')
  async get(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionResponseDto> {
    return toTransactionResponse(await this.service.getById(userId, id));
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return toTransactionResponse(
      await this.service.create(userId, toCreateTransactionInput(dto)),
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return toTransactionResponse(
      await this.service.update(userId, id, toUpdateTransactionInput(dto)),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: DeleteTransactionQueryDto,
  ): Promise<void> {
    await this.service.remove(userId, id, query.version);
  }
}
