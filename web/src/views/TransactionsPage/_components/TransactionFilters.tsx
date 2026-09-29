import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FieldSelect } from '@/components/field-select';
import { MonthPicker } from './MonthPicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { TransactionFilters as Filters, TransactionType } from '../../../types/transaction';
import { formatMonthYear } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { useGetSupplier } from '../../../hooks/suppliers';
import { Button } from '@/components/ui/button';
import { SupplierPicker } from '../../_components/SupplierPicker';
interface Props { filters: Filters; types: TransactionType[]; userId: string; onChange: (update: Partial<Filters>) => void }
export function TransactionFilters({ filters, types, userId, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState(filters.search);
  const [committedSearch, setCommittedSearch] = useState(filters.search);
  const supplier = useGetSupplier({ userId, id: filters.supplierId });
  if (committedSearch !== filters.search) { setCommittedSearch(filters.search); setSearch(filters.search); }
  useEffect(() => { if (search === filters.search) return; const timer = setTimeout(() => onChange({ search }), 300); return () => clearTimeout(timer); }, [search, filters.search, onChange]);
  const month = filters.dateFrom.slice(0, 7);
  const type = types.find(item => item.id === filters.transactionTypeId);
  const extraCount = Number(!!filters.transactionTypeId) + Number(!!filters.supplierId);
  const chips = [
    ...(month ? [{ label: formatMonthYear(month), clear: () => onChange({ dateFrom: '', dateTo: '' }) }] : []),
    ...(filters.transactionTypeId ? [{ label: type ? transactionTypeLabel(type.code, type.name) : 'Tipo indisponível', clear: () => onChange({ transactionTypeId: '' }) }] : []),
    ...(filters.supplierId ? [{ label: supplier.data?.name || 'Fornecedor selecionado', clear: () => onChange({ supplierId: '' }) }] : []),
    ...(filters.search ? [{ label: `Busca: ${filters.search}`, clear: () => { setSearch(''); onChange({ search: '' }); } }] : []),
  ];
  return <Collapsible open={expanded} onOpenChange={setExpanded} asChild><div className="border-b border-line p-4 sm:p-5">
    <div className="flex flex-wrap items-start gap-3"><div className="relative min-w-[190px] flex-1 max-sm:w-full max-sm:flex-auto"><Search size={18} className="pointer-events-none absolute top-3.5 left-3.5 text-muted" /><Input className="field-control !pr-11 !pl-11" aria-label="Pesquisar transações" placeholder="Buscar descrição ou referência…" maxLength={200} value={search} onChange={event => setSearch(event.target.value)} />{search && <Button variant="plain" type="button" className="absolute top-0 right-0 grid size-11 place-items-center text-muted" aria-label="Limpar pesquisa" onClick={() => { setSearch(''); onChange({ search: '' }); }}><X size={16} /></Button>}</div>
      <MonthPicker value={month} onChange={onChange} />
      <CollapsibleTrigger asChild><Button className={expanded ? '!border-brand !bg-brand-soft !text-brand' : ''}><SlidersHorizontal />Filtros{extraCount > 0 && <Badge variant="count">{extraCount}</Badge>}</Button></CollapsibleTrigger>
    </div>
    <CollapsibleContent id="transaction-extra-filters" className="reveal mt-4 grid grid-cols-2 items-start gap-4 border-t border-line pt-4 max-sm:grid-cols-1"><Label className="field-label">Tipo de transação<FieldSelect aria-label="Tipo de transação" value={filters.transactionTypeId} onValueChange={value => onChange({ transactionTypeId: value })} options={[{ value: '', label: 'Todos os tipos' }, ...types.map(item => ({ value: item.id, label: `${transactionTypeLabel(item.code, item.name)}${item.deletedAt ? ' (Arquivado)' : ''}` }))]} /></Label><div><p className="mb-2 text-[13px] font-medium">Fornecedor</p><SupplierPicker userId={userId} selectedId={filters.supplierId || null} onChange={item => onChange({ supplierId: item?.id || '' })} emptyLabel="Todos os fornecedores" label="Filtrar por fornecedor" /></div></CollapsibleContent>
    {chips.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">{chips.map(chip => <Badge key={chip.label} variant="filter" asChild><Button variant="plain" type="button" onClick={chip.clear} aria-label={`Remover filtro ${chip.label}`} className="flex min-h-9 max-w-full items-center gap-2 rounded-md bg-canvas px-3 py-1.5 text-xs text-muted hover:bg-brand-soft hover:text-brand"><span className="truncate">{chip.label}</span><X size={13} className="shrink-0" /></Button></Badge>)}<Button variant="plain" type="button" onClick={() => { setSearch(''); onChange({ dateFrom: '', dateTo: '', transactionTypeId: '', supplierId: '', search: '' }); }} className="min-h-11 px-2 text-xs font-medium text-brand underline-offset-4 hover:underline">Limpar filtros</Button></div>}
  </div></Collapsible>;
}
