import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { LandingPage } from '@/features/landing/LandingPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { CadastroPage } from '@/features/auth/CadastroPage'
import { ForgotPage } from '@/features/auth/ForgotPage'
import { DashboardRoute } from '@/features/dashboard/DashboardRoute'
import { AlunosPage } from '@/features/alunos/AlunosPage'
import { AlunoDetailPage } from '@/features/alunos/AlunoDetailPage'
import { TurmasPage } from '@/features/turmas/TurmasPage'
import { AvaliacoesPage } from '@/features/avaliacoes/AvaliacoesPage'
import { RankingPage } from '@/features/dashboard/RankingPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <CadastroPage /> },
  { path: '/forgot', element: <ForgotPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardRoute /> },
          { path: 'alunos', element: <AlunosPage /> },
          { path: 'alunos/:id', element: <AlunoDetailPage /> },
          { path: 'turmas', element: <TurmasPage /> },
          { path: 'avaliacoes', element: <AvaliacoesPage /> },
          { path: 'ranking', element: <RankingPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
