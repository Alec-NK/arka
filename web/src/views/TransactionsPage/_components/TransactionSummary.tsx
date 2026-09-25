import { ArrowUp, ShoppingBasket, ReceiptText, Equal } from 'lucide-react';
import type { TransactionPage } from '../../../types/transaction';
import { formatMoney } from '../../../utils/format-money';
const classes = {
  "summary": "my-6 grid grid-cols-4 gap-4 mb-[26px] @max-[900px]:grid-cols-2 @max-[900px]:gap-3 @max-[480px]:my-5 @max-[320px]:grid-cols-1",
  "card": "flex min-h-[102px] min-w-0 items-center justify-between gap-2 rounded-[7px] border border-line px-5 py-[19px] @max-[900px]:px-4 @max-[900px]:py-[18px] @max-[480px]:min-h-[88px] @max-[480px]:px-3 @max-[480px]:py-3.5 @max-[320px]:min-h-0 @max-[320px]:[&>div]:flex @max-[320px]:[&>div]:w-full @max-[320px]:[&>div]:items-center @max-[320px]:[&>div]:justify-between @max-[320px]:[&>div]:gap-2.5 [&_p]:mb-2 [&_p]:text-[13px] [&_p]:leading-5 [&_p]:text-[#414b61] @max-[480px]:[&_p]:mb-[7px] @max-[480px]:[&_p]:text-xs @max-[320px]:[&_p]:mb-0 [&_strong]:block [&_strong]:text-[clamp(18px,1.5vw,25px)] [&_strong]:leading-[1.25] [&_strong]:font-semibold [&_strong]:tracking-[-0.6px] [&_strong]:[font-variant-numeric:tabular-nums] [&_strong]:[overflow-wrap:anywhere] @max-[900px]:[&_strong]:text-[clamp(18px,2.4vw,24px)] @max-[480px]:[&_strong]:text-[17px] @max-[320px]:[&_strong]:text-right @max-[320px]:[&_strong]:text-[19px]",
  "symbol": "grid h-[39px] w-[39px] shrink-0 place-items-center rounded-full @max-[480px]:hidden",
  "sales": "[&_strong]:text-sale [&_.summary-symbol]:text-sale [&_.summary-symbol]:bg-[#e7f7eb]",
  "purchases": "[&_strong]:text-expense [&_.summary-symbol]:text-expense [&_.summary-symbol]:bg-[#fcedf0]",
  "expenses": "[&_strong]:text-expense [&_.summary-symbol]:text-expense [&_.summary-symbol]:bg-[#fcedf0]",
  "net": "[&_.summary-symbol]:bg-[#f5f5f7] [&_.summary-symbol]:text-[#4a546c]",
  "skeleton": "block h-7 w-[110px] max-w-full rounded bg-[#f1f1f4]"
} as Record<string, string>;

type Summary = TransactionPage['summary'];

const cards = [
  { label: 'Vendas', key: 'sales', icon: ArrowUp },
  { label: 'Compras', key: 'purchases', icon: ShoppingBasket },
  { label: 'Despesas', key: 'expenses', icon: ReceiptText },
  { label: 'Saldo líquido', key: 'net', icon: Equal },
] as const;

export function TransactionSummary({ summary, loading }: { summary?: Summary; loading: boolean }) {
  return (
    <section className={classes.summary} aria-label="Totais das transações" aria-busy={loading}>
      {cards.map(({ label, key, icon: Icon }) => (
        <div className={`${classes.card} ${classes[key]}`} key={key}>
          <div>
            <p>{label}</p>
            <strong>{loading ? <span className={classes.skeleton} /> : summary ? formatMoney(summary[key]) : '—'}</strong>
          </div>
          <span className={`${classes.symbol} summary-symbol`}><Icon size={22} strokeWidth={1.8} /></span>
        </div>
      ))}
    </section>
  );
}
