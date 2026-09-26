import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
export interface DeleteSupplierParams { id: string; version: number }
export type DeleteSupplierResult = void;
export function useDeleteSupplier() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, version }: DeleteSupplierParams): Promise<DeleteSupplierResult> => {
    try { await SuppliersService.getInstance().remove(id, version); } catch (error) { throw toApiError(error); }
  }, onSuccess: async () => { await Promise.all([QUERY_KEYS.suppliers, QUERY_KEYS.supplier, QUERY_KEYS.transactions, QUERY_KEYS.transaction].map(key => client.invalidateQueries({ queryKey: [key] }))); } });
}
