import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FieldSelect } from '@/components/field-select';
import { formatMonthYear, monthDates } from '@/utils/format-date';

const months = Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1).padStart(2, '0'), label: new Date(2026, index, 1).toLocaleDateString('pt-BR', { month: 'long' }) }));
export function MonthPicker({ value, onChange }: { value: string; onChange: (value: { dateFrom: string; dateTo: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value.slice(5) || String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(value.slice(0, 4) || String(new Date().getFullYear()));
  const clear = () => { onChange({ dateFrom: '', dateTo: '' }); setOpen(false); };
  return <Popover open={open} onOpenChange={next => { if (next) { setMonth(value.slice(5) || String(new Date().getMonth() + 1).padStart(2, '0')); setYear(value.slice(0, 4) || String(new Date().getFullYear())); } setOpen(next); }}>
    <PopoverTrigger asChild><Button variant="plain" className="flex min-h-[46px] items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium max-sm:flex-1"><CalendarDays size={17} className="text-brand" /><span>{value ? formatMonthYear(value) : 'Todas as datas'}</span><ChevronDown size={15} className="ml-auto text-muted" /></Button></PopoverTrigger>
    <PopoverContent align="end" collisionPadding={20} className="w-[min(300px,calc(100vw-40px))]">
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); const dates = monthDates(`${year}-${month}`); if (dates) { onChange({ dateFrom: dates.from, dateTo: dates.to }); setOpen(false); } }}>
        <div className="grid grid-cols-[1fr_92px] gap-3"><div className="field-label"><Label htmlFor="filter-month">Mês</Label><FieldSelect id="filter-month" value={month} onValueChange={setMonth} options={months} /></div><Label className="field-label" htmlFor="filter-year">Ano<Input id="filter-year" type="number" min={1000} max={9999} required value={year} onChange={event => setYear(event.target.value)} /></Label></div>
        <div className="flex justify-between gap-2"><Button onClick={clear}>Todas as datas</Button><Button variant="primary" type="submit">Aplicar</Button></div>
      </form>
    </PopoverContent>
  </Popover>;
}
