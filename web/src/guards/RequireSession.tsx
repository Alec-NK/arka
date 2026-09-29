import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../context/session';
import { ROUTES } from '../routes/constants';
import { useGetSession } from '../hooks/session';
export function RequireSession({ children }: { children: ReactNode }) {
 const session = useGetSession();
 const userId = useSessionStore(state => state.userId);
 if (!userId) return <Navigate to={ROUTES.login} replace />;
 if (session.isPending) return <div className="flex min-h-dvh items-center justify-center p-6 text-center" role="status">Abrindo Arka…</div>;
 if (session.isError) return <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-[26px] font-semibold">Vamos conectar você</h1><Alert asChild variant="plain"><p className="max-w-[50ch] text-muted" role="alert">{session.error.message}</p></Alert><Button variant="plain" className="rounded-md bg-brand px-5 py-3 text-white" onClick={() => void session.refetch()}>Tentar novamente</Button><Button variant="plain" className="rounded-md bg-brand px-5 py-3 text-white" onClick={() => useSessionStore.getState().setUserId(null)}>Trocar usuário</Button></div>;
 return <Fragment key={userId}>{children}</Fragment>;
}
