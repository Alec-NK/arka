import { describe, expect, it } from 'vitest';
import { ALL_SELECT_VALUE, dateInputText, fromSelectValue, parseDateInput, parseDateOnly, serializeDateOnly, toSelectValue } from './control-values';

describe('select boundary values', () => {
  it('keeps UI sentinels out of API and URL values', () => {
    expect(toSelectValue('')).toBe(ALL_SELECT_VALUE);
    expect(fromSelectValue(ALL_SELECT_VALUE)).toBe('');
    expect(toSelectValue('', true)).toBe('');
    expect(fromSelectValue(toSelectValue('purchase'))).toBe('purchase');
  });
});
describe('date-only calendar values', () => {
  it.each(['2024-02-29', '2026-09-15', '1000-01-01', '9999-12-31', '2026-12-31'])('round trips %s without a UTC conversion', value => {
    const date = parseDateOnly(value)!;
    expect(date).toBeInstanceOf(Date);
    expect(serializeDateOnly(date)).toBe(value);
    expect(parseDateInput(dateInputText(value))).toBe(value);
    expect(date.getHours()).toBe(12);
  });
  it.each(['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '', '2026-1-2'])('rejects invalid date %s', value => {
    expect(parseDateOnly(value)).toBeUndefined();
  });
  it('requires a complete Brazilian date and rejects rollover', () => {
    expect(parseDateInput('31/02/2026')).toBe('');
    expect(parseDateInput('1/2/2026')).toBe('');
    expect(parseDateInput('15/09/2026')).toBe('2026-09-15');
  });
});
