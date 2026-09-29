import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog as DialogRoot, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CloseContext = createContext<(() => void) | null>(null);
export function DialogCloseButton(props: ComponentProps<typeof Button>) {
  const close = useContext(CloseContext);
  return <Button {...props} onClick={() => close?.()} />;
}
interface Props { title: string; children: ReactNode; onClose: () => void; sheet?: boolean; wide?: boolean; dirty?: boolean; busy?: boolean }

function returnFocusTarget(): HTMLElement | null {
  const active = document.activeElement as HTMLElement | null;
  // Menu items unmount when their action opens a dialog. Restore the menu trigger instead.
  const menuTrigger = active?.closest('[role="menu"]')?.getAttribute('aria-labelledby');
  return (menuTrigger ? document.getElementById(menuTrigger) : null) ?? active;
}

// Application policy lives here; focus trapping, portals and scroll locking belong to Radix.
export function Dialog({ title, children, onClose, sheet = false, wide = false, dirty = false, busy = false }: Props) {
  const [discard, setDiscard] = useState(false);
  const trigger = useRef(returnFocusTarget());
  const previousFocus = useRef<HTMLElement | null>(null);
  const keepEditing = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
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
  const Root = sheet ? Sheet : DialogRoot;
  const Content = sheet ? SheetContent : DialogContent;
  const Title = sheet ? SheetTitle : DialogTitle;
  return <Root open onOpenChange={open => { if (!open) close(); }}>
    <Content ref={content} showCloseButton={false} aria-describedby={undefined} role={discard ? 'alertdialog' : 'dialog'}
      className={wide ? 'w-[min(600px,calc(100vw-32px))] max-sm:m-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:rounded-none' : undefined}
      onOpenAutoFocus={event => { const field = content.current?.querySelector<HTMLElement>('[data-autofocus]'); if (field) { event.preventDefault(); field.focus(); } }}
      onCloseAutoFocus={event => { event.preventDefault(); if (trigger.current?.isConnected) trigger.current.focus(); }}
      onEscapeKeyDown={event => { event.preventDefault(); if (discard) resume(); else close(); }}
      onInteractOutside={event => { event.preventDefault(); if (discard) resume(); else close(); }}>
      <div hidden={discard}>
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-5">
          {!discard && <Title>{title}</Title>}
          <Button variant="plain" aria-label={`Fechar ${title.toLowerCase()}`} onClick={close} disabled={busy} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas disabled:opacity-40"><X size={20} /></Button>
        </div>
        <CloseContext.Provider value={close}>{children}</CloseContext.Provider>
      </div>
      {discard && <section className="p-6"><Title className="tracking-normal">Descartar alterações?</Title><p className="mt-3 text-sm leading-6 text-muted">Você tem alterações que ainda não foram salvas.</p><div className="mt-6 flex flex-wrap justify-end gap-3"><Button ref={keepEditing} variant="plain" onClick={resume} className="min-h-11 rounded-lg border border-line px-4 text-sm font-medium">Continuar editando</Button><Button variant="destructive" onClick={onClose}>Descartar alterações</Button></div></section>}
    </Content>
  </Root>;
}

export function ConfirmationDialog({ title, children, onClose, busy = false }: Pick<Props, 'title' | 'children' | 'onClose' | 'busy'>) {
  const trigger = useRef(returnFocusTarget());
  return <AlertDialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <AlertDialogContent aria-describedby={undefined}
      onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}
      onCloseAutoFocus={event => { event.preventDefault(); if (trigger.current?.isConnected) trigger.current.focus(); }}>
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-5"><AlertDialogTitle>{title}</AlertDialogTitle><Button variant="plain" disabled={busy} aria-label={`Fechar ${title.toLowerCase()}`} onClick={onClose} className="-mr-2 grid size-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas disabled:opacity-40"><X size={20} /></Button></div>
      {children}
    </AlertDialogContent>
  </AlertDialog>;
}
