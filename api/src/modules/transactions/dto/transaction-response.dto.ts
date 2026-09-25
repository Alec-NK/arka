import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto.js';
import { TransactionTypeResponseDto } from '../../transaction-types/dto/transaction-type-response.dto.js';
import type { SupplierSummaryDto } from '../../suppliers/dto/supplier-response.dto.js';

export class TransactionResponseDto {
  id: string;
  transaction_type_id: string;
  transaction_type: TransactionTypeResponseDto;
  supplier_id: string | null;
  supplier: SupplierSummaryDto | null;
  amount: string;
  currency: string;
  transaction_date: string;
  description: string;
  reference: string | null;
  notes: string | null;
  version: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
export class TransactionSummaryDto {
  currency: string;
  sales: string;
  purchases: string;
  expenses: string;
  net: string;
}
export class TransactionPageResponseDto {
  data: TransactionResponseDto[];
  meta: PaginationMetaDto;
  summary: TransactionSummaryDto;
}
