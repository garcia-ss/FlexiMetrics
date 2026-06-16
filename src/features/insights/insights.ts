import type { BadgeTone } from '@/components/ui'
import { METRICAS, METRICA_BY_KEY, classificarImc } from '@/domain/metrics'
import type { Aluno, Avaliacao, MetricaKey, Turma } from '@/domain/types'

export type MetricDirection = 'improved' | 'regressed'
export type InsightStatus = 'overdue' | 'attention' | 'highlight' | 'stable' | 'empty'

export interface MetricChange {
  metric: MetricaKey
  label: string
  previous: number
  current: number
  delta: number
  direction: MetricDirection
  unit: string
}

export interface FocusItem {
  id: string
  label: string
  description: string
  tone: BadgeTone
  metric?: MetricaKey
}

export interface AlunoFocus {
  status: InsightStatus
  title: string
  subtitle: string
  items: FocusItem[]
}

export interface StudentInsightRow {
  aluno: Aluno
  turma: Turma | null
  status: InsightStatus
  statusLabel: string
  statusTone: BadgeTone
  lastEvaluationDate: string | null
  daysSinceLast: number | null
  regressions: MetricChange[]
  improvements: MetricChange[]
  focus: FocusItem
}

export interface InsightsResult {
  summary: {
    total: number
    overdue: number
    attention: number
    regressions: number
    highlights: number
  }
  rows: StudentInsightRow[]
}

const OVERDUE_DAYS = 45

function parseIsoDate(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function daysBetween(fromIso: string, toIso: string): number {
  const diffMs = parseIsoDate(toIso) - parseIsoDate(fromIso)
  return Math.max(0, Math.floor(diffMs / 86_400_000))
}

function sortByDateAsc(avaliacoes: Avaliacao[]): Avaliacao[] {
  return [...avaliacoes].sort((a, b) => parseIsoDate(a.data) - parseIsoDate(b.data))
}

function formatValue(value: number, unit: string): string {
  const decimals = unit === 's' ? 2 : 1
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })} ${unit}`
}

export function compareMetricChange(metric: MetricaKey, previous: number, current: number): MetricChange | null {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || previous === current) return null

  const def = METRICA_BY_KEY[metric]
  const rawDelta = current - previous
  const improved = def.order === 'asc' ? current < previous : current > previous

  return {
    metric,
    label: def.label,
    previous,
    current,
    delta: rawDelta,
    direction: improved ? 'improved' : 'regressed',
    unit: def.unit,
  }
}

function compareEvaluations(previous: Avaliacao, current: Avaliacao) {
  const changes = METRICAS.map((metric) =>
    compareMetricChange(metric.key, previous.metricas[metric.key], current.metricas[metric.key]),
  ).filter((item): item is MetricChange => Boolean(item))

  return {
    regressions: changes.filter((item) => item.direction === 'regressed'),
    improvements: changes.filter((item) => item.direction === 'improved'),
  }
}

function changeFocus(change: MetricChange, tone: BadgeTone): FocusItem {
  const prefix = change.direction === 'regressed' ? 'Recuperar' : 'Manter ganho em'
  const directionText = change.direction === 'regressed' ? 'piorou' : 'melhorou'

  return {
    id: `${change.direction}-${change.metric}`,
    label: `${prefix} ${change.label}`,
    description: `${formatValue(change.previous, change.unit)} para ${formatValue(change.current, change.unit)}: ${directionText} desde a avaliacao anterior.`,
    tone,
    metric: change.metric,
  }
}

function bodyFocusFromLatest(latest: Avaliacao): FocusItem | null {
  const imcInfo = classificarImc(latest.imc)
  if (imcInfo.label !== 'Normal') {
    return {
      id: 'body-imc',
      label: 'Acompanhar composicao corporal',
      description: `IMC atual em ${latest.imc.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}: ${imcInfo.label}.`,
      tone: imcInfo.tone,
    }
  }

  if (latest.rce >= 0.5) {
    return {
      id: 'body-rce',
      label: 'Reduzir risco cintura/altura',
      description: `RCE atual em ${latest.rce.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}. Priorize acompanhamento corporal.`,
      tone: 'warning',
    }
  }

  return null
}

function emptyFocus(message = 'Registre pelo menos duas avaliacoes para comparar evolucao.'): FocusItem {
  return {
    id: 'new-evaluation',
    label: 'Nova avaliacao',
    description: message,
    tone: 'info',
  }
}

export function buildAlunoFocus(aluno: Aluno, avaliacoes: Avaliacao[], today: string): AlunoFocus {
  const ordered = sortByDateAsc(avaliacoes.filter((avaliacao) => avaliacao.alunoId === aluno.id))
  const latest = ordered.at(-1)

  if (!latest) {
    return {
      status: 'empty',
      title: 'Sem historico',
      subtitle: 'Ainda nao ha avaliacoes registradas.',
      items: [emptyFocus('Registre a primeira avaliacao para iniciar a linha de evolucao.')],
    }
  }

  const daysSinceLast = daysBetween(latest.data, today)
  if (ordered.length < 2) {
    return {
      status: daysSinceLast > OVERDUE_DAYS ? 'overdue' : 'empty',
      title: daysSinceLast > OVERDUE_DAYS ? 'Avaliacao atrasada' : 'Historico inicial',
      subtitle: `Ultimo registro ha ${daysSinceLast} dia(s).`,
      items: [emptyFocus()],
    }
  }

  const previous = ordered.at(-2) as Avaliacao
  const { regressions, improvements } = compareEvaluations(previous, latest)
  const bodyFocus = bodyFocusFromLatest(latest)

  if (daysSinceLast > OVERDUE_DAYS) {
    return {
      status: 'overdue',
      title: 'Avaliacao atrasada',
      subtitle: `Ultimo registro ha ${daysSinceLast} dia(s).`,
      items: [emptyFocus('Atualize a avaliacao para confirmar se a tendencia continua.')],
    }
  }

  if (regressions.length) {
    return {
      status: 'attention',
      title: 'Foco de recuperacao',
      subtitle: `${regressions.length} metrica(s) pioraram desde a avaliacao anterior.`,
      items: regressions.slice(0, 3).map((change) => changeFocus(change, 'danger')),
    }
  }

  if (bodyFocus) {
    return {
      status: 'attention',
      title: 'Composicao em atencao',
      subtitle: 'Os indicadores corporais pedem acompanhamento.',
      items: [bodyFocus],
    }
  }

  if (improvements.length) {
    return {
      status: 'highlight',
      title: 'Boa evolucao',
      subtitle: `${improvements.length} metrica(s) melhoraram desde a avaliacao anterior.`,
      items: improvements.slice(0, 3).map((change) => changeFocus(change, 'success')),
    }
  }

  return {
    status: 'stable',
    title: 'Evolucao estavel',
    subtitle: 'Sem grandes variacoes entre as duas ultimas avaliacoes.',
    items: [
      {
        id: 'keep-consistency',
        label: 'Manter consistencia',
        description: 'Continue registrando avaliacoes para identificar tendencias com mais seguranca.',
        tone: 'neutral',
      },
    ],
  }
}

function statusMeta(status: InsightStatus): { label: string; tone: BadgeTone } {
  if (status === 'overdue') return { label: 'Atrasado', tone: 'warning' }
  if (status === 'attention') return { label: 'Atencao', tone: 'danger' }
  if (status === 'highlight') return { label: 'Destaque', tone: 'success' }
  if (status === 'empty') return { label: 'Sem historico', tone: 'info' }
  return { label: 'Estavel', tone: 'neutral' }
}

export function buildInsights({
  alunos,
  turmas,
  avaliacoes,
  today,
}: {
  alunos: Aluno[]
  turmas: Turma[]
  avaliacoes: Avaliacao[]
  today: string
}): InsightsResult {
  const turmaById = new Map(turmas.map((turma) => [turma.id, turma]))
  const avaliacoesByAluno = new Map<string, Avaliacao[]>()

  for (const avaliacao of avaliacoes) {
    const current = avaliacoesByAluno.get(avaliacao.alunoId) ?? []
    current.push(avaliacao)
    avaliacoesByAluno.set(avaliacao.alunoId, current)
  }

  const rows = alunos.map((aluno): StudentInsightRow => {
    const alunoAvaliacoes = avaliacoesByAluno.get(aluno.id) ?? []
    const focus = buildAlunoFocus(aluno, alunoAvaliacoes, today)
    const ordered = sortByDateAsc(alunoAvaliacoes)
    const latest = ordered.at(-1) ?? null
    const previous = ordered.at(-2) ?? null
    const changes = latest && previous ? compareEvaluations(previous, latest) : { regressions: [], improvements: [] }
    const meta = statusMeta(focus.status)

    return {
      aluno,
      turma: aluno.turmaId ? turmaById.get(aluno.turmaId) ?? null : null,
      status: focus.status,
      statusLabel: meta.label,
      statusTone: meta.tone,
      lastEvaluationDate: latest?.data ?? null,
      daysSinceLast: latest ? daysBetween(latest.data, today) : null,
      regressions: changes.regressions,
      improvements: changes.improvements,
      focus: focus.items[0],
    }
  })

  rows.sort((a, b) => {
    const priority: Record<InsightStatus, number> = { overdue: 0, attention: 1, empty: 2, highlight: 3, stable: 4 }
    const priorityDiff = priority[a.status] - priority[b.status]
    if (priorityDiff) return priorityDiff
    return a.aluno.nome.localeCompare(b.aluno.nome)
  })

  return {
    summary: {
      total: rows.length,
      overdue: rows.filter((row) => row.status === 'overdue').length,
      attention: rows.filter((row) => row.status === 'attention').length,
      regressions: rows.filter((row) => row.regressions.length > 0).length,
      highlights: rows.filter((row) => row.status === 'highlight').length,
    },
    rows,
  }
}
