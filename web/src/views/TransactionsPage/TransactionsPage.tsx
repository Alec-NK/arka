import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useGetSession } from '../../hooks/session';
import { useGetTransactionList, useGetTransaction } from '../../hooks/transactions';
import { useGetTransactionTypeList } from '../../hooks/transaction-types';
import { Button } from '../../components/atom/Button';
import { Dialog } from '../../components/organism/Dialog';
import { Notice } from '../../components/molecule/Notice';
import { AppLayout } from '../_components/AppLayout';
import { PageHeader } from '../_components/PageHeader';
import { TransactionFilters } from './_components/TransactionFilters';
import { TransactionSummary } from './_components/TransactionSummary';
import { TransactionsTable } from './_components/TransactionsTable';
import { TransactionDetails } from './_components/TransactionDetails';
import { TransactionForm } from './_components/TransactionForm';
import { DeleteTransactionDialog } from './_components/DeleteTransactionDialog';
import { readFilters, writeFilters } from './_utils/transaction-search-params';
import { formatMonthYear } from '../../utils/format-date';
import type { Transaction, TransactionFilters as Filters } from '../../types/transaction';
function findTrigger(id: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>(`[data-transaction-trigger="${id}"]`)].find(element => element.getClientRects().length > 0) ?? null;
}
export default function TransactionsPage() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params); const selectedId = params.get('selected') || '';
  const restoreId = useRef('');
  const session = useGetSession(); const userId = session.data?.id || '';
  const list = useGetTransactionList({ userId, filters });
  const types = useGetTransactionTypeList({ userId });
  const detail = useGetTransaction({ userId, id: selectedId });
  const [form, setForm] = useState<Transaction | 'new' | null>(null);
  const [deletion, setDeletion] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState('');
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1440px)').matches);
  useEffect(() => { const query = window.matchMedia('(min-width: 1440px)'); const change = () => setDesktop(query.matches); query.addEventListener('change', change); return () => query.removeEventListener('change', change); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 7000); return () => clearTimeout(timer); }, [notice]);
  const changeFilters = useCallback((update: Partial<Filters>) => setParams(previous => writeFilters(previous, { ...readFilters(previous), ...update, page: update.page ?? 1 })), [setParams]);
  const select = (id: string) => setParams(previous => { const next = new URLSearchParams(previous); if (id) next.set('selected', id); else next.delete('selected'); return next; });
  const closeDetails = () => { restoreId.current = selectedId; select(''); };
  useEffect(() => { if (selectedId || !restoreId.current) return; const id = restoreId.current; restoreId.current = ''; const timer = window.setTimeout(() => findTrigger(id)?.focus(), 0); return () => clearTimeout(timer); }, [selectedId]);
  useEffect(() => { if (list.data && filters.page > Math.max(1, list.data.meta.totalPages)) changeFilters({ page: Math.max(1, list.data.meta.totalPages) }); }, [list.data, filters.page, changeFilters]);
  const clear = () => changeFilters({ dateFrom: '', dateTo: '', transactionTypeId: '', supplierId: '', search: '' });
  const invalidType = !!filters.transactionTypeId && !!types.data && !types.data.some(type => type.id === filters.transactionTypeId);
  const error = invalidType ? 'Este tipo de transação não está disponível. Limpe o filtro para continuar.' : list.error?.message;
  const detailsProps = { transaction: detail.data, loading: detail.isPending, error: detail.error?.message, onClose: closeDetails, onRetry: () => void detail.refetch(), onEdit: (transaction: Transaction) => setForm(transaction), onDelete: (transaction: Transaction) => setDeletion(transaction) };
  const scope = `${filters.dateFrom ? formatMonthYear(filters.dateFrom.slice(0, 7)) : 'Todas as datas'} · ${filters.search || filters.transactionTypeId || filters.supplierId ? 'com filtros aplicados' : 'todas as transações'}`;
  const add = () => setForm('new');
  function saved(transaction: Transaction) {
    const matches = (!filters.dateFrom || transaction.transactionDate >= filters.dateFrom) && (!filters.dateTo || transaction.transactionDate <= filters.dateTo) && (!filters.transactionTypeId || transaction.transactionTypeId === filters.transactionTypeId) && (!filters.supplierId || transaction.supplierId === filters.supplierId) && (!filters.search || `${transaction.description} ${transaction.reference || ''}`.toLocaleLowerCase('pt-BR').includes(filters.search.toLocaleLowerCase('pt-BR')));
    setNotice(`${form === 'new' ? 'Transação adicionada.' : 'Transação atualizada.'} ${matches ? 'Os totais foram atualizados.' : 'Ela está fora dos filtros atuais. Limpe os filtros para encontrá-la.'}`);
    setForm(null); if (selectedId) select('');
  }
  return <AppLayout name={session.data?.name || 'Seu perfil'}>
    <PageHeader title="Transações" description="Acompanhe cada movimento. Tenha clareza do seu saldo." action={<Button variant="primary" onClick={add} disabled={!types.data?.length}><Plus />Adicionar transação</Button>} />
    <TransactionSummary summary={list.data?.summary} loading={list.isPending} scope={scope} />
    {types.isError && <div role="alert" className="feedback-error mb-5 flex flex-wrap items-center gap-3"><AlertCircle size={19} /><span className="flex-1">Não foi possível carregar os tipos de transação. {types.error.message}</span><Button onClick={() => void types.refetch()}>Tentar novamente</Button></div>}
    <div className={`grid items-start gap-5 ${selectedId && desktop ? 'grid-cols-[minmax(0,1fr)_320px] min-[1700px]:grid-cols-[minmax(0,1fr)_350px]' : 'grid-cols-1'}`}>
      <section className="@container min-w-0 rounded-xl border border-line bg-white" aria-label="Transações"><TransactionFilters filters={filters} types={types.data || []} userId={userId} onChange={changeFilters} />
        {error ? <div role="alert" className="feedback-error m-5 flex flex-wrap items-center gap-3"><AlertCircle size={20} /><span className="min-w-[150px] flex-1">{error}</span><Button onClick={invalidType ? clear : () => void list.refetch()}>{invalidType ? 'Limpar filtros' : 'Tentar novamente'}</Button></div> : <TransactionsTable data={list.data?.data || []} selectedId={selectedId} sortOrder={filters.sortOrder} loading={list.isPending} onSort={() => changeFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })} onSelect={select} onEdit={setForm} onDelete={setDeletion} onClear={clear} onCreate={add} canCreate={!!types.data?.length} filtered={!!(filters.search || filters.transactionTypeId || filters.supplierId || filters.dateFrom || filters.dateTo)} />}
        {list.data && !error && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-muted"><span>{list.data.meta.total ? `${(list.data.meta.page - 1) * list.data.meta.pageSize + 1}–${Math.min(list.data.meta.page * list.data.meta.pageSize, list.data.meta.total)} de ${list.data.meta.total} transações` : '0 transações'}</span>{list.data.meta.totalPages > 1 && <div className="flex items-center gap-2"><Button className="!size-11 !p-0" aria-label="Página anterior" disabled={filters.page <= 1 || list.isFetching} onClick={() => changeFilters({ page: filters.page - 1 })}><ChevronLeft /></Button><span>Página {filters.page} de {list.data.meta.totalPages}</span><Button className="!size-11 !p-0" aria-label="Próxima página" disabled={filters.page >= list.data.meta.totalPages || list.isFetching} onClick={() => changeFilters({ page: filters.page + 1 })}><ChevronRight /></Button></div>}</footer>}
      </section>
      {selectedId && desktop && <TransactionDetails {...detailsProps} />}
    </div>
    {selectedId && !desktop && <Dialog title="Detalhes da transação" onClose={closeDetails} sheet><TransactionDetails {...detailsProps} embedded /></Dialog>}
    {form && <TransactionForm key={form === 'new' ? 'new' : form.id} transaction={form === 'new' ? undefined : form} types={types.data || []} userId={userId} onClose={() => setForm(null)} onSaved={saved} />}
    {deletion && <DeleteTransactionDialog transaction={deletion} onClose={() => setDeletion(null)} onDeleted={() => { setDeletion(null); select(''); setNotice('Transação excluída. Seus totais estão atualizados.'); }} onRefresh={async () => { const id = deletion.id; setDeletion(null); select(id); if (id === selectedId) await detail.refetch(); setNotice('Versão recente carregada. Revise a transação antes de excluir.'); }} />}
    <Notice message={notice} onDismiss={() => setNotice('')} />
  </AppLayout>;
}
