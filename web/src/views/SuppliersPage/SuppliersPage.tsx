import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Pencil, Plus, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/atom/Button';
import { AppLayout } from '../_components/AppLayout';
import { useGetSession } from '../../hooks/session';
import { useGetSupplierList } from '../../hooks/suppliers';
import { ROUTES } from '../../routes/constants';
import { SupplierForm } from './_components/SupplierForm';
import type { Supplier } from '../../types/supplier';
const classes = {
  "header": "mb-[25px] flex items-start justify-between gap-6 pr-[18px] max-[700px]:flex-wrap max-[700px]:pr-0 [&_h1]:mt-2.5 [&_h1]:mb-[7px] [&_h1]:text-[36px] [&_h1]:leading-[1.25] [&_h1]:font-semibold [&_h1]:tracking-[-1.1px] [&_h1]:text-[#0d1221] max-[700px]:[&_h1]:text-[32px] max-[360px]:[&_h1]:text-[30px] [&_p]:text-[17px] [&_p]:leading-[1.5] [&_p]:text-[#687087] max-[700px]:[&_p]:text-[15px] max-[360px]:[&_p]:text-sm [&>button]:min-w-[205px] max-[700px]:[&>button]:min-w-0",
  "back": "text-[13px] font-medium text-brand",
  "content": "min-w-0 max-w-[960px] border-t border-line",
  "toolbar": "flex items-center justify-between gap-4 pt-5 pb-3.5 max-[480px]:flex-col max-[480px]:items-stretch max-[480px]:pt-4",
  "search": "relative flex min-w-0 max-w-[480px] flex-1 items-center text-muted max-[480px]:w-full max-[480px]:max-w-none [&>svg]:absolute [&>svg]:left-[15px] [&_input]:min-h-[46px] [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[#dce0e6] [&_input]:bg-[#fdfcfc] [&_input]:py-[11px] [&_input]:pr-[42px] [&_input]:pl-11 [&_input]:text-ink focus-within:[&_input]:border-muted [&_button]:absolute [&_button]:right-[7px] [&_button]:grid [&_button]:h-8 [&_button]:w-8 [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent",
  "count": "whitespace-nowrap text-[13px] text-muted max-[480px]:self-end",
  "list": "overflow-hidden rounded-lg border border-line",
  "row": "flex min-h-[76px] items-center justify-between gap-5 border-b border-line px-[18px] py-3.5 last:border-b-0 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-3 max-[480px]:p-4 [&>div]:grid [&>div]:min-w-0 [&>div]:gap-[5px] [&_strong]:text-[15px] [&_strong]:font-medium [&_strong]:[overflow-wrap:anywhere] [&_span]:text-xs [&_span]:text-muted [&_button]:shrink-0 max-[480px]:[&_button]:self-start",
  "loading": "grid overflow-hidden rounded-lg border border-line [&>div]:flex [&>div]:min-h-[76px] [&>div]:items-center [&>div]:gap-3.5 [&>div]:border-b [&>div]:border-line [&>div]:p-5 [&_span]:h-3.5 [&_span]:w-[32%] [&_span]:rounded [&_span]:bg-[#f1f1f4] [&_span:last-child]:w-[20%]",
  "empty": "flex min-h-[310px] flex-col items-center justify-center rounded-lg border border-dashed border-[#d9dbe2] px-5 py-12 text-center text-muted [&>svg]:text-brand [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-ink [&_p]:mb-5 [&_p]:max-w-[40ch] [&_p]:text-sm [&_p]:leading-[1.7]",
  "error": "my-3 flex flex-wrap items-center gap-3 rounded-md border border-[#efcad2] p-5 text-sm leading-[1.6] text-[#a11831] [&>svg]:shrink-0 [&>span]:min-w-[140px] [&>span]:flex-1",
  "pagination": "mt-[18px] flex items-center justify-between gap-4 text-[13px] text-muted [&>div]:flex [&>div]:gap-2 [&_button]:min-h-10 [&_button]:p-2",
  "notice": "fixed bottom-6 left-1/2 z-20 max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-lg bg-[#23392d] px-[18px] py-3 text-[13px] text-white shadow-layer"
} as const;

export default function SuppliersPage() {
  const session = useGetSession();
  const userId = session.data?.id || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Supplier | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const pageSize = 20;
  const list = useGetSupplierList({ userId, search, page, pageSize });

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const clearSearch = () => { setSearch(''); setPage(1); };
  const error = list.error?.message;
  const suppliers = list.data?.data || [];

  return <AppLayout name={session.data?.name || 'Seu perfil'}>
    <header className={classes.header}>
      <div><Link className={classes.back} to={ROUTES.transactions}>Voltar para transações</Link><h1>Fornecedores</h1><p>Organize os nomes que aparecem junto das suas transações.</p></div>
      <Button variant="primary" onClick={() => setForm('new')}><Plus size={20} />Adicionar fornecedor</Button>
    </header>
    <section className={classes.content} aria-label="Lista de fornecedores">
      <div className={classes.toolbar}><div className={classes.search}><Search size={19} /><label className="sr-only" htmlFor="supplier-search">Pesquisar fornecedores</label><input id="supplier-search" aria-label="Pesquisar fornecedores" placeholder="Pesquisar fornecedores…" maxLength={200} value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} />{search && <button aria-label="Limpar pesquisa" onClick={clearSearch}><X size={16} /></button>}</div><span className={classes.count}>{list.data ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'fornecedor' : 'fornecedores'}` : ''}</span></div>
      {error ? <div className={classes.error} role="alert"><AlertCircle size={19} /><span>Não foi possível carregar os fornecedores. {error}</span><Button onClick={() => void list.refetch()}>Tentar novamente</Button></div> : list.isPending ? <div className={classes.loading} role="status" aria-label="Carregando fornecedores">{Array.from({ length: 5 }, (_, index) => <div key={index}><span /><span /></div>)}</div> : !suppliers.length ? <div className={classes.empty}><Search size={34} strokeWidth={1.3} /><h2>{search ? 'Nenhum fornecedor encontrado' : 'Cadastre seus fornecedores'}</h2><p>{search ? 'Tente outro nome ou limpe a pesquisa.' : 'Os nomes cadastrados poderão ser escolhidos nas suas transações.'}</p>{search && <Button onClick={clearSearch}>Limpar pesquisa</Button>}</div> : <div className={classes.list} role="list">{suppliers.map(supplier => <article className={classes.row} role="listitem" key={supplier.id}><div><strong>{supplier.name}</strong><span>Atualizado em {new Date(supplier.updatedAt).toLocaleDateString('pt-BR')}</span></div><Button aria-label={`Editar fornecedor ${supplier.name}`} onClick={() => setForm(supplier)}><Pencil size={17} />Editar fornecedor</Button></article>)}</div>}
      {list.data && !error && list.data.meta.totalPages > 1 && <footer className={classes.pagination}><span>Página {page} de {list.data.meta.totalPages}</span><div><Button aria-label="Página anterior" disabled={page <= 1 || list.isFetching} onClick={() => setPage(value => value - 1)}><ChevronLeft size={17} /></Button><Button aria-label="Próxima página" disabled={page >= list.data.meta.totalPages || list.isFetching} onClick={() => setPage(value => value + 1)}><ChevronRight size={17} /></Button></div></footer>}
    </section>
    {form && <SupplierForm key={form === 'new' ? 'new' : `${form.id}-${form.version}`} supplier={form === 'new' ? undefined : form} onClose={() => setForm(null)} onSaved={saved => { setForm(null); setNotice(saved ? 'Fornecedor adicionado.' : 'Fornecedor atualizado. As transações vinculadas usam o novo nome.'); void list.refetch(); }} onRefresh={() => { setForm(null); void list.refetch(); }} />}
    <div aria-live="polite" aria-atomic="true" className={notice ? classes.notice : 'sr-only'}>{notice}</div>
  </AppLayout>;
}
