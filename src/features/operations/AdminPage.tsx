import { Navigate } from 'react-router-dom'
import { ShieldCheck, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Badge, Card, CardHeader, EmptyState, ErrorState, Skeleton, StatCard, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Usuario } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'
import { buildAdminSummary } from './operations'

export function AdminPage() {
  const perfil = useAuthStore((state) => state.user?.perfil)
  const { data: result, loading, error, reload } = useAsync(async () => {
    const [usuarios, professores, turmas, alunos, avaliacoes] = await Promise.all([
      data.usuarios.list(),
      data.professores.list(),
      data.turmas.list(),
      data.alunos.list(),
      data.avaliacoes.listAll(),
    ])
    return { usuarios, professores, turmas, alunos, avaliacoes }
  }, [])

  if (perfil !== 'admin') return <Navigate to="/app" replace />

  const summary = result ? buildAdminSummary(result) : null
  const columns: Column<Usuario>[] = [
    { key: 'nome', label: 'Usuario', render: (usuario) => <span className="font-semibold text-ink">{usuario.nome}</span> },
    { key: 'email', label: 'Email' },
    { key: 'perfil', label: 'Perfil', render: (usuario) => <Badge tone={usuario.perfil === 'admin' ? 'volt' : usuario.perfil === 'professor' ? 'info' : 'neutral'}>{usuario.perfil}</Badge> },
    { key: 'aluno', label: 'Aluno vinculado', render: (usuario) => usuario.alunoId ?? '-' },
  ]

  return (
    <>
      <Topbar title="Admin" subtitle="Visao operacional do sistema" />
      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading || !summary || !result ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Usuarios" value={summary.usuarios} icon={<Users className="h-5 w-5" />} accent />
              <StatCard label="Professores" value={summary.professores} icon={<ShieldCheck className="h-5 w-5" />} />
              <StatCard label="Alunos" value={summary.alunos} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Turmas" value={summary.turmas} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Avaliacoes" value={summary.avaliacoes} icon={<Users className="h-5 w-5" />} />
              <StatCard label="Sem vinculo" value={summary.usuariosSemVinculo} icon={<Users className="h-5 w-5" />} />
            </div>

            <Card>
              <CardHeader title="Usuarios" icon={<ShieldCheck className="h-5 w-5" />} />
              <Table
                columns={columns}
                rows={result.usuarios}
                rowKey={(usuario) => usuario.id}
                emptyState={<EmptyState icon={<Users className="h-7 w-7" />} title="Sem usuarios" description="Nenhum usuario publico encontrado." />}
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}
