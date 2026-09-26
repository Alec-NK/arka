import { useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { Dialog, DialogCloseButton } from '../../../components/organism/Dialog';
import { Button } from '../../../components/atom/Button';
import { useCreateTransaction, useGetTransaction, useUpdateTransaction } from '../../../hooks/transactions';
import type { Transaction, TransactionInput, TransactionType } from '../../../types/transaction';
import { ApiError } from '../../../types/api-error';
import { maskCurrencyInput, normalizeAmount } from '../../../utils/format-money';
import { today } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { SupplierSelector } from './SupplierSelector';
import { reconcileDraft } from '../_utils/reconcile-draft';
interface Props { transaction?: Transaction; types: TransactionType[]; userId: string; onClose: () => void; onSaved: (transaction: Transaction) => void }
function toValues(transaction?: Transaction): TransactionInput {
  return { transactionTypeId: transaction?.transactionTypeId || '', supplierId: transaction?.supplierId || null, amount: maskCurrencyInput(transaction?.amount || ''), currency: 'BRL', transactionDate: transaction?.transactionDate || today(), description: transaction?.description || '', reference: transaction?.reference || '', notes: transaction?.notes || '' };
}
const labels: Record<keyof TransactionInput, string> = { transactionTypeId: 'Tipo', supplierId: 'Fornecedor', amount: 'Valor', currency: 'Moeda', transactionDate: 'Data', description: 'Descrição', reference: 'Referência', notes: 'Observações' };
export function TransactionForm({ transaction, types, userId, onClose, onSaved }: Props) {
  const [baseline, setBaseline] = useState(() => toValues(transaction));
  const [values, setValues] = useState(baseline);
  const [version, setVersion] = useState(transaction?.version || 0);
  const [selectedSupplier, setSelectedSupplier] = useState(transaction?.supplier || null);
  const [supplierBusy, setSupplierBusy] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [review, setReview] = useState<{ current: Transaction; changed: (keyof TransactionInput)[] } | null>(null);
  const [refreshError, setRefreshError] = useState('');
  const latest = useGetTransaction({ userId, id: transaction?.id || '' });
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const mutation = transaction ? update : create;
  const busy = mutation.isPending || supplierBusy;
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);
  const selectedType = transaction?.transactionType && !types.some(type => type.id === transaction.transactionType.id) ? transaction.transactionType : null;
  const typeOptions = selectedType ? [selectedType, ...types] : types;
  const field = <K extends keyof TransactionInput>(key: K, value: TransactionInput[K]) => { setValues(old => ({ ...old, [key]: value })); if (!(mutation.error instanceof ApiError && mutation.error.status === 409)) mutation.reset(); };
  async function refresh() {
    setRefreshError('');
    const result = await latest.refetch();
    if (!result.data || result.error) { setRefreshError(result.error?.message || 'Não foi possível carregar a versão recente. Seu rascunho foi mantido.'); return; }
    const current = result.data;
    const next = toValues(current);
    const reconciliation = reconcileDraft(baseline, values, next);
    if (values.supplierId === baseline.supplierId) setSelectedSupplier(current.supplier);
    setValues(reconciliation.values); setBaseline(next); setVersion(current.version); setReview({ current, changed: reconciliation.changed }); mutation.reset();
  }
  function currentValue(key: keyof TransactionInput): string {
    if (!review) return '';
    if (key === 'supplierId') return review.current.supplier?.name || 'Sem fornecedor';
    if (key === 'transactionTypeId') return review.current.transactionType.name;
    return String(toValues(review.current)[key] || 'Não informado');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || mutation.error instanceof ApiError && mutation.error.status === 409) return;
    const amount = normalizeAmount(values.amount);
    if (!amount) { setAmountError('Informe um valor maior que zero com até duas casas decimais.'); return; }
    setAmountError('');
    if (!values.description.trim()) return;
    const input = { ...values, amount, description: values.description.trim(), reference: values.reference?.trim() || null, notes: values.notes?.trim() || null };
    try { const saved = transaction ? await update.mutateAsync({ id: transaction.id, version, input }) : await create.mutateAsync({ input }); onSaved(saved); } catch { /* Preserve the draft on failure. */ }
  }
  return <Dialog title={transaction ? 'Editar transação' : 'Nova transação'} onClose={onClose} wide dirty={dirty} busy={busy}><form onSubmit={submit} className="px-6 pb-6">
    <p className="mb-6 text-sm leading-6 text-muted">{transaction ? 'Revise os dados e salve suas alterações.' : 'Registre uma movimentação. O saldo será atualizado ao salvar.'}</p>
    {review && <div role="status" className="mb-5 rounded-xl border border-line bg-canvas p-4 text-sm leading-6"><p className="font-medium">Versão recente carregada. Seu rascunho foi preservado.</p><p className="mt-1 text-muted">Campos que você não editou foram atualizados. Revise antes de salvar.</p>{review.changed.length > 0 && <details className="mt-3"><summary className="font-medium text-brand">Ver {review.changed.length} campo(s) alterado(s) no servidor</summary><dl className="mt-3 grid gap-2">{review.changed.map(key => <div key={key}><dt className="text-xs font-medium text-muted">{labels[key]} — valor no servidor</dt><dd className="break-words whitespace-pre-wrap">{currentValue(key)}</dd></div>)}</dl></details>}</div>}
    <fieldset disabled={mutation.isPending} className="grid min-w-0 gap-5">
      <div className="grid grid-cols-2 gap-4 max-[400px]:grid-cols-1"><label className="field-label" htmlFor="transaction-type">Tipo<select className="field-control" id="transaction-type" required value={values.transactionTypeId} onChange={event => field('transactionTypeId', event.target.value)}><option value="" disabled>Selecione um tipo</option>{typeOptions.map(type => <option key={type.id} value={type.id} disabled={!!type.deletedAt && type.id !== values.transactionTypeId}>{transactionTypeLabel(type.code, type.name)}{type.deletedAt ? ' (Arquivado)' : ''}</option>)}</select></label><label className="field-label" htmlFor="transaction-amount">Valor (R$)<input className="field-control numeric !text-lg !font-semibold" id="transaction-amount" autoFocus inputMode="numeric" required value={values.amount} placeholder="0,00" maxLength={25} aria-invalid={!!amountError} aria-describedby={amountError ? 'amount-error' : undefined} onChange={event => { field('amount', maskCurrencyInput(event.target.value)); setAmountError(''); }} />{amountError && <span id="amount-error" className="text-xs leading-5 text-expense">{amountError}</span>}</label></div>
      <label className="field-label" htmlFor="transaction-description">Descrição<input className="field-control" id="transaction-description" required maxLength={255} value={values.description} placeholder="Para que foi esta transação?" onChange={event => field('description', event.target.value)} /></label>
      <SupplierSelector userId={userId} selectedId={values.supplierId} selectedSupplier={selectedSupplier} onBusyChange={setSupplierBusy} onChange={supplier => { setSelectedSupplier(supplier); field('supplierId', supplier?.id || null); }} />
      <label className="field-label" htmlFor="transaction-date">Data<input className="field-control" id="transaction-date" type="date" required value={values.transactionDate} onChange={event => field('transactionDate', event.target.value)} /></label>
      <details open={!!transaction?.reference || !!transaction?.notes || undefined} className="rounded-xl border border-line p-4"><summary className="flex min-h-6 items-center justify-between gap-3 text-sm font-medium">Mais detalhes <span className="flex items-center gap-2 text-xs font-normal text-muted">Opcional<ChevronDown size={16} /></span></summary><div className="mt-5 grid gap-5"><label className="field-label" htmlFor="transaction-reference">Referência<input className="field-control" id="transaction-reference" maxLength={120} value={values.reference || ''} placeholder="Ex.: NF-1024" onChange={event => field('reference', event.target.value)} /></label><label className="field-label" htmlFor="transaction-notes">Observações<textarea className="field-control min-h-24 resize-y" id="transaction-notes" maxLength={5000} rows={3} value={values.notes || ''} placeholder="Detalhes que ajudam a identificar esta movimentação" onChange={event => field('notes', event.target.value)} /></label></div></details>
    </fieldset>
    {mutation.error && <div className="feedback-error mt-5" role="alert">{mutation.error.message}{mutation.error instanceof ApiError && mutation.error.status === 409 && <div className="mt-3"><p>Carregue a versão recente para revisar. Seus dados digitados serão preservados.</p><Button className="mt-3" disabled={latest.isFetching} onClick={() => void refresh()}><RefreshCw />{latest.isFetching ? 'Carregando…' : 'Carregar versão recente'}</Button></div>}</div>}
    {refreshError && <p role="alert" className="feedback-error mt-3">{refreshError}</p>}
    <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-line pt-5"><DialogCloseButton disabled={busy}>Cancelar</DialogCloseButton><Button type="submit" variant="primary" disabled={busy || !types.length || !values.description.trim() || mutation.error instanceof ApiError && mutation.error.status === 409}>{supplierBusy ? 'Criando fornecedor…' : mutation.isPending ? 'Salvando…' : transaction ? 'Salvar alterações' : 'Adicionar transação'}</Button></div>
  </form></Dialog>;
}
