/** UI-only value: never send this sentinel to the API or the URL. */
export const ALL_SELECT_VALUE = '__arka_all__';
export function toSelectValue(value: string, required = false): string { return value || (required ? '' : ALL_SELECT_VALUE); }
export function fromSelectValue(value: string): string { return value === ALL_SELECT_VALUE ? '' : value; }

export function parseDateOnly(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}
export function serializeDateOnly(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dateInputText(value: string): string {
  return parseDateOnly(value) ? value.split('-').reverse().join('/') : '';
}
export function parseDateInput(value: string): string {
  const iso = value.split('/').reverse().join('-');
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value) && parseDateOnly(iso) ? iso : '';
}
