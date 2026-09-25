export function formatMoney(value: string): string {
 const negative = value.startsWith('-');
 const [whole, fraction = '00'] = value.replace(/^-/, '').replace(',', '.').split('.');
 return `${negative ? '−' : ''}R$ ${BigInt(whole || '0').toLocaleString('pt-BR')},${fraction.padEnd(2, '0')}`;
}
export function signedMoney(value: string, code: string): string { return `${code === 'sale' ? '+ ' : code === 'purchase' || code === 'expense' ? '− ' : ''}${formatMoney(value)}` }

export function maskCurrencyInput(value: string): string {
 const digits = value.replace(/\D/g, '').slice(0, 19);
 if (!digits) return '';
 const padded = digits.padStart(3, '0');
 const whole = padded.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
 return `${BigInt(whole).toLocaleString('pt-BR')},${padded.slice(-2)}`;
}

export function normalizeAmount(value: string): string | null {
 const entered = value.trim().replace(/^R\$\s?/, '').replace(/\s/g, '');
 const normalized = entered.includes(',') ? entered.replace(/\./g, '').replace(',', '.') : entered.replace(',', '.');
 if (!/^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/.test(normalized)) return null;
 const [whole, fraction = ''] = normalized.split('.');
 const result = `${whole}.${fraction.padEnd(2, '0')}`;
 return BigInt(result.replace('.', '')) > 0n ? result : null;
}
