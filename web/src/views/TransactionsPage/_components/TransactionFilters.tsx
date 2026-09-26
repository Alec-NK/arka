import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import type { TransactionFilters as Filters, TransactionType } from '../../../types/transaction';
import { formatMonthYear, monthDates } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { useGetSupplier } from '../../../hooks/suppliers';
import { Button } from '../../../components/atom/Button';
import { SupplierPicker } from '../../_components/SupplierPicker';
interface Props { filters: Filters; types: TransactionType[]; userId: string; onChange: (update: Partial<Filters>) => void }
export function TransactionFilters({ filters, types, userId, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState(filters.search);
  const [committedSearch, setCommittedSearch] = useState(filters.search);
  const range = useRef<HTMLDetailsElement>(null);
  const supplier = useGetSupplier({ userId, id: filters.supplierId });
  if (committedSearch !== filters.search) { setCommittedSearch(filters.search); setSearch(filters.search); }
  useEffect(() => { if (search === filters.search) return; const timer = setTimeout(() => onChange({ search }), 300); return () => clearTimeout(timer); }, [search, filters.search, onChange]);
  useEffect(() => {
    const close = (event: Event) => { if (range.current?.open && event.target instanceof Node && !range.current.contains(event.target)) range.current.open = false; };
    document.addEventListener('pointerdown', close); document.addEventListener('focusin', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('focusin', close); };
  }, []);
  const month = filters.dateFrom.slice(0, 7);
  const type = types.find(item => item.id === filters.transactionTypeId);
  const extraCount = Number(!!filters.transactionTypeId) + Number(!!filters.supplierId);
  const chips = [
    ...(month ? [{ label: formatMonthYear(month), clear: () => onChange({ dateFrom: '', dateTo: '' }) }] : []),
    ...(filters.transactionTypeId ? [{ label: type ? transactionTypeLabel(type.code, type.name) : 'Tipo indisponível', clear: () => onChange({ transactionTypeId: '' }) }] : []),
    ...(filters.supplierId ? [{ label: supplier.data?.name || 'Fornecedor selecionado', clear: () => onChange({ supplierId: '' }) }] : []),
    ...(filters.search ? [{ label: `Busca: ${filters.search}`, clear: () => { setSearch(''); onChange({ search: '' }); } }] : []),
  ];
  return <div className="border-b border-line p-4 sm:p-5">
    <div className="flex flex-wrap items-start gap-3"><div className="relative min-w-[190px] flex-1 max-sm:w-full max-sm:flex-auto"><Search size={18} className="pointer-events-none absolute top-3.5 left-3.5 text-muted" /><input className="field-control !pr-11 !pl-11" aria-label="Pesquisar transações" placeholder="Buscar descrição ou referência…" maxLength={200} value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" className="absolute top-0 right-0 grid size-11 place-items-center text-muted" aria-label="Limpar pesquisa" onClick={() => { setSearch(''); onChange({ search: '' }); }}><X size={16} /></button>}</div>
      <details ref={range} className="relative max-sm:flex-1" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary')?.focus(); } }}><summary className="flex min-h-[46px] list-none items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium [&::-webkit-details-marker]:hidden"><CalendarDays size={17} className="text-brand" /><span>{month ? formatMonthYear(month) : 'Todas as datas'}</span><ChevronDown size={15} className="ml-auto text-muted" /></summary><form className="absolute top-[calc(100%+8px)] right-0 z-10 w-[min(300px,calc(100vw-40px))] space-y-4 rounded-xl bg-white p-5 shadow-layer max-sm:right-auto max-sm:left-0" onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get('month'); const dates = typeof value === 'string' ? monthDates(value) : null; if (!dates) return; onChange({ dateFrom: dates.from, dateTo: dates.to }); if (range.current) range.current.open = false; }}><label className="field-label">Mês e ano<input className="field-control" key={month} name="month" type="month" min="1000-01" max="9999-12" required defaultValue={month} /></label><div className="flex justify-between gap-2"><Button onClick={() => { onChange({ dateFrom: '', dateTo: '' }); if (range.current) range.current.open = false; }}>Todas as datas</Button><Button variant="primary" type="submit">Aplicar</Button></div></form></details>
      <Button aria-expanded={expanded} aria-controls="transaction-extra-filters" onClick={() => setExpanded(value => !value)} className={expanded ? '!border-brand !bg-brand-soft !text-brand' : ''}><SlidersHorizontal />Filtros{extraCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-[11px] text-white">{extraCount}</span>}</Button>
    </div>
    {expanded && <div id="transaction-extra-filters" className="reveal mt-4 grid grid-cols-2 items-start gap-4 border-t border-line pt-4 max-sm:grid-cols-1"><label className="field-label">Tipo de transação<select className="field-control" value={filters.transactionTypeId} onChange={event => onChange({ transactionTypeId: event.target.value })}><option value="">Todos os tipos</option>{types.map(item => <option key={item.id} value={item.id}>{transactionTypeLabel(item.code, item.name)}{item.deletedAt ? ' (Arquivado)' : ''}</option>)}</select></label><div><p className="mb-2 text-[13px] font-medium">Fornecedor</p><SupplierPicker userId={userId} selectedId={filters.supplierId || null} onChange={item => onChange({ supplierId: item?.id || '' })} emptyLabel="Todos os fornecedores" label="Filtrar por fornecedor" /></div></div>}
    {chips.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">{chips.map(chip => <button key={chip.label} type="button" onClick={chip.clear} aria-label={`Remover filtro ${chip.label}`} className="flex min-h-9 max-w-full items-center gap-2 rounded-md bg-canvas px-3 py-1.5 text-xs text-muted hover:bg-brand-soft hover:text-brand"><span className="truncate">{chip.label}</span><X size={13} className="shrink-0" /></button>)}<button type="button" onClick={() => { setSearch(''); onChange({ dateFrom: '', dateTo: '', transactionTypeId: '', supplierId: '', search: '' }); }} className="min-h-11 px-2 text-xs font-medium text-brand underline-offset-4 hover:underline">Limpar filtros</button></div>}
  </div>;
}
