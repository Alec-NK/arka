import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
const classes = {
  "dialog": "m-auto max-h-[calc(100dvh-48px)] w-[min(460px,calc(100vw-32px))] max-w-[100vw] overflow-auto rounded-xl border-0 bg-white p-0 text-ink shadow-layer backdrop:bg-[#17172466]",
  "wide": "w-[min(570px,calc(100vw-32px))] max-[600px]:m-0 max-[600px]:h-dvh max-[600px]:max-h-dvh max-[600px]:w-screen max-[600px]:rounded-none",
  "sheet": "mr-0 ml-auto h-dvh max-h-dvh w-[min(420px,100vw)] rounded-none max-[600px]:m-0 max-[600px]:w-screen",
  "header": "flex items-center justify-between gap-4 px-[26px] pt-6 pb-[18px] [&_h2]:m-0 [&_h2]:text-xl [&_h2]:font-semibold",
  "close": "-mt-2.5 -mr-3 -mb-2.5 grid h-11 w-11 place-items-center rounded-md border-0 bg-transparent text-[#485269] hover:bg-[#f5f5f7]"
} as const;
interface Props { title: string; children: ReactNode; onClose: () => void; sheet?: boolean; wide?: boolean }
export function Dialog({ title, children, onClose, sheet = false, wide = false }: Props) {
 const ref = useRef<HTMLDialogElement>(null);
 useEffect(() => { const dialog = ref.current!; const trigger = document.activeElement as HTMLElement | null; if (!dialog.open) dialog.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; if (trigger?.isConnected) trigger.focus() } }, []);
 return <dialog ref={ref} aria-label={title} className={`${classes.dialog} ${sheet ? classes.sheet : ''} ${wide ? classes.wide : ''}`} onCancel={e => { e.preventDefault(); onClose() }} onClick={e => { if (e.target === e.currentTarget) { const bounds = e.currentTarget.getBoundingClientRect(); if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose() } }}>
  <div className={classes.header}><h2>{title}</h2><button className={classes.close} aria-label={`Fechar ${title.toLowerCase()}`} onClick={onClose}><X size={21} /></button></div>{children}
 </dialog>;
}
