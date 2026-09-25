import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService } from '../../infra/services';
import { toTransaction, toTransactionPayload } from '../../infra/mappers/transaction.mapper';
import type { Transaction, TransactionInput } from '../../types/transaction';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
export interface CreateTransactionParams { input: TransactionInput }
export type CreateTransactionResult = Transaction;
export function useCreateTransaction() {
 const client = useQueryClient();
 return useMutation({ mutationFn: async ({ input }: CreateTransactionParams): Promise<CreateTransactionResult> => {
  try { return toTransaction(await TransactionsService.getInstance().create(toTransactionPayload(input))) } catch (e) { throw toApiError(e) }
 }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] }), client.invalidateQueries({ queryKey: [QUERY_KEYS.transaction] })]); } });
}
