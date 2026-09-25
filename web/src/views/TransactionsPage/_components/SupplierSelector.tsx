import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/atom/Button';
import { useGetSupplierOptionsList } from '../../../hooks/suppliers';
import { ROUTES } from '../../../routes/constants';
import type { SupplierSummary } from '../../../types/supplier';
const classes = {
  "field": "min-w-0 [&_label]:block [&_label]:text-[13px] [&_label]:font-medium [&_label_span]:font-normal [&_label_span]:text-muted [&_select]:mt-2 [&_select]:block [&_select]:min-h-[46px] [&_select]:w-full [&_select]:rounded-[5px] [&_select]:border [&_select]:border-[#dce0e6] [&_select]:bg-white [&_select]:px-3 [&_select]:py-[11px] [&_select]:text-sm [&_select]:text-[#273149] [&_select:disabled]:bg-[#fafafa] [&_select:disabled]:text-[#7a8190]",
  "manage": "mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand underline underline-offset-[3px]",
  "status": "mt-2 text-xs leading-[1.5] text-muted",
  "error": "mt-2 flex flex-wrap items-center gap-2.5 text-xs leading-[1.5] text-[#a11831] [&_span]:min-w-[150px] [&_span]:flex-1 [&_button]:min-h-9 [&_button]:px-[11px] [&_button]:py-2 [&_button]:text-xs"
} as Record<string, string>;

interface Props { userId: string; selectedId: string | null; selectedSupplier: SupplierSummary | null; onChange: (supplier: SupplierSummary | null) => void }

export function SupplierSelector({ userId, selectedId, selectedSupplier, onChange }: Props) {
  const optionsQuery = useGetSupplierOptionsList({ userId });
  const options = optionsQuery.data || [];
  const selectedOption = selectedId ? options.find(supplier => supplier.id === selectedId) : undefined;
  const fallback = selectedSupplier && selectedSupplier.id === selectedId && !selectedOption ? selectedSupplier : null;
  const selectedSupplierValue = selectedId || '';
  const change = (value: string) => onChange(options.find(supplier => supplier.id === value) || (fallback?.id === value ? fallback : null));

  return <div className={classes.field}>
    <label htmlFor="transaction-supplier">Fornecedor <span>(opcional)</span></label>
    <select id="transaction-supplier" aria-label="Fornecedor (opcional)" aria-busy={optionsQuery.isPending || optionsQuery.isFetching} disabled={optionsQuery.isPending} value={selectedSupplierValue} onChange={event => change(event.target.value)}>
      <option value="">Sem fornecedor</option>
      {fallback && <option value={fallback.id}>{fallback.name}{fallback.deletedAt ? ' (Excluído)' : ''}</option>}
      {options.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
    </select>
    <Link className={classes.manage} to={ROUTES.suppliers} target="_blank" rel="noreferrer" aria-label="Gerenciar fornecedores (abre em nova aba)">Gerenciar fornecedores <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span></Link>
    {optionsQuery.isPending && <p className={classes.status} role="status">Carregando fornecedores…</p>}
    {optionsQuery.isError && <div className={classes.error} role="alert"><span>Não foi possível carregar os fornecedores. {optionsQuery.error.message} A associação atual foi preservada.</span><Button onClick={() => void optionsQuery.refetch()}>Tentar novamente</Button></div>}
    {!optionsQuery.isPending && !optionsQuery.isFetching && !optionsQuery.isError && !options.length && !fallback && <p className={classes.status}>Nenhum fornecedor cadastrado. Use Gerenciar fornecedores para adicionar um.</p>}
  </div>;
}
