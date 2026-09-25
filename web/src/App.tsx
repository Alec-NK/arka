import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes/Router';
import { ApiError } from './types/api-error';
import { SESSION_STORAGE_KEY, useSessionStore } from './context/session';

function SessionQueries() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: {
    retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 1,
    refetchOnWindowFocus: false,
  } } }));
  useEffect(() => () => { void queryClient.cancelQueries(); queryClient.clear() }, [queryClient]);
  return <QueryClientProvider client={queryClient}><Router /></QueryClientProvider>;
}

export default function App() {
  const userId = useSessionStore(state => state.userId);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === SESSION_STORAGE_KEY || event.key === null)) {
        if (localStorage.getItem(SESSION_STORAGE_KEY) === null) useSessionStore.getState().setUserId(null);
        else void useSessionStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return <BrowserRouter><SessionQueries key={userId || 'anonymous'} /></BrowserRouter>;
}
