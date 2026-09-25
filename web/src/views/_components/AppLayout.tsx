import { useState } from 'react';
import type { ReactNode } from 'react';
import { House, ReceiptText, Store, Settings, ChevronDown, Menu, CircleUserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog } from '../../components/organism/Dialog';
import { ROUTES } from '../../routes/constants';
import { useSessionStore } from '../../context/session';
import { Button } from '../../components/atom/Button';
import { Brand as SharedBrand } from './Brand';
const classes = {
  "layout": "grid min-h-dvh grid-cols-[244px_minmax(0,1fr)] max-[1023px]:block min-[1024px]:max-[1439px]:grid-cols-[76px_minmax(0,1fr)]",
  "sidebar": "sticky top-0 flex h-dvh flex-col border-r border-line bg-[#fdfcfc] px-4 pt-[30px] pb-[22px] max-[1023px]:hidden min-[1024px]:max-[1439px]:px-2.5 min-[1024px]:max-[1439px]:pb-5",
  "brand": "px-4 max-[1023px]:p-0 max-[1023px]:text-2xl min-[1024px]:max-[1439px]:justify-center min-[1024px]:max-[1439px]:p-0 min-[1024px]:max-[1439px]:[&_span]:hidden",
  "nav": "mt-8 grid gap-1 [&_a]:relative [&_a]:flex [&_a]:min-h-[46px] [&_a]:w-full [&_a]:items-center [&_a]:gap-[19px] [&_a]:rounded-[5px] [&_a]:px-5 [&_a]:py-[13px] [&_a]:text-left [&_a]:text-[15px] [&_a]:text-[#414b61] [&_button]:relative [&_button]:flex [&_button]:min-h-[46px] [&_button]:w-full [&_button]:items-center [&_button]:gap-[19px] [&_button]:rounded-[5px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-5 [&_button]:py-[13px] [&_button]:text-left [&_button]:text-[15px] [&_button]:text-[#667085] [&_svg]:h-[21px] [&_svg]:w-[21px] [&_svg]:shrink-0 [&_a[aria-current]]:bg-[#f4e8eb] [&_a[aria-current]]:font-medium [&_a[aria-current]]:text-brand [&_a[aria-current]]:before:absolute [&_a[aria-current]]:before:inset-y-0 [&_a[aria-current]]:before:left-0 [&_a[aria-current]]:before:w-[3px] [&_a[aria-current]]:before:rounded-l-[3px] [&_a[aria-current]]:before:bg-brand min-[1024px]:max-[1439px]:mt-[38px] min-[1024px]:max-[1439px]:[&_a]:justify-center min-[1024px]:max-[1439px]:[&_a]:p-3 min-[1024px]:max-[1439px]:[&_button]:justify-center min-[1024px]:max-[1439px]:[&_button]:p-3 min-[1024px]:max-[1439px]:[&_span]:sr-only",
  "bottom": "mt-auto grid gap-6",
  "settings": "flex items-center gap-[19px] border-0 bg-transparent px-5 py-3 text-[15px] text-[#687084] [&_svg]:h-[21px] [&_svg]:w-[21px] min-[1024px]:max-[1439px]:justify-center min-[1024px]:max-[1439px]:p-3 min-[1024px]:max-[1439px]:[&_span]:hidden",
  "profile": "flex min-h-12 w-full min-w-0 items-center gap-4 overflow-hidden rounded-md border-0 bg-transparent px-2.5 text-left text-[#364159] hover:bg-[#f5eeee] min-[1024px]:max-[1439px]:justify-center min-[1024px]:max-[1439px]:p-1 min-[1024px]:max-[1439px]:[&>svg]:hidden",
  "avatar": "grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-[#ede2e4] text-lg font-medium text-brand",
  "profileName": "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-[1024px]:max-[1439px]:hidden",
  "main": "min-w-0 px-5 pt-[47px] pb-5 pl-9 max-[1023px]:px-6 max-[1023px]:py-7 max-[600px]:px-[18px] max-[600px]:py-[25px] min-[1024px]:max-[1439px]:px-[30px]",
  "mobileHeader": "hidden items-center justify-between border-b border-line px-6 py-[17px] max-[1023px]:flex max-[600px]:px-[18px] max-[600px]:py-3 [&_button]:grid [&_button]:h-11 [&_button]:w-11 [&_button]:place-items-center [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-brand",
  "mobileProfile": "m-6 flex items-center gap-2.5 border-0 bg-[#f8f3f4] p-3.5",
  "profileBody": "px-[26px] pt-1 pb-[30px] [&_p]:text-sm [&_p]:leading-[1.7] [&_p]:text-muted"
} as const;
function Brand() { return <SharedBrand className={classes.brand} /> }
export function AppLayout({ children, name }: { children: ReactNode; name: string }) {
 const [navigation, setNavigation] = useState(false); const [profile, setProfile] = useState(false); const location = useLocation();
 const links = <nav className={classes.nav} aria-label="Navegação principal"><button disabled title="Visão geral em breve"><House /><span>Visão geral</span></button><Link to={ROUTES.transactions} aria-current={location.pathname.startsWith(ROUTES.transactions) ? 'page' : undefined} onClick={() => setNavigation(false)}><ReceiptText /><span>Transações</span></Link><Link to={ROUTES.suppliers} aria-current={location.pathname.startsWith(ROUTES.suppliers) ? 'page' : undefined} onClick={() => setNavigation(false)}><Store /><span>Fornecedores</span></Link></nav>;
 return <div className={classes.layout}><aside className={classes.sidebar}><Brand />{links}<div className={classes.bottom}><button className={classes.settings} disabled title="Configurações em breve"><Settings /><span>Configurações</span></button><button className={classes.profile} onClick={() => setProfile(true)} aria-label={`Perfil: ${name}`}><span className={classes.avatar}>{name.slice(0, 1).toUpperCase()}</span><span className={classes.profileName}>{name}</span><ChevronDown size={18} /></button></div></aside>
 <div className={classes.mobileHeader}><Brand /><button aria-label="Abrir navegação" onClick={() => setNavigation(true)}><Menu /></button></div><main className={classes.main}>{children}</main>
 {navigation && <Dialog title="Navegação" onClose={() => setNavigation(false)} sheet>{links}<button className={classes.mobileProfile} onClick={() => { setNavigation(false); setProfile(true) }}><CircleUserRound />{name}</button></Dialog>}
 {profile && <Dialog title="Seu perfil" onClose={() => setProfile(false)}><div className={classes.profileBody}><span className={classes.avatar}>{name.slice(0,1).toUpperCase()}</span><h3>{name}</h3><p>Transações e fornecedores do perfil selecionado.</p><Button onClick={() => useSessionStore.getState().setUserId(null)}>Trocar usuário</Button></div></Dialog>}
 </div>;
}
