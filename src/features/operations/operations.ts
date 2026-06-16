import { METRICAS } from '@/domain/metrics'
import type { Aluno, AlunoInput, Avaliacao, Professor, RegistroMetricas, Turma, Usuario } from '@/domain/types'
import { buildAlunoFocus, buildInsights } from '@/features/insights/insights'

export interface ReportSummary {
  totalAlunos: number
  totalTurmas: number
  totalAvaliacoes: number
  mediaImc: number
  turmas: Array<{
    id: string
    nome: string
    alunos: number
    avaliacoes: number
    mediaImc: number
  }>
}

export interface DerivedGoal {
  id: string
  title: string
  description: string
  source: 'avaliacao' | 'composicao' | 'consistencia'
  priority: 'alta' | 'media' | 'baixa'
}

export interface DerivedNotification {
  id: string
  kind: 'overdue' | 'attention' | 'highlight' | 'empty'
  title: string
  description: string
  alunoId: string
  turmaId: string | null
}

export interface AdminSummary {
  usuarios: number
  professores: number
  alunos: number
  turmas: number
  avaliacoes: number
  usuariosSemVinculo: number
}

const emptyMetricas = (): RegistroMetricas => ({
  flexibilidade: 0,
  potMMII: 0,
  potMS: 0,
  velocidade: 0,
  agilidade: 0,
  abdominal: 0,
  resistencia: 0,
})

function average(values: number[]): number {
  if (!values.length) return 0
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export function buildReportSummary({
  alunos,
  turmas,
  avaliacoes,
}: {
  alunos: Aluno[]
  turmas: Turma[]
  avaliacoes: Avaliacao[]
}): ReportSummary {
  return {
    totalAlunos: alunos.length,
    totalTurmas: turmas.length,
    totalAvaliacoes: avaliacoes.length,
    mediaImc: average(alunos.map((aluno) => aluno.imc)),
    turmas: turmas.map((turma) => {
      const turmaAlunos = alunos.filter((aluno) => aluno.turmaId === turma.id)
      const turmaIds = new Set(turmaAlunos.map((aluno) => aluno.id))
      const turmaAvaliacoes = avaliacoes.filter((avaliacao) => turmaIds.has(avaliacao.alunoId))
      return {
        id: turma.id,
        nome: turma.nome,
        alunos: turmaAlunos.length,
        avaliacoes: turmaAvaliacoes.length,
        mediaImc: average(turmaAlunos.map((aluno) => aluno.imc)),
      }
    }),
  }
}

export function buildDerivedGoals(aluno: Aluno, avaliacoes: Avaliacao[], today: string): DerivedGoal[] {
  const focus = buildAlunoFocus(aluno, avaliacoes, today)
  const goals: DerivedGoal[] = focus.items.map((item) => ({
    id: item.id,
    title: item.label,
    description: item.description,
    source: item.metric ? 'avaliacao' : item.id.startsWith('body') ? 'composicao' : 'consistencia',
    priority: focus.status === 'attention' || focus.status === 'overdue' ? 'alta' : focus.status === 'highlight' ? 'baixa' : 'media',
  }))

  if (aluno.classificacaoImc !== 'Normal' && !goals.some((goal) => goal.source === 'composicao')) {
    goals.push({
      id: 'composicao-corporal',
      title: 'Acompanhar composicao corporal',
      description: `Classificacao atual: ${aluno.classificacaoImc}. Use as proximas avaliacoes para monitorar tendencia.`,
      source: 'composicao',
      priority: 'media',
    })
  }

  return goals
}

export function buildNotifications({
  alunos,
  turmas,
  avaliacoes,
  today,
}: {
  alunos: Aluno[]
  turmas: Turma[]
  avaliacoes: Avaliacao[]
  today: string
}): DerivedNotification[] {
  const insights = buildInsights({ alunos, turmas, avaliacoes, today })
  return insights.rows
    .filter((row) => row.status === 'overdue' || row.status === 'attention' || row.status === 'highlight' || row.status === 'empty')
    .map((row) => ({
      id: `${row.status}-${row.aluno.id}`,
      kind: row.status === 'stable' ? 'attention' : row.status,
      title: row.statusLabel,
      description: `${row.aluno.nome}: ${row.focus.label}. ${row.focus.description}`,
      alunoId: row.aluno.id,
      turmaId: row.aluno.turmaId,
    }))
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replaceAll(' ', '_')
}

function parseNumber(value: string): number {
  const normalized = value.trim().replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function parseAlunoCsv(csv: string, turmas: Turma[]): AlunoInput[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(normalizeHeader)
  const turmaByName = new Map(turmas.map((turma) => [turma.nome.trim().toLowerCase(), turma.id]))

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim())
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
    const peso = parseNumber(row.peso)
    const altura = parseNumber(row.altura)
    const cintura = parseNumber(row.cintura)

    return {
      nome: row.nome || 'Aluno sem nome',
      matricula: row.matricula || null,
      genero: row.genero === 'masculino' || row.genero === 'feminino' || row.genero === 'outro' ? row.genero : 'outro',
      dataNascimento: row.data_nascimento || row.nascimento || '2010-01-01',
      turmaId: turmaByName.get((row.turma ?? '').toLowerCase()) ?? null,
      peso,
      altura,
      cintura,
      metricas: METRICAS.reduce((acc, metrica) => {
        acc[metrica.key] = parseNumber(row[metrica.key.toLowerCase()] ?? '')
        return acc
      }, emptyMetricas()),
    }
  })
}

export function buildAdminSummary({
  usuarios,
  professores,
  turmas,
  alunos,
  avaliacoes,
}: {
  usuarios: Usuario[]
  professores: Professor[]
  turmas: Turma[]
  alunos: Aluno[]
  avaliacoes: Avaliacao[]
}): AdminSummary {
  return {
    usuarios: usuarios.length,
    professores: professores.length,
    alunos: alunos.length,
    turmas: turmas.length,
    avaliacoes: avaliacoes.length,
    usuariosSemVinculo: usuarios.filter((usuario) => usuario.perfil === 'aluno' && !usuario.alunoId).length,
  }
}

export function alunoCsvRows(alunos: Aluno[], turmas: Turma[]): Array<Array<string | number>> {
  const turmaById = new Map(turmas.map((turma) => [turma.id, turma.nome]))
  return alunos.map((aluno) => [
    aluno.nome,
    aluno.matricula ?? '',
    aluno.genero,
    aluno.turmaId ? turmaById.get(aluno.turmaId) ?? 'Sem turma' : 'Sem turma',
    aluno.idade,
    aluno.imc,
    aluno.rce,
  ])
}
