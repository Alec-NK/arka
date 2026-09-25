import type { SessionDto, CreateSessionDto } from '../dto/session.dto';
import type { Session } from '../../types/session';

export function toSession(dto: SessionDto): Session {
  return { id: dto.id, name: dto.name || dto.email, email: dto.email };
}

export function toSessionPayload(email: string): CreateSessionDto {
  return { email: email.trim() };
}
