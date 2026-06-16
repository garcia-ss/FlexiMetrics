import { describe, expect, it } from 'vitest'
import type { Aluno, Avaliacao, Professor, RegistroMetricas, Turma, Usuario } from '@/domain/types'
import {
  buildAdminSummary,
  buildDerivedGoals,
  buildNotifications,
  buildReportSummary,
  parseAlunoCsv,
} from './operations'

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
    nome: 'Ana',
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

const turmas: Turma[] = [{ id: 't1', nome: '7A', anoLetivo: 2026, professorId: 'p1', createdAt: '2026-01-01' }]

describe('operations helpers', () => {
  it('builds report summary from alunos, turmas and avaliacoes', () => {
    const report = buildReportSummary({
      alunos: [aluno({ id: 'a1' }), aluno({ id: 'a2', nome: 'Bia', imc: 28, classificacaoImc: 'Sobrepeso' })],
      turmas,
      avaliacoes: [avaliacao({ alunoId: 'a1' }), avaliacao({ alunoId: 'a2', id: 'v2' })],
    })

    expect(report.totalAlunos).toBe(2)
    expect(report.totalAvaliacoes).toBe(2)
    expect(report.turmas[0].nome).toBe('7A')
    expect(report.turmas[0].alunos).toBe(2)
  })

  it('derives goals from regressions and body composition without persistence', () => {
    const goals = buildDerivedGoals(
      aluno({ id: 'a1', imc: 28, classificacaoImc: 'Sobrepeso' }),
      [
        avaliacao({ id: 'prev', data: '2026-05-01', metricas: metricas({ velocidade: 6.8 }) }),
        avaliacao({ id: 'now', data: '2026-06-01', metricas: metricas({ velocidade: 7.4 }), imc: 28 }),
      ],
      '2026-06-16',
    )

    expect(goals[0].source).toBe('avaliacao')
    expect(goals.some((goal) => goal.title.includes('composicao'))).toBe(true)
  })

  it('derives notifications for overdue evaluations and highlights', () => {
    const notifications = buildNotifications({
      alunos: [aluno({ id: 'late', nome: 'Aluno Atrasado' }), aluno({ id: 'star', nome: 'Aluno Destaque' })],
      turmas,
      avaliacoes: [
        avaliacao({ alunoId: 'late', id: 'old', data: '2026-03-01' }),
        avaliacao({ alunoId: 'star', id: 'p', data: '2026-05-01', metricas: metricas({ abdominal: 10 }) }),
        avaliacao({ alunoId: 'star', id: 'n', data: '2026-06-01', metricas: metricas({ abdominal: 30 }) }),
      ],
      today: '2026-06-16',
    })

    expect(notifications.some((item) => item.kind === 'overdue')).toBe(true)
    expect(notifications.some((item) => item.kind === 'highlight')).toBe(true)
  })

  it('parses CSV aluno rows into AlunoInput objects', () => {
    const rows = parseAlunoCsv(
      'nome,matricula,genero,data_nascimento,turma,peso,altura,cintura\nAna Silva,001,feminino,2010-01-01,7A,60,1.65,0.74',
      turmas,
    )

    expect(rows[0].nome).toBe('Ana Silva')
    expect(rows[0].matricula).toBe('001')
    expect(rows[0].turmaId).toBe('t1')
  })

  it('builds admin summary from existing public tables', () => {
    const usuarios: Usuario[] = [
      { id: 'u1', nome: 'Prof', email: 'p@test.com', perfil: 'professor' },
      { id: 'u2', nome: 'Aluno', email: 'a@test.com', perfil: 'aluno', alunoId: null },
    ]
    const professores: Professor[] = [{ id: 'u1', nome: 'Prof', email: 'p@test.com', escola: 'CEUB', createdAt: '2026-01-01' }]

    const summary = buildAdminSummary({ usuarios, professores, turmas, alunos: [aluno({})], avaliacoes: [avaliacao({})] })

    expect(summary.usuariosSemVinculo).toBe(1)
    expect(summary.professores).toBe(1)
    expect(summary.avaliacoes).toBe(1)
  })
})
