import { X, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../../types/transaction';
import { TypeBadge } from './TypeBadge';
import { signedMoney } from '../../../utils/format-money';
import { formatDate } from '../../../utils/format-date';
import { Button } from '../../../components/atom/Button';
interface Props { transaction?: Transaction; loading: boolean; error?: string; onClose: () => void; onRetry: () => void; onEdit: (transaction: Transaction) => void; onDelete: (transaction: Transaction) => void; embedded?: boolean }
export function TransactionDetails({ transaction, loading, error, onClose, onRetry, onEdit, onDelete, embedded }: Props) {
  return <aside aria-label="Detalhes da transação" className={`reveal min-w-0 bg-white ${embedded ? 'px-6 pb-6' : 'sticky top-8 max-h-[calc(100dvh-64px)] overflow-y-auto rounded-xl border border-line p-6'}`}>
    {!embedded && <div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Detalhes da transação</h2><button type="button" aria-label="Fechar detalhes da transação" onClick={onClose} className="-mr-3 grid size-11 place-items-center rounded-lg text-muted hover:bg-canvas"><X size={18} /></button></div>}
    {loading ? <div role="status" className="grid min-h-64 content-start gap-5 py-6" aria-label="Carregando transação"><span className="h-7 w-2/3 rounded bg-canvas" /><span className="h-4 w-full rounded bg-canvas" /><span className="h-4 w-1/2 rounded bg-canvas" /></div> : error ? <div className="py-8 text-sm leading-6"><p role="alert" className="mb-4 text-expense">{error}</p><Button onClick={onRetry}>Tentar novamente</Button></div> : transaction && <>
      <TypeBadge code={transaction.transactionType.code} name={transaction.transactionType.name} deletedAt={transaction.transactionType.deletedAt} />
      <p className={`numeric mt-4 text-[30px] leading-tight font-semibold tracking-[-0.025em] [overflow-wrap:anywhere] ${transaction.transactionType.code === 'sale' ? 'text-sale' : 'text-expense'}`}>{signedMoney(transaction.amount, transaction.transactionType.code)}</p><h3 className="mt-3 text-sm font-medium leading-6 [overflow-wrap:anywhere]">{transaction.description}</h3>
      <dl className="mt-6 grid gap-5 border-t border-line pt-6 text-sm [&_dt]:mb-1.5 [&_dt]:text-xs [&_dt]:text-muted [&_dd]:leading-6 [&_dd]:[overflow-wrap:anywhere]"><div><dt>Fornecedor</dt><dd>{transaction.supplier?.name || 'Sem fornecedor'}{transaction.supplier?.deletedAt && <span className="ml-2 text-xs text-muted">Arquivado</span>}</dd></div><div><dt>Data</dt><dd className="numeric">{formatDate(transaction.transactionDate)}</dd></div>{transaction.reference && <div><dt>Referência</dt><dd>{transaction.reference}</dd></div>}{transaction.notes && <div><dt>Observações</dt><dd className="whitespace-pre-wrap">{transaction.notes}</dd></div>}</dl>
      <div className="mt-7 grid gap-2 border-t border-line pt-5"><Button onClick={() => onEdit(transaction)}><Pencil />Editar transação</Button><Button variant="danger" onClick={() => onDelete(transaction)}><Trash2 />Excluir transação</Button></div>
    </>}
  </aside>;
}
