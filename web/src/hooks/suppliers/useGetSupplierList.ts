import { useQuery } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toSupplierPage, toSupplierQuery } from '../../infra/mappers/supplier.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { SupplierPage } from '../../types/supplier';
import { ApiError } from '../../types/api-error';

export interface GetSupplierListParams { userId: string; search: string; page: number; pageSize: number }
export type GetSupplierListResult = SupplierPage;

export function useGetSupplierList({ userId, search, page, pageSize }: GetSupplierListParams) {
  return useQuery<GetSupplierListResult, ApiError>({ queryKey: [QUERY_KEYS.suppliers, userId, search, page, pageSize], enabled: !!userId, placeholderData: previous => previous, queryFn: async ({ signal }): Promise<GetSupplierListResult> => {
    try { return toSupplierPage(await SuppliersService.getInstance().list(toSupplierQuery(search, page, pageSize), signal)) } catch (e) { throw toApiError(e) }
  } });
}
