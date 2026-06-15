import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Medal, Trophy, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Badge, Card, CardHeader, EmptyState, ErrorState, Select, Skeleton, StatCard, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import { METRICAS, METRICA_BY_KEY } from '@/domain/metrics'
import type { Aluno, Genero, MetricaKey } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtNum } from '@/lib/format'
import { rankByMetric } from './kpis'

const medalTone = (index: number) => (index === 0 ? 'volt' : index === 1 ? 'info' : index === 2 ? 'warning' : 'neutral')

export function RankingPage() {
  const navigate = useNavigate()
  const [metric, setMetric] = useState<MetricaKey>('abdominal')
  const [turmaId, setTurmaId] = useState('')
  const [genero, setGenero] = useState<Genero | ''>('')

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, turmas] = await Promise.all([data.alunos.list(), data.turmas.list()])
    return { alunos, turmas }
  }, [])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const turmaById = useMemo(() => new Map(turmas.map((turma) => [turma.id, turma])), [turmas])
  const def = METRICA_BY_KEY[metric]

  const filtered = useMemo(() => {
    return alunos.filter((aluno) => {
      if (turmaId && aluno.turmaId !== turmaId) return false
      if (genero && aluno.genero !== genero) return false
      return true
    })
  }, [alunos, genero, turmaId])

  const ranked = useMemo(() => rankByMetric(filtered, metric, 50), [filtered, metric])
  const leader = ranked[0]

  const columns: Column<Aluno>[] = [
    {
      key: 'posicao',
      label: '#',
      render: (aluno) => {
        const index = ranked.findIndex((item) => item.id === aluno.id)
        return <Badge tone={medalTone(index)}>{index + 1}</Badge>
      },
    },
    {
      key: 'nome',
      label: 'Aluno',
      render: (aluno) => (
        <div>
          <p className="font-semibold text-ink">{aluno.nome}</p>
          <p className="text-xs text-subtle">{turmaById.get(aluno.turmaId ?? '')?.nome ?? 'Sem turma'}</p>
        </div>
      ),
    },
    { key: 'idade', label: 'Idade', align: 'right', render: (aluno) => `${aluno.idade} anos` },
    {
      key: 'valor',
      label: def.label,
      align: 'right',
      render: (aluno) => (
        <span className="tabular font-bold text-volt">
          {fmtNum(aluno.metricas[metric], def.unit === 's' ? 2 : 1)} {def.unit}
        </span>
      ),
    },
  ]

  return (
    <>
      <Topbar title="Ranking" subtitle="Comparacao por metrica fisica" />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Recorte" value={filtered.length} icon={<Users className="h-5 w-5" />} subtitle="alunos considerados" />
          <StatCard label="Metrica" value={def.short} icon={<Trophy className="h-5 w-5" />} accent subtitle={def.label} />
          <StatCard label="Lider" value={leader ? fmtNum(leader.metricas[metric], def.unit === 's' ? 2 : 1) : '0'} icon={<Medal className="h-5 w-5" />} subtitle={leader?.nome ?? 'Sem dados'} />
        </div>

        <Card>
          <CardHeader title="Filtros do ranking" subtitle={def.order === 'asc' ? 'Menor valor vence nesta metrica' : 'Maior valor vence nesta metrica'} />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
            <Select
              label="Metrica"
              value={metric}
              options={METRICAS.map((item) => ({ value: item.key, label: item.label }))}
              onChange={(event) => setMetric(event.target.value as MetricaKey)}
            />
            <Select
              label="Turma"
              placeholder="Todas"
              value={turmaId}
              options={turmas.map((turma) => ({ value: turma.id, label: turma.nome }))}
              onChange={(event) => setTurmaId(event.target.value)}
            />
            <Select
              label="Genero"
              placeholder="Todos"
              value={genero}
              options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'feminino', label: 'Feminino' },
                { value: 'outro', label: 'Outro' },
              ]}
              onChange={(event) => setGenero((event.target.value || '') as Genero | '')}
            />
          </div>
        </Card>

        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <CardHeader title={`Top ${ranked.length} · ${def.label}`} subtitle="Clique em um aluno para abrir o detalhe" />
            <Table
              columns={columns}
              rows={ranked}
              rowKey={(aluno) => aluno.id}
              onRowClick={(aluno) => navigate(`/app/alunos/${aluno.id}`)}
              emptyState={
                <EmptyState
                  icon={<Trophy className="h-7 w-7" />}
                  title="Sem alunos no ranking"
                  description="Ajuste os filtros para comparar alunos."
                />
              }
            />
          </Card>
        )}
      </div>
    </>
  )
}
