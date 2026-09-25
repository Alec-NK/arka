import type { SupplierSummaryDto } from './supplier.dto';

export interface TransactionTypeDto { id: string; code: string; name: string; deleted_at: string | null }
export interface TransactionDto {
 id: string; transaction_type_id: string; transaction_type: TransactionTypeDto; supplier_id: string | null; supplier: SupplierSummaryDto | null; amount: string; currency: string;
 transaction_date: string; description: string; reference: string | null; notes: string | null; version: number; deleted_at: string | null; created_at: string; updated_at: string;
}
export interface TransactionInputDto { transaction_type_id: string; supplier_id: string | null; amount: string; currency: string; transaction_date: string; description: string; reference: string | null; notes: string | null }
export interface TransactionQueryDto { date_from?: string; date_to?: string; transaction_type_id?: string; supplier_id?: string; search?: string; sort_order: string; page: number; page_size: number }
export interface PaginationDto { page: number; page_size: number; total: number; total_pages: number }
export interface TransactionPageDto { data: TransactionDto[]; meta: PaginationDto; summary: { currency: string; sales: string; purchases: string; expenses: string; net: string } }
export interface TypePageDto { data: TransactionTypeDto[]; meta: PaginationDto }
