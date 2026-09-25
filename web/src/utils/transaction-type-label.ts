const labels: Record<string, string> = {
  sale: 'Venda',
  purchase: 'Compra',
  expense: 'Despesa',
};

export function transactionTypeLabel(code: string, fallback: string): string {
  return labels[code] ?? fallback;
}
