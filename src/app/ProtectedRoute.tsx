import { Navigate, Outlet } from 'react-router-dom'
import type { Perfil } from '@/domain/types'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  /** When set, only these perfis may access the nested routes. */
  allow?: Perfil[]
}

export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const { user, initialized } = useAuthStore()

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Carregando…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.perfil)) return <Navigate to="/app" replace />

  return <Outlet />
}
