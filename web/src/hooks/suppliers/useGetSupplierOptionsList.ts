import { useQuery } from '@tanstack/react-query';
import { SuppliersService } from '../../infra/services';
import { toSupplierPage, toSupplierQuery } from '../../infra/mappers/supplier.mapper';
import { toApiError } from '../../infra/mappers/api-error.mapper';
import { QUERY_KEYS } from '../query-keys';
import type { SupplierSummary } from '../../types/supplier';
import { ApiError } from '../../types/api-error';

const SUPPLIER_OPTIONS_PAGE_SIZE = 100;

export interface GetSupplierOptionsListParams { userId: string }
export type GetSupplierOptionsListResult = SupplierSummary[];

export function useGetSupplierOptionsList({ userId }: GetSupplierOptionsListParams) {
  return useQuery<GetSupplierOptionsListResult, ApiError>({
    queryKey: [QUERY_KEYS.suppliers, userId, 'options'],
    enabled: !!userId,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }): Promise<GetSupplierOptionsListResult> => {
      try {
        const suppliers: SupplierSummary[] = [];
        let page = 1;
        let totalPages = 1;

        do {
          const result = toSupplierPage(await SuppliersService.getInstance().list(toSupplierQuery('', page, SUPPLIER_OPTIONS_PAGE_SIZE), signal));
          suppliers.push(...result.data.map(({ id, name, deletedAt }) => ({ id, name, deletedAt })));
          totalPages = result.meta.totalPages;
          page += 1;
        } while (page <= totalPages);

        return suppliers;
      } catch (error) {
        throw toApiError(error);
      }
    },
  });
}
