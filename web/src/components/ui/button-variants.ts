import { cva } from 'class-variance-authority';

const control = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium leading-5 transition-colors duration-150 disabled:opacity-45 [&_svg]:size-[18px] [&_svg]:shrink-0';
const primary = `${control} border-brand bg-brand text-white hover:enabled:bg-[#680a22]`;
const secondary = `${control} border-line bg-white text-ink hover:enabled:border-[#c8bcc2] hover:enabled:bg-canvas`;
const quiet = `${control} border-transparent bg-transparent text-muted hover:enabled:bg-canvas hover:enabled:text-ink`;
export const buttonVariants = cva('', {
  variants: {
    variant: {
      primary, default: primary, secondary, outline: secondary, quiet, ghost: quiet,
      danger: `${control} border-transparent bg-transparent text-expense hover:enabled:bg-[#fcedf0]`,
      destructive: `${control} border-expense bg-expense text-white hover:enabled:bg-[#982038]`,
      link: `${control} border-transparent text-brand underline-offset-4 hover:underline`,
      // Bespoke page actions retain their existing geometry and icon sizes.
      plain: '',
    },
    size: { default: '', icon: 'size-11 p-0', sm: 'min-h-9 px-3 py-1.5', lg: 'min-h-12 px-5' },
  },
  defaultVariants: { variant: 'secondary', size: 'default' },
});
