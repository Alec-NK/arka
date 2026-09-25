import { describe, it, expect } from 'vitest';
import { formatMoney, maskCurrencyInput, normalizeAmount, signedMoney } from './format-money';
import { readFilters } from '../views/TransactionsPage/_utils/transaction-search-params';
describe('money and date boundaries', () => {
 it('formats large decimals without converting through a floating point number', () => { expect(formatMoney('99999999999999999.99')).toBe('R$ 99.999.999.999.999.999,99'); expect(formatMoney('-85.60')).toBe('−R$ 85,60'); });
 it('masks currency input as Brazilian reais while keeping two decimal places', () => { expect(maskCurrencyInput('1')).toBe('0,01'); expect(maskCurrencyInput('123456')).toBe('1.234,56'); expect(maskCurrencyInput('5200.00')).toBe('5.200,00'); expect(maskCurrencyInput('')).toBe(''); expect(normalizeAmount('5.200,00')).toBe('5200.00'); });
 it('normalizes entered amounts and rejects rounding or non-positive input', () => { expect(normalizeAmount('12.3')).toBe('12.30'); expect(normalizeAmount('12,3')).toBe('12.30'); expect(normalizeAmount('0.01')).toBe('0.01'); for (const value of ['0','0.00','-1','1.001','1e3','NaN']) expect(normalizeAmount(value)).toBeNull(); });
 it('shows sales as positive and purchases and expenses as negative', () => { expect(signedMoney('1500.00','sale')).toBe('+ R$ 1.500,00'); expect(signedMoney('35.00','purchase')).toBe('− R$ 35,00'); expect(signedMoney('1.00','expense')).toBe('− R$ 1,00'); });
 it('normalizes invalid URL page and date values', () => { const result = readFilters(new URLSearchParams('page=-4&from=2025-02-30&sort=invalid')); expect(result.page).toBe(1); expect(result.dateFrom).not.toBe('2025-02-30'); expect(result.sortOrder).toBe('desc'); });
});
