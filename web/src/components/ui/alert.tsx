import type { ComponentProps } from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
const alertVariants = cva('', { variants: { variant: { default: 'feedback-error', plain: '' } }, defaultVariants: { variant: 'default' } });
export function Alert({ className, variant, asChild = false, ...props }: ComponentProps<'div'> & VariantProps<typeof alertVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'div';
  return <Comp data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
