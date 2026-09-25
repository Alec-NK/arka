import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, Search, X } from 'lucide-react';
import type { TransactionFilters as Filters, TransactionType } from '../../../types/transaction';
import type { SupplierSummary } from '../../../types/supplier';
import { formatMonthYear, monthDates } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { Button } from '../../../components/atom/Button';
const classes = {
  "filters": "grid grid-cols-[minmax(150px,0.8fr)_minmax(140px,0.75fr)_minmax(150px,0.9fr)_minmax(180px,1.4fr)] items-start gap-3.5 max-[850px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] max-[480px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] max-[480px]:gap-2.5",
  "range": "relative min-w-0 [&_summary]:flex [&_summary]:min-h-[46px] [&_summary]:cursor-pointer [&_summary]:list-none [&_summary]:items-center [&_summary]:gap-3.5 [&_summary]:rounded-md [&_summary]:border [&_summary]:border-line [&_summary]:px-[15px] [&_summary]:py-2.5 [&_summary]:text-[13px] [&_summary]:font-medium [&_summary]:text-[#20273a] [&_summary::-webkit-details-marker]:hidden max-[480px]:[&_summary]:gap-[7px] max-[480px]:[&_summary]:p-2.5 max-[480px]:[&_summary]:text-[11px] [&_summary_svg:first-child]:shrink-0 [&_summary_svg:first-child]:text-brand max-[480px]:[&_summary_svg:first-child]:w-4 [&_summary_svg:last-child]:ml-auto [&_summary_svg:last-child]:shrink-0",
  "datePanel": "absolute top-[calc(100%+8px)] left-0 z-5 grid w-[min(320px,calc(100vw-36px))] gap-4 rounded-lg bg-white p-5 shadow-layer [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[13px] [&_label]:font-medium [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:p-[9px] [&>div]:flex [&>div]:justify-between [&>div]:gap-2.5",
  "select": "relative min-w-0 [&_select]:min-h-[46px] [&_select]:w-full [&_select]:appearance-none [&_select]:cursor-pointer [&_select]:truncate [&_select]:rounded-md [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:py-[11px] [&_select]:pr-10 [&_select]:pl-4 [&_select]:text-[13px] [&_select]:font-medium [&_select]:text-[#20273a] [&_select:disabled]:cursor-wait [&_select:disabled]:text-muted max-[480px]:[&_select]:pl-3 max-[480px]:[&_select]:text-xs [&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-[15px] [&>svg]:right-4 [&>svg]:text-[#344159]",
  "supplier": "max-[850px]:col-span-2",
  "search": "col-span-1 flex min-h-[46px] items-center gap-[13px] rounded-md border border-line bg-[#fcfcfd] px-[15px] text-[#606b82] focus-within:border-muted max-[850px]:col-span-2 max-[480px]:order-first [&>svg]:shrink-0 [&_input]:h-11 [&_input]:w-full [&_input]:min-w-0 [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-sm [&_input]:text-[#20273a] [&_input]:placeholder:text-[#71788a] [&_button]:grid [&_button]:h-11 [&_button]:w-8 [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent"
} as Record<string, string>;
interface Props { filters: Filters; types: TransactionType[]; suppliers: SupplierSummary[]; suppliersLoading: boolean; onChange: (update: Partial<Filters>) => void }
export function TransactionFilters({ filters, types, suppliers, suppliersLoading, onChange }: Props) {
 const selectedMonth = filters.dateFrom.slice(0, 7);
 const [search, setSearch] = useState(filters.search); const [committedSearch, setCommittedSearch] = useState(filters.search); const range = useRef<HTMLDetailsElement>(null);
 if (committedSearch !== filters.search) { setCommittedSearch(filters.search); setSearch(filters.search) }
 useEffect(() => { if (search === filters.search) return; const timer = setTimeout(() => onChange({ search }), 300); return () => clearTimeout(timer) }, [search, filters.search, onChange]);
 useEffect(() => {
  const closeOnOutside = (event: Event) => {
   const dropdown = range.current;
   if (dropdown?.open && event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
  };
  document.addEventListener('pointerdown', closeOnOutside);
  document.addEventListener('focusin', closeOnOutside);
  return () => { document.removeEventListener('pointerdown', closeOnOutside); document.removeEventListener('focusin', closeOnOutside) };
 }, []);
 const rangeLabel = selectedMonth ? formatMonthYear(selectedMonth) : 'Todas as datas';
 const selectedSupplier = suppliers.some(supplier => supplier.id === filters.supplierId);
 return <div className={classes.filters}><details ref={range} className={classes.range} onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus() } }}><summary><CalendarDays size={19} /><span>{rangeLabel}</span><ChevronDown size={16} /></summary><form className={classes.datePanel} onSubmit={e => { e.preventDefault(); const value = new FormData(e.currentTarget).get('month'); const dates = typeof value === 'string' ? monthDates(value) : null; if (!dates) return; onChange({ dateFrom: dates.from, dateTo: dates.to }); if(range.current) range.current.open = false }}><label>Mês e ano<input key={selectedMonth} name="month" type="month" min="1000-01" max="9999-12" required defaultValue={selectedMonth} /></label><div><Button onClick={() => { onChange({ dateFrom: '', dateTo: '' }); if(range.current) range.current.open = false }}>Todas as datas</Button><Button variant="primary" type="submit">Aplicar</Button></div></form></details>
 <div className={classes.select}><select aria-label="Filtrar por tipo de transação" value={filters.transactionTypeId} onChange={e => onChange({ transactionTypeId: e.target.value })}><option value="">Todos os tipos</option>{types.map(type => <option key={type.id} value={type.id}>{transactionTypeLabel(type.code, type.name)}{type.deletedAt ? ' (Excluído)' : ''}</option>)}</select><ChevronDown size={16} /></div>
 <div className={`${classes.select} ${classes.supplier}`}><select aria-label="Filtrar por fornecedor" aria-busy={suppliersLoading} disabled={suppliersLoading} value={filters.supplierId} onChange={e => onChange({ supplierId: e.target.value })}><option value="">Todos os fornecedores</option>{filters.supplierId && !selectedSupplier && <option value={filters.supplierId}>Fornecedor indisponível</option>}{suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select><ChevronDown size={16} /></div>
 <div className={classes.search}><Search size={19} /><input aria-label="Pesquisar transações" placeholder="Pesquisar transações…" maxLength={200} value={search} onChange={e => setSearch(e.target.value)} />{search && <button aria-label="Limpar pesquisa" onClick={() => { setSearch(''); onChange({ search: '' }) }}><X size={16} /></button>}</div></div>;
}
