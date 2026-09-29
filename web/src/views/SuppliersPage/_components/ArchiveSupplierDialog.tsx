import { Alert } from '@/components/ui/alert';
import { useState } from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/guarded-dialog';
import { useDeleteSupplier, useGetSupplier } from '../../../hooks/suppliers';
import type { Supplier } from '../../../types/supplier';
import { ApiError } from '../../../types/api-error';
export function ArchiveSupplierDialog({ supplier, userId, onClose, onArchived }: { supplier: Supplier; userId: string; onClose: () => void; onArchived: () => void }) {
  const [record, setRecord] = useState(supplier);
  const [error, setError] = useState('');
  const mutation = useDeleteSupplier();
  const latest = useGetSupplier({ userId, id: supplier.id });
  async function archive() { try { await mutation.mutateAsync({ id: record.id, version: record.version }); onArchived(); } catch { /* Show server message. */ } }
  async function refresh() { const result = await latest.refetch(); if (result.data && !result.error) { setRecord(result.data); mutation.reset(); setError(''); } else setError(result.error?.message || 'Não foi possível atualizar o fornecedor.'); }
  const conflict = mutation.error instanceof ApiError && mutation.error.status === 409;
  return <ConfirmationDialog title="Arquivar fornecedor?" onClose={onClose} busy={mutation.isPending}><div className="px-6 pb-6"><p className="text-sm leading-6 text-muted"><strong className="text-ink">{record.name}</strong> deixará de aparecer nas opções de novas transações. As transações existentes manterão o nome e o vínculo histórico.</p><p className="mt-3 text-xs leading-5 text-muted">O arquivamento não pode ser desfeito por esta tela.</p>{mutation.error && <Alert asChild variant="plain"><div role="alert" className="feedback-error mt-5">{mutation.error.message}{conflict && <Button className="mt-3" disabled={latest.isFetching} onClick={() => void refresh()}>Revisar fornecedor atualizado</Button>}</div></Alert>}{error && <Alert asChild variant="plain"><p role="alert" className="feedback-error mt-3">{error}</p></Alert>}<div className="mt-6 flex flex-wrap justify-end gap-3"><Button disabled={mutation.isPending} onClick={onClose}>Cancelar</Button><Button variant="destructive" disabled={mutation.isPending || conflict} onClick={() => void archive()}><Archive />{mutation.isPending ? 'Arquivando…' : 'Arquivar fornecedor'}</Button></div></div></ConfirmationDialog>;
}
