import { useQuery } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toSupplier } from '../../infra/mappers/supplier.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { Supplier } from '../../types/supplier';
export interface GetSupplierParams { userId: string; id: string }
export type GetSupplierResult = Supplier;
export function useGetSupplier({ userId, id }: GetSupplierParams) {
  return useQuery({ queryKey: [QUERY_KEYS.supplier, userId, id], enabled: !!userId && !!id, retry: false, queryFn: async ({ signal }): Promise<GetSupplierResult> => {
    try { return toSupplier(await SuppliersService.getInstance().get(id, signal)); } catch (error) { throw toApiError(error); }
  } });
}
