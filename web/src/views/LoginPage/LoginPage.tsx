import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCreateSession } from '../../hooks/session';
import { useSessionStore } from '../../context/session';
import { ROUTES } from '../../routes/constants';
import { Button } from '@/components/ui/button';
import { Brand } from '../_components/Brand';
const classes = {
  "page": "grid min-h-dvh place-items-center bg-[#fdfcfc] px-6 py-12 max-[480px]:py-10",
  "content": "w-full max-w-[400px] [&_header]:mt-11 [&_header]:mb-[30px] [&_h1]:mb-3 [&_h1]:text-[32px] [&_h1]:leading-[1.25] [&_h1]:font-semibold [&_h1]:tracking-[-0.8px] max-[480px]:[&_h1]:text-[30px] [&_header_p]:text-[15px] [&_header_p]:leading-[1.7] [&_header_p]:text-muted [&_form]:grid [&_form]:gap-6",
  "field": "grid gap-2 [&_label]:text-sm [&_label]:font-medium [&_input]:h-12 [&_input]:w-full [&_input]:min-w-0 [&_input]:rounded-md [&_input]:border [&_input]:border-line [&_input]:bg-white [&_input]:px-3.5 [&_input]:text-base [&_input]:text-ink [&_input]:placeholder:text-muted [&_input]:hover:border-[#b5b8c1] [&_input[aria-invalid=true]]:border-expense",
  "error": "m-0 text-sm leading-[1.6] text-expense [overflow-wrap:anywhere]"
} as const;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const session = useCreateSession();
  const userId = useSessionStore(state => state.userId);
  const navigate = useNavigate();

  if (userId) return <Navigate to={ROUTES.transactions} replace />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (session.isPending) return;
    session.mutate({ email }, { onSuccess: user => {
      useSessionStore.getState().setUserId(user.id);
      navigate(ROUTES.transactions, { replace: true });
    } });
  };

  return <main className={classes.page}>
    <section className={classes.content} aria-labelledby="login-title">
      <Brand />
      <header><h1 id="login-title">Entrar no Arka</h1><p>Informe seu e-mail para acessar suas transações e fornecedores.</p></header>
      <form onSubmit={submit} aria-busy={session.isPending}>
        <div className={classes.field}>
          <Label htmlFor="login-email">E-mail</Label>
          <Input variant="login" id="login-email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="voce@exemplo.com" value={email} readOnly={session.isPending} aria-invalid={session.isError} aria-describedby={session.isError ? 'login-error' : undefined} onChange={event => { setEmail(event.target.value); if (session.isError) session.reset() }} />
          {session.isError && <Alert asChild variant="plain"><p id="login-error" className={classes.error} role="alert">{session.error.message}</p></Alert>}
        </div>
        <Button type="submit" variant="primary" disabled={session.isPending || !email.trim()}>{session.isPending ? 'Entrando…' : 'Entrar'}</Button>
        <span className="sr-only" role="status">{session.isPending ? 'Verificando seu e-mail…' : ''}</span>
      </form>
    </section>
  </main>;
}
