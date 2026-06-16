import { describe, expect, it } from 'vitest'
import type { Aluno, Avaliacao, RegistroMetricas, Turma } from '@/domain/types'
import { buildAlunoFocus, buildInsights, compareMetricChange } from './insights'

const metricas = (over: Partial<RegistroMetricas> = {}): RegistroMetricas => ({
  flexibilidade: 20,
  potMMII: 140,
  potMS: 5,
  velocidade: 7,
  agilidade: 12,
  abdominal: 30,
  resistencia: 2400,
  ...over,
})

function aluno(over: Partial<Aluno>): Aluno {
  return {
    id: 'a1',
    nome: 'Ana Silva',
    genero: 'feminino',
    dataNascimento: '2010-01-01',
    turmaId: 't1',
    peso: 60,
    altura: 1.65,
    cintura: 0.74,
    idade: 16,
    imc: 22,
    rce: 0.45,
    classificacaoImc: 'Normal',
    metricas: metricas(),
    createdAt: '2026-01-01',
    ...over,
  }
}

function avaliacao(over: Partial<Avaliacao>): Avaliacao {
  return {
    id: 'v1',
    alunoId: 'a1',
    data: '2026-06-01',
    mesReferencia: 'Junho',
    anoReferencia: 2026,
    observacoes: null,
    peso: 60,
    altura: 1.65,
    cintura: 0.74,
    imc: 22,
    rce: 0.45,
    metricas: metricas(),
    ...over,
  }
}

const turmas: Turma[] = [
  { id: 't1', nome: '7A', anoLetivo: 2026, professorId: 'p1', createdAt: '2026-01-01' },
]

describe('compareMetricChange', () => {
  it('treats lower velocity as improvement and higher velocity as regression', () => {
    expect(compareMetricChange('velocidade', 7.4, 6.9)?.direction).toBe('improved')
    expect(compareMetricChange('velocidade', 6.9, 7.4)?.direction).toBe('regressed')
  })

  it('treats higher abdominal count as improvement and lower count as regression', () => {
    expect(compareMetricChange('abdominal', 20, 28)?.direction).toBe('improved')
    expect(compareMetricChange('abdominal', 28, 20)?.direction).toBe('regressed')
  })
})

describe('buildInsights', () => {
  it('identifies overdue students, regressions and highlights from real evaluation history', () => {
    const alunos = [
      aluno({ id: 'late', nome: 'Aluno Atrasado' }),
      aluno({ id: 'risk', nome: 'Aluno Regressao' }),
      aluno({ id: 'star', nome: 'Aluno Destaque' }),
    ]

    const avaliacoes = [
      avaliacao({ id: 'late-old', alunoId: 'late', data: '2026-03-01' }),
      avaliacao({ id: 'risk-prev', alunoId: 'risk', data: '2026-05-01', metricas: metricas({ velocidade: 6.8 }) }),
      avaliacao({ id: 'risk-now', alunoId: 'risk', data: '2026-06-10', metricas: metricas({ velocidade: 7.5 }) }),
      avaliacao({ id: 'star-prev', alunoId: 'star', data: '2026-05-01', metricas: metricas({ abdominal: 20 }) }),
      avaliacao({ id: 'star-now', alunoId: 'star', data: '2026-06-11', metricas: metricas({ abdominal: 32 }) }),
    ]

    const result = buildInsights({ alunos, turmas, avaliacoes, today: '2026-06-16' })

    expect(result.summary.overdue).toBe(1)
    expect(result.summary.regressions).toBe(1)
    expect(result.summary.highlights).toBe(1)
    expect(result.rows.find((row) => row.aluno.id === 'late')?.status).toBe('overdue')
    expect(result.rows.find((row) => row.aluno.id === 'risk')?.regressions[0].metric).toBe('velocidade')
    expect(result.rows.find((row) => row.aluno.id === 'star')?.status).toBe('highlight')
  })
})

describe('buildAlunoFocus', () => {
  it('prioritizes regressed metrics as next focus for the aluno view', () => {
    const focus = buildAlunoFocus(
      aluno({ id: 'a1' }),
      [
        avaliacao({ id: 'prev', data: '2026-05-01', metricas: metricas({ velocidade: 6.8, abdominal: 24 }) }),
        avaliacao({ id: 'now', data: '2026-06-10', metricas: metricas({ velocidade: 7.4, abdominal: 30 }) }),
      ],
      '2026-06-16',
    )

    expect(focus.status).toBe('attention')
    expect(focus.items[0].metric).toBe('velocidade')
    expect(focus.items[0].tone).toBe('danger')
  })

  it('asks for a new evaluation when the aluno has insufficient history', () => {
    const focus = buildAlunoFocus(aluno({ id: 'a1' }), [avaliacao({ id: 'only' })], '2026-06-16')

    expect(focus.status).toBe('empty')
    expect(focus.items[0].label).toContain('Nova avaliacao')
  })
})
