import { useQuery } from '@tanstack/react-query';
import { TransactionTypesService } from '../../infra/services';
import { toTransactionType } from '../../infra/mappers/transaction.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { TransactionType } from '../../types/transaction';
export interface GetTransactionTypeListParams { userId: string }
export type GetTransactionTypeListResult = TransactionType[];
export function useGetTransactionTypeList({ userId }: GetTransactionTypeListParams) {
 return useQuery({ queryKey: [QUERY_KEYS.transactionTypes, userId], staleTime: 300000, enabled: !!userId, queryFn: async ({ signal }): Promise<GetTransactionTypeListResult> => {
  try {
   const types: TransactionType[] = []; let page = 1; let totalPages = 1;
   do { const result = await TransactionTypesService.getInstance().list(page, true, signal); types.push(...result.data.map(toTransactionType)); totalPages = result.meta.total_pages; page++; } while (page <= totalPages);
   return types;
  } catch (e) { throw toApiError(e) }
 } });
}
