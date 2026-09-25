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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { toOffsetPagination } from '../../common/utils/pagination.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type {
  PaginatedUserResponseDto,
  UserResponseDto,
} from './dto/user-response.dto.js';
import {
  toCreateUserInput,
  toPaginatedUserResponse,
  toUpdateUserInput,
  toUserResponse,
} from './mappers/user.mapper.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedUserResponseDto> {
    const { users, total } = await this.usersService.list(
      toOffsetPagination(query),
    );
    return toPaginatedUserResponse(users, total, query);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return toUserResponse(await this.usersService.getById(id));
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return toUserResponse(
      await this.usersService.create(toCreateUserInput(dto)),
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return toUserResponse(
      await this.usersService.update(id, toUpdateUserInput(dto)),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
