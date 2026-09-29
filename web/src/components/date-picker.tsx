import { useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { ptBR } from 'react-day-picker/locale';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { dateInputText, parseDateInput, parseDateOnly, serializeDateOnly } from '@/utils/control-values';

interface Props { id: string; value: string; onValueChange: (value: string) => void; required?: boolean; disabled?: boolean }
export function DatePicker({ id, value, onValueChange, required, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => dateInputText(value));
  const [previous, setPrevious] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  if (value !== previous) { setPrevious(value); setDraft(dateInputText(value)); }
  const selected = parseDateOnly(value);
  const [month, setMonth] = useState(selected ?? new Date());
  return <Popover open={open} onOpenChange={next => { if (disabled) return; if (next) setMonth(selected ?? new Date()); setOpen(next); }}>
    <PopoverAnchor asChild><div className="relative">
      <Input ref={input} id={id} placeholder="dd/mm/aaaa" className="!pr-12" inputMode="numeric" required={required} disabled={disabled}
        maxLength={10} value={draft} aria-invalid={!!draft && !parseDateInput(draft) || undefined}
        onChange={event => { const text = event.target.value; const next = parseDateInput(text); setDraft(text); setPrevious(next); onValueChange(next); event.target.setCustomValidity(text && !next ? 'Informe uma data válida no formato dd/mm/aaaa.' : ''); }} />
      <PopoverTrigger asChild><Button variant="plain" disabled={disabled} className="absolute top-0 right-0 grid size-11 place-items-center text-muted" aria-label="Abrir calendário"><CalendarDays size={18} /></Button></PopoverTrigger>
    </div></PopoverAnchor>
    <PopoverContent className="w-auto max-w-[calc(100vw-32px)] p-0" align="start" onCloseAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}>
      <Calendar mode="single" locale={ptBR} selected={selected} month={month} onMonthChange={setMonth} autoFocus
        onSelect={date => { if (!date) return; const next = serializeDateOnly(date); setPrevious(next); setDraft(dateInputText(next)); input.current?.setCustomValidity(''); onValueChange(next); setOpen(false); }} />
    </PopoverContent>
  </Popover>;
}
