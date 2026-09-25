import { useQuery } from '@tanstack/react-query';
import { TransactionsService } from '../../infra/services';
import { toTransaction } from '../../infra/mappers/transaction.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { Transaction } from '../../types/transaction';
export interface GetTransactionParams { userId: string; id: string }
export type GetTransactionResult = Transaction;
export function useGetTransaction({ userId, id }: GetTransactionParams) {
 return useQuery({ queryKey: [QUERY_KEYS.transaction, userId, id], enabled: !!userId && !!id, queryFn: async ({ signal }): Promise<GetTransactionResult> => {
  try { return toTransaction(await TransactionsService.getInstance().get(id, signal)) } catch (e) { throw toApiError(e) }
 } });
}
