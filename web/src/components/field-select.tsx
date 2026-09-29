import { useId, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fromSelectValue, toSelectValue } from '@/utils/control-values';

interface Props {
  id?: string; name?: string; value: string; onValueChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string; required?: boolean; disabled?: boolean; className?: string; 'aria-label'?: string;
}
export function FieldSelect({ id, name, value, onValueChange, options, placeholder, required = false, disabled, className, 'aria-label': label }: Props) {
  const generated = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [invalid, setInvalid] = useState(false);
  return <Select value={toSelectValue(value, required)} onValueChange={next => { setInvalid(false); onValueChange(fromSelectValue(next)); }} disabled={disabled}>
    <SelectTrigger ref={trigger} id={id || generated} className={className} aria-label={label} aria-required={required || undefined} aria-invalid={invalid || undefined}><SelectValue placeholder={placeholder} /></SelectTrigger>
    <SelectContent>{options.map(option => <SelectItem key={option.value} value={toSelectValue(option.value)} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent>
    {required && <input className="sr-only" tabIndex={-1} aria-hidden="true" name={name} value={value} required disabled={disabled} onChange={() => {}} onInvalid={event => { event.preventDefault(); setInvalid(true); trigger.current?.focus(); }} />}
  </Select>;
}
