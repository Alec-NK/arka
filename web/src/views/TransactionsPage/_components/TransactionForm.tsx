import { useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog } from '../../../components/organism/Dialog';
import { Button } from '../../../components/atom/Button';
import { useCreateTransaction, useUpdateTransaction } from '../../../hooks/transactions';
import type { Transaction, TransactionInput, TransactionType } from '../../../types/transaction';
import { ApiError } from '../../../types/api-error';
import { maskCurrencyInput, normalizeAmount } from '../../../utils/format-money';
import { today } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { SupplierSelector } from './SupplierSelector';
const classes = {
  "form": "px-[26px] pb-[26px] max-[400px]:px-5 max-[400px]:pb-6 [&_fieldset]:grid [&_fieldset]:min-w-0 [&_fieldset]:gap-5 [&_fieldset]:border-0 [&_fieldset]:p-0 [&_label]:block [&_label]:min-w-0 [&_label]:text-[13px] [&_label]:font-medium [&_input]:mt-2 [&_input]:block [&_input]:min-h-[46px] [&_input]:w-full [&_input]:rounded-[5px] [&_input]:border [&_input]:border-[#dce0e6] [&_input]:bg-white [&_input]:px-3 [&_input]:py-[11px] [&_input]:text-sm [&_input]:text-[#273149] [&_select]:mt-2 [&_select]:block [&_select]:min-h-[46px] [&_select]:w-full [&_select]:rounded-[5px] [&_select]:border [&_select]:border-[#dce0e6] [&_select]:bg-white [&_select]:px-3 [&_select]:py-[11px] [&_select]:text-sm [&_select]:text-[#273149] [&_textarea]:mt-2 [&_textarea]:block [&_textarea]:min-h-[98px] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-[5px] [&_textarea]:border [&_textarea]:border-[#dce0e6] [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-[11px] [&_textarea]:text-sm [&_textarea]:text-[#273149] [&_input:disabled]:bg-[#fafafa] [&_select:disabled]:bg-[#fafafa] [&_textarea:disabled]:bg-[#fafafa] [&_input::placeholder]:text-[#7a8190] [&_textarea::placeholder]:text-[#7a8190]",
  "intro": "mb-[26px] text-sm leading-[1.6] text-muted",
  "grid": "grid grid-cols-2 gap-[18px] max-[400px]:grid-cols-1 max-[400px]:gap-5",
  "optional": "font-normal text-muted",
  "footer": "mt-7 flex justify-end gap-3 border-t border-line pt-[22px] max-[400px]:flex-wrap",
  "error": "mt-5 rounded-md bg-[#fdf0f2] p-3.5 text-[13px] leading-[1.7] text-[#9c1530] [&_button]:mt-2",
  "fieldError": "mt-1.5 block text-xs leading-[1.5] text-[#bd1633]"
} as Record<string, string>;
interface Props { transaction?: Transaction; types: TransactionType[]; userId: string; onClose: () => void; onSaved: (transaction: Transaction) => void; onRefresh: () => void }
export function TransactionForm({ transaction, types, userId, onClose, onSaved, onRefresh }: Props) {
 const initial: TransactionInput = { transactionTypeId: transaction?.transactionTypeId || '', supplierId: transaction?.supplierId || null, amount: maskCurrencyInput(transaction?.amount || ''), currency: 'BRL', transactionDate: transaction?.transactionDate || today(), description: transaction?.description || '', reference: transaction?.reference || '', notes: transaction?.notes || '' };
 const selectedType = transaction?.transactionType && !types.some(type => type.id === transaction.transactionType.id) ? transaction.transactionType : null;
 const typeOptions = selectedType ? [selectedType, ...types] : types;
 const [values, setValues] = useState(initial); const [selectedSupplier, setSelectedSupplier] = useState(transaction?.supplier || null); const [amountError, setAmountError] = useState('');
 const create = useCreateTransaction(); const update = useUpdateTransaction(); const mutation = transaction ? update : create;
 const close = () => { if (mutation.isPending) return; onClose() };
 const field = <K extends keyof TransactionInput>(key: K, value: TransactionInput[K]) => { setValues(old => ({ ...old, [key]: value })); mutation.reset(); };
 async function submit(event: FormEvent) {
  event.preventDefault(); const amount = normalizeAmount(values.amount);
  if (!amount) { setAmountError('Informe um valor maior que zero com até duas casas decimais.'); return }
  setAmountError('');
  const input = { ...values, amount, description: values.description.trim(), reference: values.reference?.trim() || null, notes: values.notes?.trim() || null };
  try { const saved = transaction ? await update.mutateAsync({ id: transaction.id, version: transaction.version, input }) : await create.mutateAsync({ input }); onSaved(saved) } catch { /* Error is presented below. */ }
 }
 return <Dialog title={transaction ? 'Editar transação' : 'Adicionar transação'} onClose={close} wide><form className={classes.form} onSubmit={submit}><p className={classes.intro}>{transaction ? 'Atualize os dados da sua transação.' : 'Mantenha sua movimentação financeira atualizada.'}</p><fieldset disabled={mutation.isPending}><div className={classes.grid}><label htmlFor="transaction-type">Tipo<select id="transaction-type" required value={values.transactionTypeId} onChange={e => field('transactionTypeId', e.target.value)}><option value="" disabled>Selecione um tipo</option>{typeOptions.map(type => <option key={type.id} value={type.id} disabled={Boolean(type.deletedAt && type.id !== values.transactionTypeId)}>{transactionTypeLabel(type.code, type.name)}{type.deletedAt ? ' (Excluído)' : ''}</option>)}</select></label><label htmlFor="transaction-amount">Valor (R$)<input id="transaction-amount" autoFocus inputMode="numeric" required value={values.amount} placeholder="0,00" maxLength={25} aria-invalid={!!amountError} aria-describedby={amountError ? 'amount-error' : undefined} onChange={e => { field('amount', maskCurrencyInput(e.target.value)); setAmountError('') }} />{amountError && <span id="amount-error" className={classes.fieldError}>{amountError}</span>}</label></div><label htmlFor="transaction-description">Descrição<input id="transaction-description" required maxLength={255} value={values.description} placeholder="Para que foi esta transação?" onChange={e => field('description', e.target.value)} /></label><SupplierSelector userId={userId} selectedId={values.supplierId} selectedSupplier={selectedSupplier} onChange={supplier => { setSelectedSupplier(supplier); field('supplierId', supplier?.id || null); }} /><div className={classes.grid}><label htmlFor="transaction-date">Data<input id="transaction-date" type="date" required value={values.transactionDate} onChange={e => field('transactionDate', e.target.value)} /></label><label htmlFor="transaction-reference">Referência <span className={classes.optional}>(opcional)</span><input id="transaction-reference" maxLength={120} value={values.reference || ''} placeholder="ex.: NF-1024" onChange={e => field('reference', e.target.value)} /></label></div><label htmlFor="transaction-notes">Observações <span className={classes.optional}>(opcional)</span><textarea id="transaction-notes" maxLength={5000} rows={3} value={values.notes || ''} placeholder="Adicione mais detalhes…" onChange={e => field('notes', e.target.value)} /></label></fieldset>
 {mutation.error && <div className={classes.error} role="alert">{mutation.error.message}{mutation.error instanceof ApiError && mutation.error.status === 409 && <Button onClick={onRefresh}>Recarregar versão mais recente</Button>}</div>}
 <div className={classes.footer}><Button onClick={close} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" variant="primary" disabled={mutation.isPending || !types.length}>{mutation.isPending ? 'Salvando…' : transaction ? 'Salvar alterações' : 'Adicionar transação'}</Button></div>
 </form></Dialog>;
}
