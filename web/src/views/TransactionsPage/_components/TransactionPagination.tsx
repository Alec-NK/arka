import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/atom/Button';
import type { TransactionPage } from '../../../types/transaction';
import { TRANSACTION_PAGE_SIZES } from '../_utils/transaction-search-params';

interface Props {
  meta: TransactionPage['meta'];
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function TransactionPagination({ meta, pageSize, loading, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, meta.totalPages);
  const first = meta.total ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const last = Math.min(meta.page * meta.pageSize, meta.total);

  return <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-4 py-4 text-xs text-muted sm:px-5" aria-busy={loading}>
    <span role="status" className="numeric">{meta.total ? `${first}–${last} de ${meta.total} transações` : '0 transações'}</span>
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <label className="flex items-center gap-2 whitespace-nowrap">
        Itens por página
        <select className="field-control !w-20 !text-xs" value={pageSize} disabled={loading} onChange={event => onPageSizeChange(Number(event.target.value))}>
          {TRANSACTION_PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <nav aria-label="Paginação das transações" className="flex items-center gap-2">
        <Button className="!size-11 !p-0" aria-label="Página anterior" disabled={meta.page <= 1 || loading} onClick={() => onPageChange(meta.page - 1)}><ChevronLeft /></Button>
        <span className="numeric whitespace-nowrap">Página {meta.page} de {totalPages}</span>
        <Button className="!size-11 !p-0" aria-label="Próxima página" disabled={meta.page >= totalPages || loading} onClick={() => onPageChange(meta.page + 1)}><ChevronRight /></Button>
      </nav>
    </div>
  </footer>;
}
