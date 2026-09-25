import { BaseService } from './base.service';
import type { SupplierDto, SupplierInputDto, SupplierPageDto, SupplierQueryDto } from '../dto/supplier.dto';

export class SuppliersService extends BaseService {
  private static instance: SuppliersService;
  private constructor() { super() }
  static getInstance() { return this.instance ??= new SuppliersService() }
  async list(params: SupplierQueryDto, signal?: AbortSignal) { return (await this.client.get<SupplierPageDto>('/suppliers', { params, signal })).data }
  async get(id: string, signal?: AbortSignal) { return (await this.client.get<SupplierDto>(`/suppliers/${id}`, { signal })).data }
  async create(payload: SupplierInputDto) { return (await this.client.post<SupplierDto>('/suppliers', payload)).data }
  async update(id: string, payload: SupplierInputDto & { version: number }) { return (await this.client.patch<SupplierDto>(`/suppliers/${id}`, payload)).data }
}
