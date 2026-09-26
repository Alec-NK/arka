import type { ButtonHTMLAttributes } from 'react';
const variants = {
  primary: 'border-brand bg-brand text-white hover:enabled:bg-[#680a22]',
  secondary: 'border-line bg-white text-ink hover:enabled:border-[#c8bcc2] hover:enabled:bg-canvas',
  danger: 'border-transparent bg-transparent text-expense hover:enabled:bg-[#fcedf0]',
  destructive: 'border-expense bg-expense text-white hover:enabled:bg-[#982038]',
  quiet: 'border-transparent bg-transparent text-muted hover:enabled:bg-canvas hover:enabled:text-ink',
} as const;
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: keyof typeof variants }
export function Button({ variant = 'secondary', className = '', ...props }: Props) {
  return <button type="button" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium leading-5 transition-colors duration-150 disabled:opacity-45 [&_svg]:size-[18px] [&_svg]:shrink-0 ${variants[variant]} ${className}`} {...props} />;
}
