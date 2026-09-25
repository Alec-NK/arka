import { useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog } from '../../../components/organism/Dialog';
import { Button } from '../../../components/atom/Button';
import { useCreateSupplier, useUpdateSupplier } from '../../../hooks/suppliers';
import type { Supplier } from '../../../types/supplier';
import { ApiError } from '../../../types/api-error';
const classes = {
  "form": "px-[26px] pb-[26px] max-[400px]:px-5 max-[400px]:pb-6 [&_label]:block [&_label]:text-[13px] [&_label]:font-medium [&_input]:mt-2 [&_input]:block [&_input]:min-h-[46px] [&_input]:w-full [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[#dce0e6] [&_input]:bg-white [&_input]:px-3 [&_input]:py-[11px] [&_input]:text-sm [&_input]:text-[#273149]",
  "intro": "mb-[26px] text-sm leading-[1.6] text-muted",
  "error": "mt-5 rounded-md bg-[#fdf0f2] p-3.5 text-[13px] leading-[1.7] text-[#9c1530] [&_button]:mt-2",
  "footer": "mt-7 flex justify-end gap-3 border-t border-line pt-[22px] max-[400px]:flex-wrap"
} as const;

interface Props { supplier?: Supplier; onClose: () => void; onSaved: (created: boolean) => void; onRefresh: () => void }

export function SupplierForm({ supplier, onClose, onSaved, onRefresh }: Props) {
  const initial = supplier?.name || '';
  const [name, setName] = useState(initial);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const mutation = supplier ? update : create;
  const close = () => { if (mutation.isPending) return; onClose(); };
  const change = (value: string) => { setName(value); mutation.reset(); };
  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    try {
      if (supplier) await update.mutateAsync({ id: supplier.id, version: supplier.version, name: cleanName });
      else await create.mutateAsync({ name: cleanName });
      onSaved(!supplier);
    } catch { return; }
  }
  return <Dialog title={supplier ? 'Editar fornecedor' : 'Adicionar fornecedor'} onClose={close} wide><form className={classes.form} onSubmit={submit}><p className={classes.intro}>{supplier ? 'Renomear este fornecedor atualiza todas as transações vinculadas.' : 'Cadastre um nome para encontrá-lo ao registrar uma transação.'}</p><label htmlFor="supplier-name">Nome<input id="supplier-name" aria-label="Nome" autoFocus required maxLength={255} value={name} onChange={event => change(event.target.value)} /></label>
    {mutation.error && <div className={classes.error} role="alert">{mutation.error.message}{mutation.error instanceof ApiError && mutation.error.status === 409 && <Button onClick={onRefresh}>Recarregar versão mais recente</Button>}</div>}
    <div className={classes.footer}><Button onClick={close} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" variant="primary" disabled={mutation.isPending || !name.trim()}>{mutation.isPending ? 'Salvando…' : supplier ? 'Salvar alterações' : 'Adicionar fornecedor'}</Button></div>
  </form></Dialog>;
}
