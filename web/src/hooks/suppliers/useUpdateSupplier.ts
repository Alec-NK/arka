import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toSupplier, toSupplierPayload } from '../../infra/mappers/supplier.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import type { Supplier } from '../../types/supplier';
import { QUERY_KEYS } from '../query-keys';

export function useUpdateSupplier() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ id, version, name }: { id: string; version: number; name: string }): Promise<Supplier> => { try { return toSupplier(await SuppliersService.getInstance().update(id, { ...toSupplierPayload(name), version })) } catch (e) { throw toApiError(e) } }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: [QUERY_KEYS.suppliers] }), client.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] }), client.invalidateQueries({ queryKey: [QUERY_KEYS.transaction] })]) } });
}
