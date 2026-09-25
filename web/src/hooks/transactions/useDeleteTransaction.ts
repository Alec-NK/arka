import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionsService } from '../../infra/services';

import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
export interface DeleteTransactionParams { id: string; version: number }
export type DeleteTransactionResult = void;
export function useDeleteTransaction() {
 const client = useQueryClient();
 return useMutation({ mutationFn: async ({ id, version }: DeleteTransactionParams): Promise<DeleteTransactionResult> => {
  try { await TransactionsService.getInstance().remove(id, version) } catch (e) { throw toApiError(e) }
 }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] }), client.invalidateQueries({ queryKey: [QUERY_KEYS.transaction] })]); } });
}
