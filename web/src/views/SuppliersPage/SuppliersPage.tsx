import { useEffect, useState } from 'react';
import { AlertCircle, Archive, ArrowUpRight, ChevronLeft, ChevronRight, Pencil, Plus, Search, Store, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/atom/Button';
import { Notice } from '../../components/molecule/Notice';
import { AppLayout } from '../_components/AppLayout';
import { PageHeader } from '../_components/PageHeader';
import { useDebouncedValue } from '../_utils/useDebouncedValue';
import { useGetSession } from '../../hooks/session';
import { useGetSupplierList } from '../../hooks/suppliers';
import { ROUTES } from '../../routes/constants';
import { SupplierForm } from './_components/SupplierForm';
import { ArchiveSupplierDialog } from './_components/ArchiveSupplierDialog';
import type { Supplier } from '../../types/supplier';
export default function SuppliersPage() {
  const session = useGetSession();
  const userId = session.data?.id || '';
  const [params, setParams] = useSearchParams();
  const search = (params.get('search') || '').slice(0, 200);
  const requestedPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 1000000) : 1;
  const debouncedSearch = useDebouncedValue(search);
  const [form, setForm] = useState<Supplier | 'new' | null>(null);
  const [archive, setArchive] = useState<Supplier | null>(null);
  const [notice, setNotice] = useState('');
  const list = useGetSupplierList({ userId, search: debouncedSearch, page, pageSize: 20 });
  const updating = search !== debouncedSearch || list.isFetching;
  const suppliers = list.data?.data || [];
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 7000); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (!list.data || updating || list.isError) return; const last = Math.max(1, list.data.meta.totalPages); if (page > last) setParams(previous => { const next = new URLSearchParams(previous); next.set('page', String(last)); return next; }, { replace: true }); }, [list.data, list.isError, updating, page, setParams]);
  const searchFor = (value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set('search', value); else next.delete('search'); next.delete('page'); return next; }, { replace: true });
  const changePage = (value: number) => setParams(previous => { const next = new URLSearchParams(previous); next.set('page', String(value)); return next; });
  return <AppLayout name={session.data?.name || 'Seu perfil'}>
    <PageHeader title="Fornecedores" description="Seus parceiros, conectados à sua movimentação." action={<Button variant="primary" onClick={() => setForm('new')}><Plus />Adicionar fornecedor</Button>} />
    <section aria-label="Lista de fornecedores" className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-4 sm:p-5"><div className="relative w-full max-w-[460px]"><Search size={18} className="pointer-events-none absolute top-3.5 left-3.5 text-muted" /><input className="field-control !pr-11 !pl-11" aria-label="Pesquisar fornecedores" placeholder="Buscar fornecedor pelo nome…" maxLength={200} value={search} onChange={event => searchFor(event.target.value)} />{search && <button type="button" className="absolute top-0 right-0 grid size-11 place-items-center text-muted" aria-label="Limpar pesquisa" onClick={() => searchFor('')}><X size={16} /></button>}</div><span className="text-xs text-muted" role="status" aria-live="polite">{updating ? 'Atualizando fornecedores…' : list.data ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'fornecedor' : 'fornecedores'}${search ? ' encontrados' : ' cadastrados'}` : ''}</span></div>
      {list.isError ? <div role="alert" className="m-5 flex flex-wrap items-center gap-3 rounded-lg bg-[#fcedf0] p-5 text-sm text-expense"><AlertCircle size={20} /><span className="min-w-[150px] flex-1">Não foi possível carregar os fornecedores. {list.error.message}</span><Button onClick={() => void list.refetch()}>Tentar novamente</Button></div> : list.isPending || updating ? <div role="status" aria-label="Carregando fornecedores" className="divide-y divide-line">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex h-20 items-center justify-between gap-6 px-6"><span className="h-4 w-2/5 rounded bg-canvas" /><span className="h-4 w-1/6 rounded bg-canvas" /></div>)}</div> : !suppliers.length ? <div className="flex min-h-[350px] flex-col items-center justify-center px-6 py-12 text-center"><Store size={32} strokeWidth={1.4} className="text-brand" /><h2 className="mt-5 text-xl font-semibold">{search ? 'Nenhum fornecedor encontrado' : 'Comece pelos seus parceiros'}</h2><p className="mt-2 mb-6 max-w-[42ch] text-sm leading-6 text-muted">{search ? 'Tente outro nome ou limpe a pesquisa para ver todos.' : 'Cadastre um fornecedor para encontrá-lo facilmente ao registrar uma transação.'}</p>{search ? <Button onClick={() => searchFor('')}>Limpar pesquisa</Button> : <Button variant="primary" onClick={() => setForm('new')}><Plus />Adicionar fornecedor</Button>}</div> : <>
        <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_160px_128px] gap-5 border-b border-line bg-canvas/60 px-6 py-3 text-[11px] font-medium text-muted max-sm:hidden"><span>Fornecedor</span><span>Última atualização</span><span className="text-right">Ações</span></div>
        <div role="list">{suppliers.map(supplier => <article key={supplier.id} role="listitem" className="grid grid-cols-[minmax(0,1fr)_160px_128px] items-center gap-5 border-b border-line px-6 py-5 last:border-b-0 hover:bg-canvas/50 max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-3 max-sm:px-4"><div className="min-w-0"><Link to={`${ROUTES.transactions}?month=&supplier=${encodeURIComponent(supplier.id)}`} aria-label={`Ver transações de ${supplier.name}`} className="group flex min-h-7 items-center gap-2 font-medium hover:text-brand"><span className="[overflow-wrap:anywhere]">{supplier.name}</span><ArrowUpRight size={15} className="shrink-0 text-muted group-hover:text-brand" /></Link><span className="mt-1 block text-xs text-muted sm:hidden">Atualizado em {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}</span></div><span className="numeric text-xs text-muted max-sm:hidden">{new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}</span><div className="flex justify-end gap-1"><Button variant="quiet" className="!size-11 !p-0" title="Editar fornecedor" aria-label={`Editar fornecedor ${supplier.name}`} onClick={() => setForm(supplier)}><Pencil /></Button><Button variant="danger" className="!size-11 !p-0" title="Arquivar fornecedor" aria-label={`Arquivar fornecedor ${supplier.name}`} onClick={() => setArchive(supplier)}><Archive /></Button></div></article>)}</div>
      </>}
      {list.data && !list.isError && !updating && list.data.meta.total > 0 && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 text-xs text-muted"><span>{(page - 1) * 20 + 1}–{Math.min(page * 20, list.data.meta.total)} de {list.data.meta.total} fornecedores</span>{list.data.meta.totalPages > 1 && <div className="flex items-center gap-2"><Button className="!size-11 !p-0" aria-label="Página anterior" disabled={page <= 1} onClick={() => changePage(page - 1)}><ChevronLeft /></Button><span>Página {page} de {list.data.meta.totalPages}</span><Button className="!size-11 !p-0" aria-label="Próxima página" disabled={page >= list.data.meta.totalPages} onClick={() => changePage(page + 1)}><ChevronRight /></Button></div>}</footer>}
    </section>
    <p className="mt-4 text-xs leading-5 text-muted">Selecione o nome de um fornecedor para consultar suas transações.</p>
    {form && <SupplierForm key={form === 'new' ? 'new' : form.id} supplier={form === 'new' ? undefined : form} userId={userId} onClose={() => setForm(null)} onSaved={(saved, created) => { setForm(null); setNotice(created ? `Fornecedor “${saved.name}” adicionado.${search && !saved.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) ? ' Limpe a pesquisa para encontrá-lo.' : ''}` : 'Fornecedor atualizado. As transações vinculadas usam o novo nome.'); }} />}
    {archive && <ArchiveSupplierDialog supplier={archive} userId={userId} onClose={() => setArchive(null)} onArchived={() => { setArchive(null); setNotice('Fornecedor arquivado. As transações existentes foram preservadas.'); }} />}
    <Notice message={notice} onDismiss={() => setNotice('')} />
  </AppLayout>;
}
