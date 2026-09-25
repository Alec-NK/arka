import { BaseService } from './base.service';
import type { TypePageDto } from '../dto/transaction.dto';
export class TransactionTypesService extends BaseService {
 private static instance: TransactionTypesService;
 private constructor() { super() }
 static getInstance() { return this.instance ??= new TransactionTypesService() }
 async list(page: number, includeDeleted = false, signal?: AbortSignal) { return (await this.client.get<TypePageDto>('/transaction-types', { params: { page, page_size: 100, include_deleted: includeDeleted }, signal })).data }
}
