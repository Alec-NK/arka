import { useQuery } from '@tanstack/react-query';
import { TransactionsService } from '../../infra/services';
import { toTransactionPage, toTransactionQuery } from '../../infra/mappers/transaction.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { TransactionFilters, TransactionPage } from '../../types/transaction';
export interface GetTransactionListParams { userId: string; filters: TransactionFilters }
export type GetTransactionListResult = TransactionPage;
export function useGetTransactionList({ userId, filters }: GetTransactionListParams) {
 return useQuery({ queryKey: [QUERY_KEYS.transactions, userId, filters], queryFn: async ({ signal }): Promise<GetTransactionListResult> => {
  try { return toTransactionPage(await TransactionsService.getInstance().list(toTransactionQuery(filters), signal)) } catch (e) { throw toApiError(e) }
 }, enabled: !!userId, placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === userId ? previous : undefined });
}
