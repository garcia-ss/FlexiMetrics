import { useMemo, useState } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  Select,
  Skeleton,
  Table,
  useToast,
} from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import { METRICAS } from '@/domain/metrics'
import type { Aluno, Avaliacao, RegistroMetricas } from '@/domain/types'
import type { AvaliacaoInput } from '@/data/repositories/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtDate, fmtNum } from '@/lib/format'

const todayIso = () => new Date().toISOString().slice(0, 10)

const emptyMetricas: RegistroMetricas = {
  flexibilidade: 20,
  potMMII: 145,
  potMS: 5,
  velocidade: 7.2,
  agilidade: 12,
  abdominal: 30,
  resistencia: 2500,
}

interface FormState {
  alunoId: string
  data: string
  observacoes: string
  peso: number
  altura: number
  cintura: number
  metricas: RegistroMetricas
}

function formFromAluno(aluno: Aluno | null): FormState {
  return {
    alunoId: aluno?.id ?? '',
    data: todayIso(),
    observacoes: '',
    peso: aluno?.peso ?? 70,
    altura: aluno?.altura ?? 1.7,
    cintura: aluno?.cintura ?? 0.78,
    metricas: aluno ? { ...aluno.metricas } : { ...emptyMetricas },
  }
}

function validate(form: FormState): string | null {
  if (!form.alunoId) return 'Selecione um aluno.'
  if (!form.data) return 'Informe a data da avaliacao.'
  if (form.peso <= 0 || form.altura <= 0 || form.cintura <= 0) return 'Composicao corporal invalida.'
  if (Object.values(form.metricas).some((value) => !Number.isFinite(value) || value <= 0)) {
    return 'Todas as metricas precisam ser maiores que zero.'
  }
  return null
}

export function AvaliacoesPage() {
  const toast = useToast()
  const [form, setForm] = useState<FormState>(() => formFromAluno(null))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, avaliacoes] = await Promise.all([data.alunos.list(), data.avaliacoes.listRecent(25)])
    return { alunos, avaliacoes }
  }, [])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const avaliacoes = useMemo(() => result?.avaliacoes ?? [], [result?.avaliacoes])
  const alunoById = useMemo(() => new Map(alunos.map((aluno) => [aluno.id, aluno])), [alunos])
  const selectedAluno = alunoById.get(form.alunoId) ?? null

  const selectAluno = (alunoId: string) => {
    setForm(formFromAluno(alunoById.get(alunoId) ?? null))
    setFormError(null)
  }

  const setMetric = (key: keyof RegistroMetricas, value: number) => {
    setForm((current) => ({ ...current, metricas: { ...current.metricas, [key]: value } }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validation = validate(form)
    if (validation) {
      setFormError(validation)
      return
    }

    const input: AvaliacaoInput = {
      alunoId: form.alunoId,
      data: form.data,
      observacoes: form.observacoes.trim() || null,
      peso: form.peso,
      altura: form.altura,
      cintura: form.cintura,
      metricas: form.metricas,
    }

    setSaving(true)
    try {
      await data.avaliacoes.create(input)
      toast.success('Avaliacao registrada.')
      const aluno = alunoById.get(form.alunoId) ?? null
      setForm(formFromAluno(aluno))
      reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Nao foi possivel registrar a avaliacao.')
    } finally {
      setSaving(false)
    }
  }

  const removeAvaliacao = async (avaliacao: Avaliacao) => {
    if (!window.confirm(`Remover avaliacao de ${fmtDate(avaliacao.data)}?`)) return
    await data.avaliacoes.remove(avaliacao.id)
    toast.success('Avaliacao removida.')
    reload()
  }

  const columns: Column<Avaliacao>[] = [
    {
      key: 'aluno',
      label: 'Aluno',
      render: (avaliacao) => (
        <div>
          <p className="font-semibold text-ink">{alunoById.get(avaliacao.alunoId)?.nome ?? 'Aluno removido'}</p>
          <p className="text-xs text-subtle">{fmtDate(avaliacao.data)}</p>
        </div>
      ),
    },
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
      <Topbar title="Avaliacoes" subtitle="Registro de metricas e composicao corporal" />

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,480px)_1fr]">
        <Card>
          <CardHeader
            title="Nova avaliacao"
            subtitle={selectedAluno ? `Baseada no ultimo registro de ${selectedAluno.nome}` : 'Selecione um aluno'}
            icon={<Plus className="h-5 w-5" />}
          />
          <form className="space-y-4 px-5 pb-5" onSubmit={submit}>
            {formError && (
              <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {formError}
              </div>
            )}
            <Select
              label="Aluno"
              value={form.alunoId}
              placeholder="Selecione"
              options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
              onChange={(event) => selectAluno(event.target.value)}
            />
            <Input type="date" label="Data" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                type="number"
                min="1"
                step="0.1"
                label="Peso"
                value={form.peso}
                onChange={(event) => setForm({ ...form, peso: Number(event.target.value) })}
              />
              <Input
                type="number"
                min="0.5"
                step="0.01"
                label="Altura"
                value={form.altura}
                onChange={(event) => setForm({ ...form, altura: Number(event.target.value) })}
              />
              <Input
                type="number"
                min="0.2"
                step="0.01"
                label="Cintura"
                value={form.cintura}
                onChange={(event) => setForm({ ...form, cintura: Number(event.target.value) })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {METRICAS.map((metric) => (
                <Input
                  key={metric.key}
                  type="number"
                  min="0"
                  step="0.1"
                  label={`${metric.short} (${metric.unit})`}
                  value={form.metricas[metric.key]}
                  onChange={(event) => setMetric(metric.key, Number(event.target.value))}
                />
              ))}
            </div>
            <div>
              <label htmlFor="observacoes" className="mb-1.5 block text-xs font-medium text-muted">
                Observacoes
              </label>
              <textarea
                id="observacoes"
                value={form.observacoes}
                onChange={(event) => setForm({ ...form, observacoes: event.target.value })}
                className="min-h-24 w-full rounded-[var(--radius-md)] border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-volt focus:ring-2 focus:ring-volt/30"
              />
            </div>
            <Button type="submit" loading={saving} leftIcon={<ClipboardList className="h-4 w-4" />} className="w-full">
              Registrar avaliacao
            </Button>
          </form>
        </Card>

        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-[620px]" />
        ) : (
          <Card>
            <CardHeader title="Avaliacoes recentes" subtitle={`${avaliacoes.length} ultimos registros`} />
            <Table
              columns={columns}
              rows={avaliacoes}
              rowKey={(avaliacao) => avaliacao.id}
              emptyState={
                <EmptyState
                  icon={<ClipboardList className="h-7 w-7" />}
                  title="Nenhuma avaliacao registrada"
                  description="Registre a primeira avaliacao para iniciar a linha de evolucao."
                />
              }
            />
          </Card>
        )}
      </div>
    </>
  )
}
