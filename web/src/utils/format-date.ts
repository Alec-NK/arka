const dateFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function asDate(value: string): Date { return new Date(`${value}T12:00:00Z`) }
export function formatDate(value: string): string { return dateFormatter.format(asDate(value)) }
export function formatMonthYear(value: string): string { return monthYearFormatter.format(asDate(`${value}-01`)) }
export function today(): string { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
export function currentMonth() { const date = new Date(); const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); return { from: `${year}-${month}-01`, to: `${year}-${month}-${new Date(year, date.getMonth() + 1, 0).getDate()}` } }
export function monthDates(value: string): { from: string; to: string } | null {
 if (!/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value)) return null;
 const [year, month] = value.split('-').map(Number);
 return { from: `${value}-01`, to: `${value}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}` };
}
