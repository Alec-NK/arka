import type { SupplierSummary } from '../../../types/supplier';
import { SupplierPicker } from '../../_components/SupplierPicker';
interface Props { userId: string; selectedId: string | null; selectedSupplier: SupplierSummary | null; onChange: (supplier: SupplierSummary | null) => void; onBusyChange: (busy: boolean) => void }
export function SupplierSelector(props: Props) {
  return <div className="min-w-0"><p className="mb-2 text-[13px] font-medium">Fornecedor <span className="font-normal text-muted">(opcional)</span></p><SupplierPicker {...props} allowCreate label="Fornecedor (opcional)" emptyLabel="Sem fornecedor" /><p className="mt-2 text-xs leading-5 text-muted">Não encontrou? Digite o nome para criar sem sair da transação.</p></div>;
}
