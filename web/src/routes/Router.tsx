import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireSession } from '../guards/RequireSession';
import { ROUTES } from './constants';
const TransactionsPage = lazy(() => import('../views/TransactionsPage/TransactionsPage'));
const SuppliersPage = lazy(() => import('../views/SuppliersPage/SuppliersPage'));
const LoginPage = lazy(() => import('../views/LoginPage/LoginPage'));
export function Router() { return <Suspense fallback={<div className="flex min-h-dvh items-center justify-center p-6 text-center">Carregando…</div>}><Routes><Route path={ROUTES.login} element={<LoginPage />} /><Route path={ROUTES.transactions} element={<RequireSession><TransactionsPage /></RequireSession>} /><Route path={ROUTES.suppliers} element={<RequireSession><SuppliersPage /></RequireSession>} /><Route path="*" element={<Navigate to={ROUTES.transactions} replace />} /></Routes></Suspense> }
