import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { TransactionPage } from '../../../types/transaction';
import { formatMoney } from '../../../utils/format-money';
type Summary = TransactionPage['summary'];
export function TransactionSummary({ summary, loading, scope }: { summary?: Summary; loading: boolean; scope: string }) {
  const value = (key: keyof Pick<Summary, 'net' | 'sales' | 'purchases' | 'expenses'>) => loading ? <Skeleton className="block h-7 w-28 max-w-full rounded bg-current opacity-10" /> : summary ? formatMoney(summary[key]) : '—';
  return <section aria-label="Totais das transações filtradas" aria-busy={loading} className="mb-6">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-sm font-medium">Sua movimentação</h2><p className="text-xs leading-5 text-muted">{scope}</p></div>
    <Card asChild><div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] overflow-hidden rounded-xl border border-line bg-white max-[1100px]:grid-cols-2">
      <div className="min-w-0 bg-brand-deep px-6 py-6 text-white max-sm:px-4"><p className="text-xs font-medium text-[#e5cfd7]">Saldo líquido</p><strong className="numeric mt-3 block text-[26px] leading-tight font-semibold tracking-[-0.025em] [overflow-wrap:anywhere] max-sm:text-xl">{value('net')}</strong><p className="mt-3 text-[11px] text-[#e5cfd7]">Vendas − compras − despesas</p></div>
      {([{ key: 'sales', label: 'Vendas', color: 'text-sale', icon: ArrowUpRight }, { key: 'purchases', label: 'Compras', color: 'text-purchase', icon: ArrowDownLeft }, { key: 'expenses', label: 'Despesas', color: 'text-expense', icon: ArrowDownLeft }] as const).map(({ key, label, color, icon: Icon }) => <div key={key} className="min-w-0 border-l border-line px-6 py-6 max-[1100px]:nth-[3]:border-t max-[1100px]:nth-[3]:border-l-0 max-[1100px]:nth-[4]:border-t max-sm:px-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-muted">{label}</p><Icon size={17} className={color} /></div><strong className={`numeric mt-3 block text-xl leading-tight font-semibold tracking-[-0.02em] [overflow-wrap:anywhere] ${color}`}>{value(key)}</strong><p className="mt-3 text-[11px] text-muted">{key === 'sales' ? 'Entradas' : key === 'purchases' ? 'Estoque e revenda' : 'Custos operacionais'}</p></div>)}
    </div></Card>
  </section>;
}
