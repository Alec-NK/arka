import { BaseService } from './base.service';
import type { TransactionDto, TransactionPageDto, TransactionQueryDto, TransactionInputDto } from '../dto/transaction.dto';
export class TransactionsService extends BaseService {
 private static instance: TransactionsService;
 private constructor() { super() }
 static getInstance() { return this.instance ??= new TransactionsService() }
 async list(params: TransactionQueryDto, signal?: AbortSignal) { return (await this.client.get<TransactionPageDto>('/transactions', { params, signal })).data }
 async get(id: string, signal?: AbortSignal) { return (await this.client.get<TransactionDto>(`/transactions/${id}`, { signal })).data }
 async create(payload: TransactionInputDto) { return (await this.client.post<TransactionDto>('/transactions', payload)).data }
 async update(id: string, payload: TransactionInputDto & { version: number }) { return (await this.client.patch<TransactionDto>(`/transactions/${id}`, payload)).data }
 async remove(id: string, version: number) { await this.client.delete(`/transactions/${id}`, { params: { version } }) }
}
