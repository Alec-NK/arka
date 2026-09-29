import { Alert } from '@/components/ui/alert';
import { Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/guarded-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteTransaction } from '../../../hooks/transactions';
import type { Transaction } from '../../../types/transaction';
import { signedMoney } from '../../../utils/format-money';
const classes = {
  "body": "px-[26px] pb-[26px] [&>p]:mb-5 [&>p]:text-sm [&>p]:leading-[1.7] [&>p]:text-muted",
  "record": "grid gap-2.5 rounded-md bg-[#f9f5f6] p-4 text-sm [overflow-wrap:anywhere] [&_strong]:font-semibold [&_strong]:[font-variant-numeric:tabular-nums]",
  "footer": "mt-[26px] flex flex-wrap justify-end gap-3",
  "error": "mt-4 text-[13px] leading-[1.6] text-[#b5122e] [&_button]:mt-2.5"
} as Record<string, string>;
export function DeleteTransactionDialog({ transaction, onClose, onDeleted, onRefresh }: { transaction: Transaction; onClose: () => void; onDeleted: () => void; onRefresh: () => void }) {
 const mutation = useDeleteTransaction();
 const remove = async () => { try { await mutation.mutateAsync({ id: transaction.id, version: transaction.version }); onDeleted() } catch { /* Error remains visible in the dialog. */ } };
 return <ConfirmationDialog busy={mutation.isPending} title="Excluir transação?" onClose={() => { if(!mutation.isPending) onClose() }}><div className={classes.body}><p>Isso removerá a transação da sua movimentação e atualizará seus totais.</p><div className={classes.record}><span>{transaction.description || 'Sem descrição'}</span><strong>{signedMoney(transaction.amount, transaction.transactionType.code)}</strong></div>{mutation.error && <Alert asChild variant="plain"><div role="alert" className={classes.error}>{mutation.error.message}<Button onClick={onRefresh}>Atualizar transação</Button></div></Alert>}<div className={classes.footer}><Button disabled={mutation.isPending} onClick={onClose}>Cancelar</Button><Button variant="destructive" disabled={mutation.isPending} onClick={() => void remove()}><Trash2 size={18} />{mutation.isPending ? 'Excluindo…' : 'Excluir transação'}</Button></div></div></ConfirmationDialog>;
}
