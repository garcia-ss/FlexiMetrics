import { useAuthStore } from '@/stores/authStore'
import { DashboardPage } from './DashboardPage'
import { AlunoOverview } from './AlunoOverview'

export function DashboardRoute() {
  const perfil = useAuthStore((s) => s.user?.perfil)
  return perfil === 'aluno' ? <AlunoOverview /> : <DashboardPage />
}
