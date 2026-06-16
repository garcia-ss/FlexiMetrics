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
import { TurmaDetailPage } from '@/features/turmas/TurmaDetailPage'
import { AvaliacoesPage } from '@/features/avaliacoes/AvaliacoesPage'
import { RankingPage } from '@/features/dashboard/RankingPage'
import { InsightsPage } from '@/features/insights/InsightsPage'
import { ReportsPage } from '@/features/operations/ReportsPage'
import { VinculosPage } from '@/features/operations/VinculosPage'
import { ProfessorProfilePage } from '@/features/operations/ProfessorProfilePage'
import { HistoricoPage } from '@/features/operations/HistoricoPage'
import { MetasPage } from '@/features/operations/MetasPage'
import { FeedbackPage } from '@/features/operations/FeedbackPage'
import { NotificacoesPage } from '@/features/operations/NotificacoesPage'
import { ImportCsvPage } from '@/features/operations/ImportCsvPage'
import { AdminPage } from '@/features/operations/AdminPage'

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
          { path: 'insights', element: <InsightsPage /> },
          { path: 'relatorios', element: <ReportsPage /> },
          { path: 'historico', element: <HistoricoPage /> },
          { path: 'metas', element: <MetasPage /> },
          { path: 'feedback', element: <FeedbackPage /> },
          { path: 'notificacoes', element: <NotificacoesPage /> },
          { path: 'perfil', element: <ProfessorProfilePage /> },
          { path: 'vinculos', element: <VinculosPage /> },
          { path: 'importar', element: <ImportCsvPage /> },
          { path: 'admin', element: <AdminPage /> },
          { path: 'alunos', element: <AlunosPage /> },
          { path: 'alunos/:id', element: <AlunoDetailPage /> },
          { path: 'turmas', element: <TurmasPage /> },
          { path: 'turmas/:id', element: <TurmaDetailPage /> },
          { path: 'avaliacoes', element: <AvaliacoesPage /> },
          { path: 'ranking', element: <RankingPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
