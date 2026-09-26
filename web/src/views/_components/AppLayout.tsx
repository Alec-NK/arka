import { useState } from 'react';
import type { ReactNode } from 'react';
import { ReceiptText, Store, ChevronDown, Menu, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog } from '../../components/organism/Dialog';
import { ROUTES } from '../../routes/constants';
import { useSessionStore } from '../../context/session';
import { Button } from '../../components/atom/Button';
import { Brand } from './Brand';
export function AppLayout({ children, name }: { children: ReactNode; name: string }) {
  const [navigation, setNavigation] = useState(false);
  const [profile, setProfile] = useState(false);
  const location = useLocation();
  const routes = [{ path: ROUTES.transactions, label: 'Transações', icon: ReceiptText }, { path: ROUTES.suppliers, label: 'Fornecedores', icon: Store }];
  const links = (compact = false) => <nav aria-label="Navegação principal" className="grid gap-2">{routes.map(({ path, label, icon: Icon }) => <Link key={path} to={path} title={label} onClick={() => setNavigation(false)} aria-current={location.pathname.startsWith(path) ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname.startsWith(path) ? 'bg-white text-brand-deep' : 'text-[#e5cfd7] hover:bg-white/10 hover:text-white'} ${compact ? 'min-[1024px]:max-[1279px]:justify-center min-[1024px]:max-[1279px]:px-2' : ''}`}><Icon size={20} /><span className={compact ? 'min-[1024px]:max-[1279px]:sr-only' : ''}>{label}</span></Link>)}</nav>;
  const avatar = <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eed8e0] text-sm font-semibold text-brand-deep">{name.slice(0, 1).toUpperCase()}</span>;
  return <div className="min-h-dvh min-[1024px]:grid min-[1024px]:grid-cols-[80px_minmax(0,1fr)] min-[1280px]:grid-cols-[216px_minmax(0,1fr)]">
    <aside className="sticky top-0 hidden h-dvh flex-col bg-brand-deep px-4 py-8 min-[1024px]:flex">
      <Brand className="mb-14 px-3 !text-white min-[1024px]:max-[1279px]:justify-center min-[1024px]:max-[1279px]:px-0 min-[1024px]:max-[1279px]:[&_span]:hidden" />{links(true)}
      <button type="button" onClick={() => setProfile(true)} aria-label={`Perfil: ${name}`} className="mt-auto flex min-h-12 items-center gap-3 rounded-lg p-2 text-left text-white hover:bg-white/10 min-[1024px]:max-[1279px]:justify-center">{avatar}<span className="min-w-0 flex-1 truncate text-sm min-[1024px]:max-[1279px]:hidden">{name}</span><ChevronDown size={16} className="min-[1024px]:max-[1279px]:hidden" /></button>
    </aside>
    <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3 min-[1024px]:hidden"><Brand className="!text-2xl" /><button type="button" aria-label="Abrir navegação" onClick={() => setNavigation(true)} className="grid size-11 place-items-center rounded-lg text-brand hover:bg-brand-soft"><Menu /></button></div>
    <main className="min-w-0 px-5 py-7 sm:px-8 sm:py-9 min-[1440px]:px-10">{children}</main>
    {navigation && <Dialog title="Navegação" onClose={() => setNavigation(false)} sheet><div className="m-5 rounded-xl bg-brand-deep p-4">{links()}<button type="button" className="mt-6 flex w-full items-center gap-3 rounded-lg p-3 text-left text-white hover:bg-white/10" onClick={() => { setNavigation(false); setProfile(true); }}>{avatar}<span className="truncate">{name}</span></button></div></Dialog>}
    {profile && <Dialog title="Seu perfil" onClose={() => setProfile(false)}><div className="space-y-5 px-6 pb-6"><div className="flex items-center gap-3">{avatar}<span className="font-medium">{name}</span></div><p className="text-sm leading-6 text-muted">Suas transações e fornecedores ficam associados a este perfil.</p><Button onClick={() => useSessionStore.getState().setUserId(null)}><LogOut />Trocar usuário</Button></div></Dialog>}
  </div>;
}
