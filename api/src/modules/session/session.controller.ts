import { Body, Controller, Get, Headers, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionService } from './session.service.js';
import { toUserResponse } from '../users/mappers/user.mapper.js';
import type { UserResponseDto } from '../users/dto/user-response.dto.js';
import { CreateSessionDto } from './dto/create-session.dto.js';

@ApiTags('session')
@Controller('session')
export class SessionController {
  constructor(private readonly session: SessionService) {}
  @Get()
  async current(
    @Headers('x-user-id') userId?: string,
  ): Promise<UserResponseDto> {
    return toUserResponse(await this.session.current(userId));
  }

  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateSessionDto): Promise<UserResponseDto> {
    return toUserResponse(await this.session.create(dto.email));
  }
}
