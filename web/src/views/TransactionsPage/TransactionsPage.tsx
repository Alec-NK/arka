import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react';
import { useGetSession } from '../../hooks/session';
import { useGetTransactionList, useGetTransaction } from '../../hooks/transactions';
import { useGetTransactionTypeList } from '../../hooks/transaction-types';
import { useGetSupplierOptionsList } from '../../hooks/suppliers';
import { Button } from '../../components/atom/Button';
import { Dialog } from '../../components/organism/Dialog';
import { AppLayout } from '../_components/AppLayout';
import { TransactionFilters } from './_components/TransactionFilters';
import { TransactionSummary } from './_components/TransactionSummary';
import { TransactionsTable } from './_components/TransactionsTable';
import { TransactionDetails } from './_components/TransactionDetails';
import { TransactionForm } from './_components/TransactionForm';
import { DeleteTransactionDialog } from './_components/DeleteTransactionDialog';
import { readFilters, writeFilters } from './_utils/transaction-search-params';
import type { Transaction, TransactionFilters as Filters } from '../../types/transaction';
const classes = {
  "header": "mb-[25px] flex items-start justify-between gap-6 pr-[18px] max-[1023px]:pr-0 max-[600px]:flex-wrap max-[600px]:gap-5 [&_h1]:mb-[7px] [&_h1]:text-[36px] [&_h1]:leading-[1.25] [&_h1]:font-semibold [&_h1]:tracking-[-1.1px] [&_h1]:text-[#0d1221] max-[1023px]:[&_h1]:text-[32px] max-[600px]:[&_h1]:text-[30px] [&_p]:text-[17px] [&_p]:leading-[1.5] [&_p]:text-[#687087] max-[1023px]:[&_p]:text-[15px] max-[600px]:[&_p]:max-w-[32ch] max-[600px]:[&_p]:text-sm max-[600px]:[&_p]:leading-[1.7]",
  "headerActions": "flex items-center gap-[18px] max-[600px]:w-full max-[600px]:justify-between max-[600px]:gap-3.5 [&>button]:min-w-[199px] max-[1023px]:[&>button]:min-w-0 max-[600px]:[&>button]:min-h-11 max-[600px]:[&>button]:text-[13px]",
  "workspace": "grid grid-cols-[minmax(0,1fr)] items-start gap-[22px]",
  "withDetails": "grid-cols-[minmax(0,1fr)_348px] min-[1440px]:max-[1550px]:grid-cols-[minmax(0,1fr)_320px]",
  "activity": "@container min-w-0 pt-[7px] max-[600px]:pt-0",
  "pagination": "mt-6 flex min-h-7 items-center justify-between gap-4 text-sm text-[#4b566e] max-[600px]:flex-wrap max-[600px]:text-xs [&>div]:flex [&>div]:items-center [&>div]:gap-2 [&>div]:text-xs max-[600px]:[&>div]:w-full max-[600px]:[&>div]:justify-between [&_button]:min-h-10 [&_button]:w-10 [&_button]:p-2",
  "error": "my-3 flex flex-wrap items-center gap-3 rounded-md border border-[#efcad2] p-5 text-sm leading-[1.6] text-[#a11831] [&>svg]:shrink-0 [&>span]:min-w-[140px] [&>span]:flex-1",
  "notice": "fixed bottom-6 left-1/2 z-20 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-lg bg-[#23392d] py-3 pr-3.5 pl-[18px] text-[13px] leading-[1.6] text-white shadow-layer [&>svg]:shrink-0 [&_button]:grid [&_button]:h-8 [&_button]:w-8 [&_button]:shrink-0 [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-inherit"
} as Record<string, string>;
function findTransactionTrigger(id: string): HTMLElement | null {
 return [...document.querySelectorAll<HTMLElement>(`[data-transaction-trigger="${id}"]`)].find(element => element.getClientRects().length > 0) ?? null;
}
export default function TransactionsPage() {
 const [params, setParams] = useSearchParams(); const filters = readFilters(params); const selectedId = params.get('selected') || '';
 const restoreSelection = useRef<HTMLElement | null>(null);
 const restoreSelectionId = useRef('');
 const session = useGetSession(); const userId = session.data?.id || '';
 const list = useGetTransactionList({ userId, filters }); const types = useGetTransactionTypeList({ userId }); const suppliers = useGetSupplierOptionsList({ userId }); const detail = useGetTransaction({ userId, id: selectedId });
 const [form, setForm] = useState<Transaction | 'new' | null>(null); const [deletion, setDeletion] = useState<Transaction | null>(null); const [notice, setNotice] = useState('');
 const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1440px)').matches);
 useEffect(() => { const query = window.matchMedia('(min-width: 1440px)'); const change = () => setDesktop(query.matches); query.addEventListener('change', change); return () => query.removeEventListener('change', change) }, []);
 useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6000); return () => clearTimeout(timer) }, [notice]);
 const changeFilters = useCallback((update: Partial<Filters>) => { setParams(previous => writeFilters(previous, { ...readFilters(previous), ...update, page: update.page ?? 1 })); }, [setParams]);
 const select = (id: string, trigger?: HTMLElement) => { if (!id) { restoreSelection.current = trigger ?? (selectedId ? findTransactionTrigger(selectedId) : null); restoreSelectionId.current = selectedId; } setParams(previous => { const next = new URLSearchParams(previous); if(id) next.set('selected',id); else next.delete('selected'); return next; }); };
 useEffect(() => { if (selectedId || !restoreSelectionId.current) return; const id = restoreSelectionId.current; restoreSelectionId.current = ''; restoreSelection.current = null; window.setTimeout(() => findTransactionTrigger(id)?.focus(), 100); }, [selectedId]);
 const closeDetails = () => { if (selectedId) { restoreSelectionId.current = selectedId; restoreSelection.current = findTransactionTrigger(selectedId); } select(''); };
 useEffect(() => { if (list.data && filters.page > Math.max(1,list.data.meta.totalPages)) changeFilters({ page: Math.max(1,list.data.meta.totalPages) }) }, [list.data, filters.page, changeFilters]);
 const clear = () => changeFilters({ dateFrom: '', dateTo: '', transactionTypeId: '', supplierId: '', search: '' });
 const detailsProps = { transaction: detail.data, loading: detail.isPending, error: detail.error?.message, onClose: closeDetails, onRetry: () => void detail.refetch(), onEdit: (transaction: Transaction) => setForm(transaction), onDelete: (transaction: Transaction) => setDeletion(transaction) };
 const invalidType = !!filters.transactionTypeId && !!types.data && !types.data.some(type => type.id === filters.transactionTypeId);
 const error = invalidType ? 'Este tipo de transação não está disponível. Limpe o filtro para continuar.' : list.error?.message;
 const refreshEditor = async () => { const id = typeof form === 'object' && form ? form.id : deletion?.id; if(id) { select(id); setForm(null); setDeletion(null); if(id === selectedId) await detail.refetch(); setNotice('A versão mais recente foi carregada. Revise-a antes de editar novamente.'); } };
 return <AppLayout name={session.data?.name || 'Seu perfil'}><header className={classes.header}><div><h1>Transações</h1><p>Consulte, filtre e gerencie toda a sua movimentação financeira.</p></div><div className={classes.headerActions}><Button variant="primary" onClick={() => setForm('new')} disabled={!types.data?.length}><Plus size={21} />Adicionar transação</Button></div></header>
 <div className={`${classes.workspace} ${selectedId && desktop ? classes.withDetails : ''}`}><section className={classes.activity} aria-label="Transações"><TransactionFilters filters={filters} types={types.data || []} suppliers={suppliers.data || []} suppliersLoading={suppliers.isPending} onChange={changeFilters} /><TransactionSummary summary={list.data?.summary} loading={list.isPending} />
 {types.isError && <div className={classes.error} role="alert"><AlertCircle size={19} /><span>Não foi possível carregar os tipos de transação. {types.error.message}</span><Button onClick={() => void types.refetch()}>Tentar novamente</Button></div>}
 {suppliers.isError && <div className={classes.error} role="alert"><AlertCircle size={19} /><span>Não foi possível carregar os fornecedores. {suppliers.error.message}</span><Button onClick={() => void suppliers.refetch()}>Tentar novamente</Button></div>}
 {error ? <div className={classes.error} role="alert"><AlertCircle size={20} /><span>{error}</span><Button onClick={invalidType ? clear : () => void list.refetch()}>{invalidType ? 'Limpar filtros' : 'Tentar novamente'}</Button></div> : <TransactionsTable data={list.data?.data || []} selectedId={selectedId} sortOrder={filters.sortOrder} loading={list.isPending} onSort={() => changeFilters({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })} onSelect={select} onEdit={setForm} onDelete={setDeletion} onClear={clear} filtered={!!(filters.search || filters.transactionTypeId || filters.supplierId || filters.dateFrom || filters.dateTo)} />}
 {list.data && !error && <footer className={classes.pagination}><span>{list.data.meta.total ? `${(list.data.meta.page - 1) * list.data.meta.pageSize + 1}–${Math.min(list.data.meta.page * list.data.meta.pageSize,list.data.meta.total)} de ${list.data.meta.total} transações` : '0 transações'}</span>{list.data.meta.totalPages > 1 && <div><Button aria-label="Página anterior" disabled={filters.page <= 1 || list.isFetching} onClick={() => changeFilters({ page: filters.page - 1 })}><ChevronLeft size={17} /></Button><span>Página {filters.page} de {list.data.meta.totalPages}</span><Button aria-label="Próxima página" disabled={filters.page >= list.data.meta.totalPages || list.isFetching} onClick={() => changeFilters({ page: filters.page + 1 })}><ChevronRight size={17} /></Button></div>}</footer>}
 </section>{selectedId && desktop && <TransactionDetails {...detailsProps} />}</div>
 {selectedId && !desktop && <Dialog title="Detalhes da transação" onClose={closeDetails} sheet><TransactionDetails {...detailsProps} embedded /></Dialog>}
 {form && <TransactionForm key={form === 'new' ? 'new' : `${form.id}-${form.version}`} transaction={form === 'new' ? undefined : form} types={types.data || []} userId={userId} onClose={() => setForm(null)} onSaved={() => { setNotice(form === 'new' ? 'Transação adicionada. Sua movimentação filtrada está atualizada.' : 'Transação atualizada. Sua movimentação filtrada está atualizada.'); setForm(null); if(selectedId) select(''); }} onRefresh={() => void refreshEditor()} />}
 {deletion && <DeleteTransactionDialog transaction={deletion} onClose={() => setDeletion(null)} onDeleted={() => { setDeletion(null); select(''); setNotice('Transação excluída. Seus totais estão atualizados.'); }} onRefresh={() => void refreshEditor()} />}
 <div aria-live="polite" aria-atomic="true" className={notice ? classes.notice : 'sr-only'}>{notice && <><Check size={18} /><span>{notice}</span><button aria-label="Dispensar notificação" onClick={() => setNotice('')}><X size={16} /></button></>}</div>
 </AppLayout>;
}
