import { useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog, DialogCloseButton } from '../../../components/organism/Dialog';
import { Button } from '../../../components/atom/Button';
import { useCreateSupplier, useGetSupplier, useUpdateSupplier } from '../../../hooks/suppliers';
import type { Supplier } from '../../../types/supplier';
import { ApiError } from '../../../types/api-error';
interface Props { supplier?: Supplier; userId: string; onClose: () => void; onSaved: (supplier: Supplier, created: boolean) => void }
export function SupplierForm({ supplier, userId, onClose, onSaved }: Props) {
  const [name, setName] = useState(supplier?.name || '');
  const [baseline, setBaseline] = useState(supplier?.name || '');
  const [version, setVersion] = useState(supplier?.version || 0);
  const [review, setReview] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const latest = useGetSupplier({ userId, id: supplier?.id || '' });
  const create = useCreateSupplier(); const update = useUpdateSupplier();
  const mutation = supplier ? update : create;
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409;
  async function refresh() {
    const result = await latest.refetch();
    if (!result.data || result.error) { setRefreshError(result.error?.message || 'Não foi possível carregar a versão recente.'); return; }
    const draft = name;
    setReview(result.data.name); setBaseline(result.data.name); setVersion(result.data.version);
    if (draft === baseline) setName(result.data.name);
    mutation.reset(); setRefreshError('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || mutation.isPending || conflict) return;
    try { const saved = supplier ? await update.mutateAsync({ id: supplier.id, version, name: name.trim() }) : await create.mutateAsync({ name: name.trim() }); onSaved(saved, !supplier); } catch { /* Keep name for retry. */ }
  }
  return <Dialog title={supplier ? 'Editar fornecedor' : 'Novo fornecedor'} onClose={onClose} dirty={name !== baseline} busy={mutation.isPending}><form className="px-6 pb-6" onSubmit={submit}>
    <p className="mb-6 text-sm leading-6 text-muted">{supplier ? 'O novo nome aparecerá em todas as transações vinculadas.' : 'Cadastre um nome para usar nas suas transações.'}</p>
    {review && <p role="status" className="mb-5 rounded-lg bg-canvas p-4 text-sm leading-6">Nome no servidor: <strong>{review}</strong>. Seu rascunho foi mantido. Revise antes de salvar.</p>}
    <label className="field-label" htmlFor="supplier-name">Nome do fornecedor<input className="field-control" id="supplier-name" autoFocus required maxLength={255} value={name} disabled={mutation.isPending} placeholder="Ex.: Distribuidora Alfa" onChange={event => { setName(event.target.value); if (!conflict) mutation.reset(); }} /></label>
    {mutation.error && <div className="feedback-error mt-5" role="alert">{mutation.error.message}{conflict && <div className="mt-3"><p>Carregue o nome mais recente. Seu rascunho será preservado.</p><Button className="mt-3" disabled={latest.isFetching} onClick={() => void refresh()}>{latest.isFetching ? 'Carregando…' : 'Carregar versão recente'}</Button></div>}</div>}
    {refreshError && <p role="alert" className="feedback-error mt-3">{refreshError}</p>}
    <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-line pt-5"><DialogCloseButton disabled={mutation.isPending}>Cancelar</DialogCloseButton><Button type="submit" variant="primary" disabled={mutation.isPending || !name.trim() || conflict}>{mutation.isPending ? 'Salvando…' : supplier ? 'Salvar alterações' : 'Adicionar fornecedor'}</Button></div>
  </form></Dialog>;
}
