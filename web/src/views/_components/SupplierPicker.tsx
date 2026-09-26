import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useCreateSupplier, useGetSupplier, useGetSupplierList } from '../../hooks/suppliers';
import type { SupplierSummary } from '../../types/supplier';
import { useDebouncedValue } from '../_utils/useDebouncedValue';
interface Props {
  userId: string; selectedId: string | null; selectedSupplier?: SupplierSummary | null;
  onChange: (supplier: SupplierSummary | null) => void; allowCreate?: boolean;
  label?: string; emptyLabel?: string; onBusyChange?: (busy: boolean) => void;
}
export function SupplierPicker({ userId, selectedId, selectedSupplier, onChange, allowCreate = false, label = 'Fornecedor', emptyLabel = 'Sem fornecedor', onBusyChange }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const debounced = useDebouncedValue(search);
  const query = useGetSupplierList({ userId: open ? userId : '', search: debounced, page, pageSize: 20 });
  const selected = useGetSupplier({ userId, id: selectedId && selectedSupplier?.id !== selectedId ? selectedId : '' });
  const create = useCreateSupplier();
  const current = selectedSupplier?.id === selectedId ? selectedSupplier : selected.data;
  const name = current?.name || (selectedId ? 'Fornecedor indisponível' : '');
  const waiting = search !== debounced || query.isFetching;
  const options = waiting ? [] : query.data?.data || [];
  const clean = search.trim();
  const canCreate = allowCreate && !!clean && !waiting && !query.isError && !options.some(option => option.name.toLocaleLowerCase('pt-BR') === clean.toLocaleLowerCase('pt-BR'));
  const optionCount = 1 + options.length + (canCreate ? 1 : 0);
  useEffect(() => { onBusyChange?.(create.isPending); }, [create.isPending, onBusyChange]);
  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => { if (!create.isPending && event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('focusin', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('focusin', close); };
  }, [open, create.isPending]);
  const choose = (supplier: SupplierSummary | null) => { onChange(supplier); setOpen(false); setSearch(''); setPage(1); input.current?.focus(); };
  const add = async () => {
    if (!canCreate || create.isPending) return;
    try { const supplier = await create.mutateAsync({ name: clean }); choose(supplier); setAnnouncement(`Fornecedor ${supplier.name} criado e selecionado.`); } catch { /* Keep the query and draft available for retry. */ }
  };
  const activate = (index: number) => { if (index === 0) choose(null); else if (index <= options.length) choose(options[index - 1]); else void add(); };
  return <div ref={root} className="min-w-0">
    <div className="relative flex items-center"><Search size={17} className="pointer-events-none absolute left-3 text-muted" />
      <input ref={input} id={id} role="combobox" aria-label={label} aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list" aria-activedescendant={open && !waiting && !query.isError ? `${id}-option-${Math.min(active, optionCount - 1)}` : undefined} autoComplete="off" maxLength={255} readOnly={create.isPending} className="field-control !pr-16 !pl-10" placeholder={allowCreate ? 'Pesquisar ou criar fornecedor' : emptyLabel} value={open ? search : name} onFocus={() => { setOpen(true); setSearch(''); setPage(1); setActive(0); }} onChange={event => { setSearch(event.target.value); setPage(1); setActive(0); create.reset(); setOpen(true); }} onKeyDown={event => {
        if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); if (!create.isPending) setOpen(false); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive(value => Math.max(0, Math.min(optionCount - 1, value + (event.key === 'ArrowDown' ? 1 : -1)))); }
        if (event.key === 'Enter' && open) { event.preventDefault(); if (!waiting && !create.isPending && !query.isError) activate(Math.min(active, optionCount - 1)); }
      }} />
      <div className="absolute right-1 flex">{selectedId && <button type="button" disabled={create.isPending} onClick={() => choose(null)} aria-label="Limpar fornecedor" className="grid h-11 w-8 place-items-center rounded text-muted hover:text-brand"><X size={15} /></button>}<button type="button" disabled={create.isPending} onClick={() => { if (open) setOpen(false); else input.current?.focus(); }} aria-label={open ? 'Fechar fornecedores' : 'Pesquisar fornecedores'} className="grid h-11 w-8 place-items-center text-muted"><ChevronDown size={16} /></button></div>
    </div>
    {open && <div className="reveal mt-2 rounded-xl border border-line bg-white p-1.5">
      <div id={`${id}-options`} role="listbox" aria-label={label} aria-busy={waiting || create.isPending} className="max-h-52 overflow-y-auto">
        <button type="button" role="option" id={`${id}-option-0`} aria-selected={!selectedId} disabled={create.isPending} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => choose(null)} className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${active === 0 ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-canvas'}`}>{!selectedId && <Check size={16} />}{emptyLabel}</button>
        {options.map((supplier, index) => <button key={supplier.id} type="button" role="option" id={`${id}-option-${index + 1}`} aria-selected={supplier.id === selectedId} disabled={create.isPending} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => choose(supplier)} className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm break-words ${active === index + 1 ? 'bg-brand-soft text-brand' : 'hover:bg-canvas'}`}><span className="min-w-0 [overflow-wrap:anywhere]">{supplier.name}</span>{supplier.id === selectedId && <Check size={16} className="shrink-0 text-brand" />}</button>)}
        {canCreate && <button type="button" role="option" aria-selected={false} id={`${id}-option-${options.length + 1}`} disabled={create.isPending} tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => void add()} className={`flex min-h-12 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-brand ${active === options.length + 1 ? 'bg-brand-soft' : 'hover:bg-brand-soft'}`}><Plus size={18} className="shrink-0" /><span className="min-w-0 [overflow-wrap:anywhere]">{create.isPending ? 'Criando fornecedor…' : `Criar “${clean}”`}</span></button>}
      </div>
      {waiting && <p role="status" className="px-3 py-3 text-xs text-muted">Buscando fornecedores…</p>}
      {!waiting && !query.isError && !options.length && <p className="px-3 py-2 text-xs leading-5 text-muted">{allowCreate ? 'Digite um nome e escolha Criar para cadastrar aqui.' : 'Nenhum fornecedor encontrado.'}</p>}
      {query.isError && <div role="alert" className="px-3 py-2 text-xs text-expense">Não foi possível buscar fornecedores. <button type="button" className="min-h-11 font-medium underline underline-offset-4" onClick={() => void query.refetch()}>Tentar novamente</button></div>}
      {query.data && query.data.meta.totalPages > 1 && !waiting && <div className="mt-1 flex items-center justify-between border-t border-line px-2 pt-1 text-xs text-muted"><button type="button" aria-label="Fornecedores anteriores" disabled={page === 1 || create.isPending} className="grid size-11 place-items-center disabled:opacity-35" onClick={() => { setPage(page - 1); setActive(0); }}><ChevronLeft size={16} /></button><span>Página {page} de {query.data.meta.totalPages}</span><button type="button" aria-label="Próximos fornecedores" disabled={page === query.data.meta.totalPages || create.isPending} className="grid size-11 place-items-center disabled:opacity-35" onClick={() => { setPage(page + 1); setActive(0); }}><ChevronRight size={16} /></button></div>}
      {create.error && <p role="alert" className="feedback-error mt-2">{create.error.message} Tente criar novamente.</p>}
    </div>}
    <span className="sr-only" role="status">{announcement}</span>
    {!open && current?.deletedAt && <p className="mt-2 text-xs text-muted">Fornecedor arquivado. O vínculo histórico foi preservado.</p>}
  </div>;
}
