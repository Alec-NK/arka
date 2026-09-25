import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService } from '../../infra/services';
import { toTransaction, toTransactionPayload } from '../../infra/mappers/transaction.mapper';
import type { Transaction, TransactionInput } from '../../types/transaction';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
export interface UpdateTransactionParams { id: string; version: number; input: TransactionInput }
export type UpdateTransactionResult = Transaction;
export function useUpdateTransaction() {
 const client = useQueryClient();
 return useMutation({ mutationFn: async ({ id, version, input }: UpdateTransactionParams): Promise<UpdateTransactionResult> => {
  try { return toTransaction(await TransactionsService.getInstance().update(id, { ...toTransactionPayload(input), version })) } catch (e) { throw toApiError(e) }
 }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] }), client.invalidateQueries({ queryKey: [QUERY_KEYS.transaction] })]); } });
}
