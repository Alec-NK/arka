import type { ButtonHTMLAttributes } from 'react';
const classes = {
  "button": "inline-flex min-h-[46px] items-center justify-center gap-2.5 whitespace-nowrap rounded-md px-[18px] py-[11px] text-sm font-medium leading-[1.4] no-underline transition-colors duration-150 disabled:opacity-50 [&_svg]:h-[19px] [&_svg]:w-[19px] [&_svg]:shrink-0",
  "primary": "border border-brand bg-brand text-white hover:enabled:bg-[#74051a]",
  "secondary": "border border-[#dce0e6] bg-white text-ink hover:enabled:bg-[#f7f7f9]",
  "danger": "border border-transparent bg-transparent text-[#d50022] hover:enabled:bg-[#fff0f2]",
  "quiet": "border border-transparent bg-transparent text-muted hover:enabled:bg-[#f5f5f7]"
} as const;
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'danger' | 'quiet' }
export function Button({ variant = 'secondary', className = '', ...props }: Props) { return <button type="button" className={`${classes.button} ${classes[variant]} ${className}`} {...props} /> }
