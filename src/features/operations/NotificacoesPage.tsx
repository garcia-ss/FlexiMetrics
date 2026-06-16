import { Navigate, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Badge, Card, CardHeader, EmptyState, ErrorState, Skeleton, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'
import { buildNotifications, type DerivedNotification } from './operations'

const todayIso = () => new Date().toISOString().slice(0, 10)

export function NotificacoesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, turmas, avaliacoes] = await Promise.all([data.alunos.list(), data.turmas.list(), data.avaliacoes.listAll()])
    return { alunos, turmas, avaliacoes }
  }, [])

  const baseNotifications = result ? buildNotifications({ ...result, today: todayIso() }) : []
  const notifications =
    user?.perfil === 'aluno' ? baseNotifications.filter((item) => item.alunoId === user.alunoId) : baseNotifications

  if (user?.perfil === 'aluno' && !user.alunoId) return <Navigate to="/app" replace />

  const columns: Column<DerivedNotification>[] = [
    { key: 'tipo', label: 'Tipo', render: (item) => <Badge tone={item.kind === 'highlight' ? 'success' : item.kind === 'overdue' ? 'warning' : 'danger'}>{item.title}</Badge> },
    { key: 'descricao', label: 'Descricao', render: (item) => item.description },
  ]

  return (
    <>
      <Topbar title="Notificacoes" subtitle="Alertas derivados das avaliacoes" />
      <div className="p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <CardHeader title="Alertas" subtitle={`${notifications.length} notificacao(oes)`} icon={<Bell className="h-5 w-5" />} />
            <Table
              columns={columns}
              rows={notifications}
              rowKey={(item) => item.id}
              onRowClick={(item) => navigate(`/app/alunos/${item.alunoId}`)}
              emptyState={<EmptyState icon={<Bell className="h-7 w-7" />} title="Sem notificacoes" description="Nenhum alerta derivado no momento." />}
            />
          </Card>
        )}
      </div>
    </>
  )
}
