import { X, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../../types/transaction';
import { TypeIcon } from './TypeBadge';
import { signedMoney } from '../../../utils/format-money';
import { formatDate } from '../../../utils/format-date';
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
import { Button } from '../../../components/atom/Button';
const classes = {
  "panel": "relative flex min-h-[770px] flex-col rounded-[7px] border border-line px-[37px] pt-[41px] pb-[23px] min-[1440px]:sticky min-[1440px]:top-6 min-[1440px]:max-h-[calc(100dvh-48px)] min-[1440px]:min-h-[min(770px,calc(100dvh-48px))] min-[1440px]:overflow-y-auto",
  "embedded": "min-h-[calc(100dvh-90px)] rounded-none border-0 px-[26px] pt-4 pb-[26px] min-[1440px]:static min-[1440px]:max-h-none min-[1440px]:overflow-visible",
  "close": "absolute top-2.5 right-2 grid h-11 w-11 place-items-center rounded-[5px] border-0 bg-transparent text-[#404b63] hover:bg-[#f7f4f5]",
  "heading": "[&_h2]:mt-3 [&_h2]:mb-[7px] [&_h2]:text-[30px] [&_h2]:leading-[1.2] [&_h2]:font-semibold [&_h2]:tracking-[-0.7px] [&_h2]:[font-variant-numeric:tabular-nums] [&_h2]:[overflow-wrap:anywhere] [&_p]:text-base [&_p]:text-[#46516a]",
  "sale": "text-sale",
  "purchase": "text-expense",
  "expense": "text-expense",
  "fields": "my-8 grid gap-[29px] [&_dt]:mb-[7px] [&_dt]:text-[13px] [&_dt]:font-medium [&_dt]:text-[#20283c] [&_dd]:text-[15px] [&_dd]:leading-[1.6] [&_dd]:text-[#354059] [&_dd]:[overflow-wrap:anywhere]",
  "date": "flex items-center justify-between gap-3 [&_svg]:shrink-0",
  "notes": "whitespace-pre-wrap",
  "actions": "mt-auto grid gap-[7px] border-t border-line pt-6 [&_button:first-child_svg]:text-brand",
  "loading": "m-auto text-center text-sm leading-[1.7] text-muted"
} as Record<string, string>;
interface Props { transaction?: Transaction; loading: boolean; error?: string; onClose: () => void; onRetry: () => void; onEdit: (transaction: Transaction) => void; onDelete: (transaction: Transaction) => void; embedded?: boolean }
export function TransactionDetails({ transaction, loading, error, onClose, onRetry, onEdit, onDelete, embedded }: Props) {
 return <aside className={`${classes.panel} ${embedded ? classes.embedded : ''}`} aria-label="Detalhes da transação">{!embedded && <button className={classes.close} aria-label="Fechar detalhes da transação" onClick={onClose}><X size={21} strokeWidth={1.7} /></button>}
 {loading ? <div className={classes.loading} role="status">Carregando transação…</div> : error ? <div className={classes.loading}><p role="alert">{error}</p><Button onClick={onRetry}>Tentar novamente</Button></div> : transaction && <><div className={classes.heading}><TypeIcon code={transaction.transactionType.code} large /><h2 className={classes[transaction.transactionType.code]}>{signedMoney(transaction.amount, transaction.transactionType.code)}</h2><p>{transactionTypeLabel(transaction.transactionType.code, transaction.transactionType.name)}{transaction.transactionType.deletedAt ? ' (Excluído)' : ''}</p></div><dl className={classes.fields}><div><dt>Descrição</dt><dd>{transaction.description}</dd></div><div><dt>Fornecedor</dt><dd>{transaction.supplier?.name || '—'}{transaction.supplier?.deletedAt ? ' (Excluído)' : ''}</dd></div><div><dt>Data</dt><dd className={classes.date}>{formatDate(transaction.transactionDate)}<CalendarDays size={20} /></dd></div><div><dt>Referência</dt><dd>{transaction.reference || '—'}</dd></div><div><dt>Observações</dt><dd className={classes.notes}>{transaction.notes || '—'}</dd></div></dl><div className={classes.actions}><Button onClick={() => onEdit(transaction)}><Pencil size={18} />Editar transação</Button><Button variant="danger" onClick={() => onDelete(transaction)}><Trash2 size={19} />Excluir transação</Button></div></>}
 </aside>;
}
