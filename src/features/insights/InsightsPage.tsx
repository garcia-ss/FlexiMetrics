import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock3, Lightbulb, Sparkles, TrendingUp, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  StatCard,
  Table,
} from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import { useAsync } from '@/hooks/useAsync'
import { fmtDate } from '@/lib/format'
import { useAuthStore } from '@/stores/authStore'
import { buildInsights, type InsightStatus, type StudentInsightRow } from './insights'

const todayIso = () => new Date().toISOString().slice(0, 10)

const STATUS_OPTIONS: { value: InsightStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'overdue', label: 'Atrasados' },
  { value: 'attention', label: 'Atencao' },
  { value: 'highlight', label: 'Destaques' },
  { value: 'stable', label: 'Estaveis' },
  { value: 'empty', label: 'Sem historico' },
]

function lastEvaluationText(row: StudentInsightRow): string {
  if (!row.lastEvaluationDate) return 'Sem avaliacao'
  if (row.daysSinceLast === null) return fmtDate(row.lastEvaluationDate)
  return `${fmtDate(row.lastEvaluationDate)} · ${row.daysSinceLast} dia(s)`
}

export function InsightsPage() {
  const navigate = useNavigate()
  const perfil = useAuthStore((state) => state.user?.perfil)
  const [status, setStatus] = useState<InsightStatus | ''>('')
  const [turmaId, setTurmaId] = useState('')

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, turmas, avaliacoes] = await Promise.all([
      data.alunos.list(),
      data.turmas.list(),
      data.avaliacoes.listAll(),
    ])
    return { alunos, turmas, avaliacoes }
  }, [])

  const insights = useMemo(() => {
    if (!result) return null
    return buildInsights({ ...result, today: todayIso() })
  }, [result])

  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const rows = useMemo(() => {
    const baseRows = insights?.rows ?? []
    return baseRows.filter((row) => {
      if (status && row.status !== status) return false
      if (turmaId && row.aluno.turmaId !== turmaId) return false
      return true
    })
  }, [insights?.rows, status, turmaId])

  if (perfil === 'aluno') return <Navigate to="/app" replace />

  const columns: Column<StudentInsightRow>[] = [
    {
      key: 'aluno',
      label: 'Aluno',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink">{row.aluno.nome}</p>
          <p className="text-xs text-subtle">{row.turma?.nome ?? 'Sem turma'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={row.statusTone}>{row.statusLabel}</Badge>,
    },
    {
      key: 'ultimo',
      label: 'Ultimo registro',
      render: (row) => <span className="text-sm text-muted">{lastEvaluationText(row)}</span>,
    },
    {
      key: 'sinais',
      label: 'Sinais',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.regressions.length > 0 && <Badge tone="danger">{row.regressions.length} regressao</Badge>}
          {row.improvements.length > 0 && <Badge tone="success">{row.improvements.length} melhora</Badge>}
          {row.regressions.length === 0 && row.improvements.length === 0 && <Badge>Sem variacao</Badge>}
        </div>
      ),
    },
    {
      key: 'foco',
      label: 'Foco recomendado',
      render: (row) => (
        <div className="max-w-md">
          <p className="font-medium text-ink">{row.focus.label}</p>
          <p className="mt-1 text-xs text-subtle">{row.focus.description}</p>
        </div>
      ),
    },
  ]

  return (
    <>
      <Topbar title="Insights" subtitle="Priorizacao de acompanhamento por avaliacao" />

      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading || !insights ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
            <Skeleton className="h-[520px]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Alunos" value={insights.summary.total} icon={<Users className="h-5 w-5" />} accent />
              <StatCard
                label="Atrasados"
                value={insights.summary.overdue}
                icon={<Clock3 className="h-5 w-5" />}
                subtitle="sem avaliacao recente"
              />
              <StatCard
                label="Regressao"
                value={insights.summary.regressions}
                icon={<AlertTriangle className="h-5 w-5" />}
                subtitle="pioraram em metricas"
              />
              <StatCard
                label="Destaques"
                value={insights.summary.highlights}
                icon={<Sparkles className="h-5 w-5" />}
                subtitle="melhoraram recentemente"
              />
            </div>

            <Card>
              <CardHeader title="Filtros de acompanhamento" subtitle={`${rows.length} aluno(s) no recorte`} icon={<Lightbulb className="h-5 w-5" />} />
              <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2">
                <Select
                  label="Status"
                  value={status}
                  options={STATUS_OPTIONS}
                  onChange={(event) => setStatus((event.target.value || '') as InsightStatus | '')}
                />
                <Select
                  label="Turma"
                  placeholder="Todas"
                  value={turmaId}
                  options={turmas.map((turma) => ({ value: turma.id, label: turma.nome }))}
                  onChange={(event) => setTurmaId(event.target.value)}
                />
              </div>
            </Card>

            <Card>
              <CardHeader title="Fila de prioridade" subtitle="Clique em um aluno para abrir o detalhe" icon={<TrendingUp className="h-5 w-5" />} />
              <Table
                columns={columns}
                rows={rows}
                rowKey={(row) => row.aluno.id}
                onRowClick={(row) => navigate(`/app/alunos/${row.aluno.id}`)}
                emptyState={
                  <EmptyState
                    icon={<Lightbulb className="h-7 w-7" />}
                    title="Nenhum insight neste recorte"
                    description="Ajuste os filtros ou registre novas avaliacoes."
                  />
                }
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}
