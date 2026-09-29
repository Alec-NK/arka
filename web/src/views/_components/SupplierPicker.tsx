import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Alert } from '@/components/ui/alert';
import { useCreateSupplier, useGetSupplier, useGetSupplierList } from '../../hooks/suppliers';
import type { SupplierSummary } from '../../types/supplier';
import { useDebouncedValue } from '../_utils/useDebouncedValue';
interface Props {
  userId: string; selectedId: string | null; selectedSupplier?: SupplierSummary | null;
  onChange: (supplier: SupplierSummary | null) => void; allowCreate?: boolean; disabled?: boolean;
  label?: string; emptyLabel?: string; onBusyChange?: (busy: boolean) => void;
}
export function SupplierPicker({ userId, selectedId, selectedSupplier, onChange, allowCreate = false, disabled = false, label = 'Fornecedor', emptyLabel = 'Sem fornecedor', onBusyChange }: Props) {
  const trigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [isOpen, setOpen] = useState(false);
  const open = isOpen && !disabled;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState('__none__');
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
  if (disabled && isOpen) setOpen(false);
  useEffect(() => { onBusyChange?.(create.isPending); }, [create.isPending, onBusyChange]);
  const choose = (supplier: SupplierSummary | null) => {
    if (disabled || create.isPending) return;
    onChange(supplier); setOpen(false); setSearch(''); setPage(1);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const add = async () => {
    if (disabled || !canCreate || create.isPending) return;
    try {
      const supplier = await create.mutateAsync({ name: clean });
      onChange(supplier); setOpen(false); setSearch(''); setPage(1);
      setAnnouncement(`Fornecedor ${supplier.name} criado e selecionado.`);
    } catch { /* Keep the search and draft available for retry. */ }
  };
  const changeOpen = (next: boolean) => {
    if (disabled || create.isPending) return;
    if (next) { setSearch(''); setPage(1); setActive('__none__'); create.reset(); }
    setOpen(next);
  };
  return <div className="min-w-0">
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverAnchor asChild><div className="relative flex items-center">
        <Search size={17} className="pointer-events-none absolute left-3 text-muted" />
        <PopoverTrigger asChild><Button ref={trigger} variant="plain" role="combobox" aria-label={label} aria-expanded={open} disabled={disabled} className="field-control flex items-center !pr-16 !pl-10 text-left disabled:cursor-not-allowed"><span className={`block truncate ${name ? '' : 'text-[#72717c]'}`}>{name || (allowCreate ? 'Pesquisar ou criar fornecedor' : emptyLabel)}</span></Button></PopoverTrigger>
        <div className="absolute right-1 flex">{selectedId && <Button variant="plain" disabled={disabled || create.isPending} onClick={() => choose(null)} aria-label="Limpar fornecedor" className="grid h-11 w-8 place-items-center rounded text-muted hover:text-brand"><X size={15} /></Button>}<Button variant="plain" disabled={disabled || create.isPending} onClick={() => changeOpen(!open)} aria-label={open ? 'Fechar fornecedores' : 'Pesquisar fornecedores'} className="grid h-11 w-8 place-items-center text-muted"><ChevronDown size={16} /></Button></div>
      </div></PopoverAnchor>
      <PopoverContent align="start" sideOffset={8} className="w-[var(--radix-popover-trigger-width)] min-w-[min(280px,calc(100vw-32px))] max-w-[calc(100vw-32px)] border border-line p-1.5"
        onOpenAutoFocus={event => { event.preventDefault(); searchInput.current?.focus(); }}
        onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}
        onEscapeKeyDown={event => { if (create.isPending) event.preventDefault(); }}
        onInteractOutside={event => { if (create.isPending) event.preventDefault(); }}>
        <Command shouldFilter={false} value={active} onValueChange={setActive} label="Buscar opções de fornecedores">
          <CommandInput ref={searchInput} aria-label="Buscar opções de fornecedores" placeholder={allowCreate ? 'Pesquisar ou criar fornecedor' : 'Pesquisar fornecedores'} maxLength={255} readOnly={create.isPending} value={search} onValueChange={value => { setSearch(value); setPage(1); setActive('__none__'); create.reset(); }} />
          <CommandList label={label} aria-busy={waiting || create.isPending}>
            <CommandItem value="__none__" disabled={waiting || query.isError || create.isPending} onSelect={() => choose(null)} className="text-muted">{!selectedId && <Check size={16} />}{emptyLabel}</CommandItem>
            {options.map(supplier => <CommandItem key={supplier.id} value={supplier.id} disabled={create.isPending} onSelect={() => choose(supplier)} className="justify-between break-words"><span className="min-w-0 [overflow-wrap:anywhere]">{supplier.name}</span>{supplier.id === selectedId && <Check size={16} className="shrink-0 text-brand" />}</CommandItem>)}
            {canCreate && <CommandItem value="__create__" disabled={create.isPending} onSelect={() => void add()} className="min-h-12 font-medium text-brand"><Plus size={18} className="shrink-0" /><span className="min-w-0 [overflow-wrap:anywhere]">{create.isPending ? 'Criando fornecedor…' : `Criar “${clean}”`}</span></CommandItem>}
          </CommandList>
          {waiting && <p role="status" className="px-3 py-3 text-xs text-muted">Buscando fornecedores…</p>}
          {!waiting && !query.isError && !options.length && <p className="px-3 py-2 text-xs leading-5 text-muted">{allowCreate ? 'Digite um nome e escolha Criar para cadastrar aqui.' : 'Nenhum fornecedor encontrado.'}</p>}
          {query.isError && <Alert variant="plain" className="px-3 py-2 text-xs text-expense">Não foi possível buscar fornecedores. <Button variant="plain" className="min-h-11 font-medium underline underline-offset-4" onClick={() => void query.refetch()}>Tentar novamente</Button></Alert>}
          {query.data && query.data.meta.totalPages > 1 && !waiting && <div className="mt-1 flex items-center justify-between border-t border-line px-2 pt-1 text-xs text-muted"><Button variant="plain" aria-label="Fornecedores anteriores" disabled={page === 1 || create.isPending} className="grid size-11 place-items-center disabled:opacity-35" onClick={() => { setPage(page - 1); setActive('__none__'); }}><ChevronLeft size={16} /></Button><span>Página {page} de {query.data.meta.totalPages}</span><Button variant="plain" aria-label="Próximos fornecedores" disabled={page === query.data.meta.totalPages || create.isPending} className="grid size-11 place-items-center disabled:opacity-35" onClick={() => { setPage(page + 1); setActive('__none__'); }}><ChevronRight size={16} /></Button></div>}
          {create.error && <Alert className="mt-2">{create.error.message} Tente criar novamente.</Alert>}
        </Command>
      </PopoverContent>
    </Popover>
    <span className="sr-only" role="status">{announcement}</span>
    {!open && current?.deletedAt && <p className="mt-2 text-xs text-muted">Fornecedor arquivado. O vínculo histórico foi preservado.</p>}
  </div>;
}
