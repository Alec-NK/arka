import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
const badgeVariants = cva('', {
  variants: { variant: {
    type: 'inline-flex min-w-0 items-center gap-[13px] text-[13px] text-[#414b61] [&>span:last-child]:[overflow-wrap:anywhere]',
    count: 'grid size-5 place-items-center rounded-full bg-brand text-[11px] text-white',
    filter: 'flex min-h-9 max-w-full items-center gap-2 rounded-md bg-canvas px-3 py-1.5 text-xs text-muted hover:bg-brand-soft hover:text-brand',
  } }, defaultVariants: { variant: 'type' },
});
export function Badge({ className, variant, asChild = false, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
