import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toSupplier, toSupplierPayload } from '../../infra/mappers/supplier.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import type { Supplier } from '../../types/supplier';
import { QUERY_KEYS } from '../query-keys';

export function useCreateSupplier() {
  const client = useQueryClient();
  return useMutation({ mutationFn: async ({ name }: { name: string }): Promise<Supplier> => { try { return toSupplier(await SuppliersService.getInstance().create(toSupplierPayload(name))) } catch (e) { throw toApiError(e) } }, onSuccess: async () => { await client.invalidateQueries({ queryKey: [QUERY_KEYS.suppliers] }) } });
}
