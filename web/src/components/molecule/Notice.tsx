import { Check, X } from 'lucide-react';
export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div role="status" aria-live="polite" aria-atomic="true" className={message ? 'reveal fixed bottom-5 left-1/2 z-50 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-[#263a30] py-3 pr-2 pl-4 text-sm leading-6 text-white shadow-layer' : 'sr-only'}>{message && <><Check size={18} className="shrink-0" /><span>{message}</span><button type="button" onClick={onDismiss} aria-label="Dispensar notificação" className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"><X size={18} /></button></>}</div>;
}
