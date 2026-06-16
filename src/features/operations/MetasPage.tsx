import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Target } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Badge, Card, CardHeader, EmptyState, ErrorState, Select, Skeleton } from '@/components/ui'
import { data } from '@/data'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'
import { buildDerivedGoals } from './operations'

const todayIso = () => new Date().toISOString().slice(0, 10)

export function MetasPage() {
  const user = useAuthStore((state) => state.user)
  const [selectedAlunoId, setSelectedAlunoId] = useState('')

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, avaliacoes] = await Promise.all([data.alunos.list(), data.avaliacoes.listAll()])
    return { alunos, avaliacoes }
  }, [])

  const alunos = result?.alunos ?? []
  const alunoId = user?.perfil === 'aluno' ? user.alunoId ?? '' : (selectedAlunoId || alunos[0]?.id || '')
  const aluno = alunos.find((item) => item.id === alunoId) ?? null
  const goals = useMemo(() => {
    if (!aluno) return []
    return buildDerivedGoals(aluno, result?.avaliacoes ?? [], todayIso())
  }, [aluno, result?.avaliacoes])

  if (user?.perfil === 'aluno' && !user.alunoId) return <Navigate to="/app" replace />

  return (
    <>
      <Topbar title="Metas" subtitle="Metas sugeridas a partir das avaliacoes existentes" />
      <div className="space-y-6 p-4 sm:p-6">
        {user?.perfil !== 'aluno' && (
          <Card>
            <CardHeader title="Aluno" />
            <div className="px-5 pb-5">
              <Select
                label="Aluno"
                value={alunoId}
                options={alunos.map((item) => ({ value: item.id, label: item.nome }))}
                onChange={(event) => setSelectedAlunoId(event.target.value)}
              />
            </div>
          </Card>
        )}
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-96" />
        ) : goals.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-5">
                <Badge tone={goal.priority === 'alta' ? 'danger' : goal.priority === 'media' ? 'warning' : 'success'}>
                  {goal.priority}
                </Badge>
                <h3 className="mt-3 font-semibold text-ink">{goal.title}</h3>
                <p className="mt-2 text-sm text-subtle">{goal.description}</p>
                <p className="mt-4 text-xs uppercase tracking-wide text-muted">Origem: {goal.source}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card><EmptyState icon={<Target className="h-7 w-7" />} title="Sem metas sugeridas" description="Registre avaliacoes para gerar metas." /></Card>
        )}
      </div>
    </>
  )
}
