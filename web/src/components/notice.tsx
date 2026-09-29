import { useEffect, useId, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const id = useId();
  const dismiss = useRef(onDismiss);
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
  useEffect(() => {
    if (!message) { toast.dismiss(id); return; }
    toast.custom(() => <div role="status" aria-live="polite" aria-atomic="true" className="reveal flex w-max max-w-[calc(100vw-32px)] items-center gap-3 rounded-xl bg-[#263a30] py-3 pr-2 pl-4 text-sm leading-6 text-white shadow-layer"><Check size={18} className="shrink-0" /><span>{message}</span><Button variant="plain" onClick={() => { toast.dismiss(id); dismiss.current(); }} aria-label="Dispensar notificação" className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"><X size={18} /></Button></div>, {
      id, duration: 7000, style: { width: 'max-content', maxWidth: 'calc(100vw - 32px)', left: '50%', transform: 'translateX(-50%)' },
      onAutoClose: () => dismiss.current(),
    });
    return () => { toast.dismiss(id); };
  }, [message, id]);
  return null;
}
