import type { ReactNode } from 'react';
export function PageHeader({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-center justify-between gap-5"><div className="min-w-0"><h1 className="text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink max-sm:text-[27px]">{title}</h1><p className="mt-2 max-w-[65ch] text-sm leading-6 text-muted">{description}</p></div><div className="shrink-0 max-sm:w-full max-sm:[&>button]:w-full">{action}</div></header>;
}
