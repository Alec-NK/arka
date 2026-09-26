import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atom/Button';
const CloseContext = createContext<(() => void) | null>(null);
export function DialogCloseButton(props: ComponentProps<typeof Button>) {
  const close = useContext(CloseContext);
  return <Button {...props} onClick={() => close?.()} />;
}
interface Props { title: string; children: ReactNode; onClose: () => void; sheet?: boolean; wide?: boolean; dirty?: boolean; busy?: boolean }
export function Dialog({ title, children, onClose, sheet = false, wide = false, dirty = false, busy = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const keepEditing = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [discard, setDiscard] = useState(false);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => { if (discard) keepEditing.current?.focus(); }, [discard]);
  const resume = () => { setDiscard(false); requestAnimationFrame(() => previousFocus.current?.focus()); };
  const close = () => {
    if (busy) return;
    if (dirty) { previousFocus.current = document.activeElement as HTMLElement; setDiscard(true); }
    else onClose();
  };
  return <dialog ref={ref} aria-label={discard ? 'Descartar alterações?' : title} className={`reveal m-auto max-h-[calc(100dvh-40px)] w-[min(460px,calc(100vw-32px))] max-w-full overflow-y-auto rounded-2xl border-0 bg-white p-0 text-ink shadow-layer backdrop:bg-[#28132180] ${wide ? 'w-[min(600px,calc(100vw-32px))] max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:rounded-none' : ''} ${sheet ? 'mr-0 ml-auto h-dvh max-h-dvh w-[min(440px,100vw)] rounded-none' : ''}`} onCancel={event => { event.preventDefault(); if (discard) resume(); else close(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { if (discard) resume(); else close(); }
  }}>
    <div hidden={discard}><div className="flex items-center justify-between gap-4 px-6 pt-5 pb-5"><h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2><button type="button" aria-label={`Fechar ${title.toLowerCase()}`} onClick={close} disabled={busy} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas disabled:opacity-40"><X size={20} /></button></div><CloseContext.Provider value={close}>{children}</CloseContext.Provider></div>
    {discard && <section className="p-6"><h2 className="text-xl font-semibold">Descartar alterações?</h2><p className="mt-3 text-sm leading-6 text-muted">Você tem alterações que ainda não foram salvas.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button ref={keepEditing} type="button" onClick={resume} className="min-h-11 rounded-lg border border-line px-4 text-sm font-medium">Continuar editando</button><Button variant="destructive" onClick={onClose}>Descartar alterações</Button></div></section>}
  </dialog>;
}
