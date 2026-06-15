import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Activity, ArrowLeft, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  MiniStat,
  Skeleton,
  Table,
  Dropdown,
  DropdownItem,
  useToast,
} from '@/components/ui'
import type { Column } from '@/components/ui'
import { LineEvolution } from '@/components/charts'
import { data } from '@/data'
import { METRICAS, METRICA_BY_KEY, classificarImc } from '@/domain/metrics'
import type { AlunoInput, Avaliacao, MetricaKey } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtDate, fmtMonthShort, fmtNum } from '@/lib/format'
import { AlunoFormModal } from './AlunoFormModal'

export function AlunoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [metric, setMetric] = useState<MetricaKey | 'imc'>('imc')
  const [editing, setEditing] = useState(false)

  const { data: result, loading, error, reload } = useAsync(async () => {
    if (!id) return null
    const [aluno, turmas, avaliacoes, evolution] = await Promise.all([
      data.alunos.get(id),
      data.turmas.list(),
      data.avaliacoes.listByAluno(id),
      data.alunos.evolution(id),
    ])
    return { aluno, turmas, avaliacoes, evolution }
  }, [id])

  const aluno = result?.aluno ?? null
  const turmas = result?.turmas ?? []
  const avaliacoes = result?.avaliacoes ?? []
  const turma = aluno?.turmaId ? turmas.find((t) => t.id === aluno.turmaId) : null
  const cls = aluno ? classificarImc(aluno.imc) : null
  const metricLabel = metric === 'imc' ? 'IMC' : METRICA_BY_KEY[metric].label

  const chartData = useMemo(() => {
    return (result?.evolution ?? []).map((point) => ({
      label: fmtMonthShort(point.mesReferencia, point.anoReferencia),
      valor: metric === 'imc' ? point.imc : point.metricas[metric],
    }))
  }, [metric, result?.evolution])

  const saveAluno = async (input: AlunoInput) => {
    if (!aluno) return
    await data.alunos.update(aluno.id, input)
    toast.success('Aluno atualizado.')
    reload()
  }

  const removeAluno = async () => {
    if (!aluno) return
    if (!window.confirm(`Remover ${aluno.nome}? As avaliacoes vinculadas tambem serao removidas.`)) return
    await data.alunos.remove(aluno.id)
    toast.success('Aluno removido.')
    navigate('/app/alunos', { replace: true })
  }

  const removeAvaliacao = async (avaliacao: Avaliacao) => {
    if (!window.confirm(`Remover avaliacao de ${fmtDate(avaliacao.data)}?`)) return
    await data.avaliacoes.remove(avaliacao.id)
    toast.success('Avaliacao removida.')
    reload()
  }

  const columns: Column<Avaliacao>[] = [
    { key: 'data', label: 'Data', render: (avaliacao) => fmtDate(avaliacao.data) },
    { key: 'periodo', label: 'Periodo', render: (avaliacao) => `${avaliacao.mesReferencia}/${avaliacao.anoReferencia}` },
    { key: 'imc', label: 'IMC', align: 'right', render: (avaliacao) => fmtNum(avaliacao.imc) },
    { key: 'rce', label: 'RCE', align: 'right', render: (avaliacao) => fmtNum(avaliacao.rce, 2) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (avaliacao) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remover avaliacao"
          onClick={() => void removeAvaliacao(avaliacao)}
        >
          <Trash2 className="h-4 w-4 text-danger" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <Topbar
        title={aluno?.nome ?? 'Detalhe do aluno'}
        subtitle={turma?.nome ?? 'Acompanhamento individual'}
        actions={
          <>
            <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/app/alunos')}>
              Voltar
            </Button>
            {aluno && (
              <>
                <Button variant="secondary" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => setEditing(true)}>
                  Editar
                </Button>
                <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => void removeAluno()}>
                  Remover
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-96" />
          </div>
        ) : !aluno ? (
          <Card>
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="Aluno nao encontrado"
              description="O registro pode ter sido removido ou nao esta disponivel."
              action={<Button onClick={() => navigate('/app/alunos')}>Voltar para alunos</Button>}
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Card className="p-5 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Perfil</p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{aluno.nome}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="neutral">{aluno.idade} anos</Badge>
                  <Badge tone="neutral">{aluno.genero}</Badge>
                  <Badge tone="volt">{turma?.nome ?? 'Sem turma'}</Badge>
                </div>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Classificacao IMC</p>
                <div className="mt-3">{cls && <Badge tone={cls.tone}>{cls.label}</Badge>}</div>
                <p className="mt-3 text-sm text-subtle">IMC {fmtNum(aluno.imc)} kg/m2</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Composicao</p>
                <p className="mt-2 text-sm text-muted">Peso {fmtNum(aluno.peso)} kg</p>
                <p className="text-sm text-muted">Altura {fmtNum(aluno.altura, 2)} m</p>
                <p className="text-sm text-muted">RCE {fmtNum(aluno.rce, 2)}</p>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {METRICAS.map((m) => (
                <MiniStat key={m.key} label={m.short} value={fmtNum(aluno.metricas[m.key], 1)} unit={m.unit} />
              ))}
            </div>

            <Card>
              <CardHeader
                title={`Evolucao · ${metricLabel}`}
                subtitle="Serie historica das avaliacoes registradas"
                action={
                  <Dropdown
                    align="right"
                    trigger={({ toggle }) => (
                      <button
                        onClick={toggle}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line px-3 py-1.5 text-sm text-ink hover:bg-elevated cursor-pointer"
                      >
                        {metricLabel}
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                  >
                    {(close) => (
                      <>
                        <DropdownItem active={metric === 'imc'} onClick={() => { setMetric('imc'); close() }}>
                          IMC
                        </DropdownItem>
                        {METRICAS.map((m) => (
                          <DropdownItem key={m.key} active={metric === m.key} onClick={() => { setMetric(m.key); close() }}>
                            {m.label}
                          </DropdownItem>
                        ))}
                      </>
                    )}
                  </Dropdown>
                }
              />
              <div className="h-80 px-5 pb-5">
                {chartData.length > 1 ? (
                  <LineEvolution data={chartData} xKey="label" series={[{ key: 'valor', label: metricLabel }]} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-subtle">
                    Dados insuficientes para visualizar evolucao.
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Historico de avaliacoes" subtitle={`${avaliacoes.length} registros`} />
              <Table columns={columns} rows={avaliacoes} rowKey={(avaliacao) => avaliacao.id} />
            </Card>
          </>
        )}
      </div>

      <AlunoFormModal
        open={editing}
        aluno={aluno}
        turmas={turmas}
        onClose={() => setEditing(false)}
        onSubmit={saveAluno}
      />
    </>
  )
}
