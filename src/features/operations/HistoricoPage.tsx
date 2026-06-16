import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Clock3 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Badge, Card, CardHeader, EmptyState, ErrorState, Select, Skeleton, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Avaliacao } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtDate, fmtNum } from '@/lib/format'
import { useAuthStore } from '@/stores/authStore'

export function HistoricoPage() {
  const user = useAuthStore((state) => state.user)
  const [selectedAlunoId, setSelectedAlunoId] = useState('')

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, avaliacoes] = await Promise.all([data.alunos.list(), data.avaliacoes.listAll()])
    return { alunos, avaliacoes }
  }, [])

  const alunos = result?.alunos ?? []
  const alunoId = user?.perfil === 'aluno' ? user.alunoId ?? '' : selectedAlunoId
  const avaliacoes = useMemo(
    () => (result?.avaliacoes ?? []).filter((avaliacao) => !alunoId || avaliacao.alunoId === alunoId),
    [alunoId, result?.avaliacoes],
  )

  if (user?.perfil === 'aluno' && !user.alunoId) return <Navigate to="/app" replace />

  const columns: Column<Avaliacao>[] = [
    { key: 'data', label: 'Data', render: (avaliacao) => fmtDate(avaliacao.data) },
    { key: 'periodo', label: 'Periodo', render: (avaliacao) => `${avaliacao.mesReferencia}/${avaliacao.anoReferencia}` },
    { key: 'imc', label: 'IMC', align: 'right', render: (avaliacao) => <Badge>{fmtNum(avaliacao.imc)}</Badge> },
    { key: 'rce', label: 'RCE', align: 'right', render: (avaliacao) => fmtNum(avaliacao.rce, 2) },
    { key: 'feedback', label: 'Feedback', render: (avaliacao) => avaliacao.observacoes || 'Sem observacoes' },
  ]

  return (
    <>
      <Topbar title="Historico" subtitle="Linha do tempo de avaliacoes" />
      <div className="space-y-6 p-4 sm:p-6">
        {user?.perfil !== 'aluno' && (
          <Card>
            <CardHeader title="Filtro" />
            <div className="px-5 pb-5">
              <Select
                label="Aluno"
                placeholder="Todos"
                value={selectedAlunoId}
                options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
                onChange={(event) => setSelectedAlunoId(event.target.value)}
              />
            </div>
          </Card>
        )}
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <CardHeader title="Avaliacoes" subtitle={`${avaliacoes.length} registro(s)`} icon={<Clock3 className="h-5 w-5" />} />
            <Table columns={columns} rows={avaliacoes} rowKey={(avaliacao) => avaliacao.id} emptyState={<EmptyState icon={<Clock3 className="h-7 w-7" />} title="Sem historico" description="Registre avaliacoes para criar historico." />} />
          </Card>
        )}
      </div>
    </>
  )
}
