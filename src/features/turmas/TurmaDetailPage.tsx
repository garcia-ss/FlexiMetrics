import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ClipboardList, Lightbulb, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, StatCard, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Aluno } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtNum } from '@/lib/format'
import { buildInsights } from '@/features/insights/insights'
import { computeKpis } from '@/features/dashboard/kpis'

export function TurmaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: result, loading, error, reload } = useAsync(async () => {
    if (!id) return null
    const [turma, alunos, turmas, avaliacoes] = await Promise.all([
      data.turmas.get(id),
      data.alunos.list({ turmaId: id }),
      data.turmas.list(),
      data.avaliacoes.listAll(),
    ])
    return { turma, alunos, turmas, avaliacoes }
  }, [id])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const allAvaliacoes = useMemo(() => result?.avaliacoes ?? [], [result?.avaliacoes])
  const alunoIds = useMemo(() => new Set(alunos.map((aluno) => aluno.id)), [alunos])
  const avaliacoes = useMemo(() => allAvaliacoes.filter((avaliacao) => alunoIds.has(avaliacao.alunoId)), [alunoIds, allAvaliacoes])
  const kpis = useMemo(() => computeKpis(alunos), [alunos])
  const insights = useMemo(() => buildInsights({ alunos, turmas, avaliacoes, today: new Date().toISOString().slice(0, 10) }), [alunos, avaliacoes, turmas])

  const columns: Column<Aluno>[] = [
    { key: 'nome', label: 'Aluno', render: (aluno) => <span className="font-semibold text-ink">{aluno.nome}</span> },
    { key: 'idade', label: 'Idade', align: 'right', render: (aluno) => `${aluno.idade} anos` },
    { key: 'imc', label: 'IMC', align: 'right', render: (aluno) => fmtNum(aluno.imc) },
    { key: 'rce', label: 'RCE', align: 'right', render: (aluno) => fmtNum(aluno.rce, 2) },
  ]

  return (
    <>
      <Topbar
        title={result?.turma?.nome ?? 'Detalhe da turma'}
        subtitle={result?.turma ? `Ano letivo ${result.turma.anoLetivo}` : 'Acompanhamento coletivo'}
        actions={<Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/app/turmas')}>Voltar</Button>}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : !result?.turma ? (
          <Card>
            <EmptyState icon={<Users className="h-7 w-7" />} title="Turma nao encontrada" description="O registro pode ter sido removido." />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatCard label="Alunos" value={kpis.total} icon={<Users className="h-5 w-5" />} accent />
              <StatCard label="Avaliacoes" value={avaliacoes.length} icon={<ClipboardList className="h-5 w-5" />} />
              <StatCard label="IMC medio" value={fmtNum(kpis.mediaImc)} icon={<ClipboardList className="h-5 w-5" />} />
              <StatCard label="Em atencao" value={insights.summary.attention + insights.summary.overdue} icon={<Lightbulb className="h-5 w-5" />} />
            </div>

            <Card>
              <CardHeader title="Alunos da turma" subtitle="Clique em um aluno para abrir o detalhe" />
              <Table
                columns={columns}
                rows={alunos}
                rowKey={(aluno) => aluno.id}
                onRowClick={(aluno) => navigate(`/app/alunos/${aluno.id}`)}
                emptyState={<EmptyState icon={<Users className="h-7 w-7" />} title="Sem alunos" description="Vincule alunos a esta turma." />}
              />
            </Card>

            <Card>
              <CardHeader title="Prioridades da turma" subtitle="Derivado das ultimas avaliacoes" />
              <Table
                columns={[
                  { key: 'aluno', label: 'Aluno', render: (row) => row.aluno.nome },
                  { key: 'status', label: 'Status', render: (row) => row.statusLabel },
                  { key: 'foco', label: 'Foco', render: (row) => row.focus.label },
                ]}
                rows={insights.rows.slice(0, 8)}
                rowKey={(row) => row.aluno.id}
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}
