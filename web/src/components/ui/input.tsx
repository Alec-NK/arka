import type { ComponentProps } from 'react';
import { cn } from '@/utils/cn';

export function Input({ className, variant = 'field', ...props }: ComponentProps<'input'> & { variant?: 'field' | 'login' }) {
  return <input data-slot="input" data-autofocus={props.autoFocus || undefined} className={cn(variant === 'field' && 'field-control', className)} {...props} />;
}
