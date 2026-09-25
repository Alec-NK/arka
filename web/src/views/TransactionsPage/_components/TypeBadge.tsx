import { TrendingUp, ShoppingBasket, ReceiptText } from 'lucide-react';
const classes = {
  "badge": "inline-flex min-w-0 items-center gap-[13px] text-[13px] text-[#414b61] [&>span:last-child]:[overflow-wrap:anywhere]",
  "icon": "inline-flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-[5px]",
  "sale": "bg-[#e2f6e8] text-sale",
  "purchase": "bg-[#fff0f2] text-[#a62440]",
  "expense": "bg-[#faf0f2] text-[#b32c43]",
  "large": "h-[51px] w-[51px] rounded-full"
} as Record<string, string>;
import { transactionTypeLabel } from '../../../utils/transaction-type-label';
export function TypeIcon({ code, large = false }: { code: string; large?: boolean }) { const Icon = code === 'sale' ? TrendingUp : code === 'purchase' ? ShoppingBasket : ReceiptText; return <span className={`${classes.icon} ${classes[code] || classes.expense} ${large ? classes.large : ''}`}><Icon size={large ? 25 : 17} strokeWidth={1.8} /></span> }
export function TypeBadge({ code, name, deletedAt }: { code: string; name: string; deletedAt?: string | null }) { return <span className={classes.badge}><TypeIcon code={code} /><span>{transactionTypeLabel(code, name)}{deletedAt ? ' (Excluído)' : ''}</span></span> }
