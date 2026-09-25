import { BaseService } from './base.service';
import type { SessionDto, CreateSessionDto } from '../dto/session.dto';
export class SessionService extends BaseService {
 private static instance: SessionService;
 private constructor() { super() }
 static getInstance() { return this.instance ??= new SessionService() }
 async get(signal?: AbortSignal) { return (await this.client.get<SessionDto>('/session', { signal })).data }
 async create(input: CreateSessionDto) { return (await this.client.post<SessionDto>('/session', input)).data }
}
