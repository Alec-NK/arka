import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { DeleteSupplierQueryDto } from './dto/delete-supplier-query.dto.js';
import { SupplierQueryDto } from './dto/supplier-query.dto.js';
import type {
  SupplierPageResponseDto,
  SupplierResponseDto,
} from './dto/supplier-response.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import {
  toCreateSupplierInput,
  toSupplierFilter,
  toSupplierResponse,
  toUpdateSupplierInput,
} from './mappers/supplier.mapper.js';
import { SuppliersService } from './suppliers.service.js';

@ApiTags('suppliers')
@UseGuards(SessionGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  async list(
    @CurrentUser() userId: string,
    @Query() query: SupplierQueryDto,
  ): Promise<SupplierPageResponseDto> {
    const page = await this.service.list(
      userId,
      toSupplierFilter(query, toOffsetPagination(query)),
    );
    return {
      data: page.suppliers.map(toSupplierResponse),
      meta: buildPaginationMeta(page.total, query),
    };
  }

  @Get(':id')
  async get(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupplierResponseDto> {
    return toSupplierResponse(await this.service.getById(userId, id));
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() dto: CreateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return toSupplierResponse(
      await this.service.create(userId, toCreateSupplierInput(dto)),
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return toSupplierResponse(
      await this.service.update(userId, id, toUpdateSupplierInput(dto)),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: DeleteSupplierQueryDto,
  ): Promise<void> {
    await this.service.remove(userId, id, query.version);
  }
}
