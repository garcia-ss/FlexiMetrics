import { describe, expect, it } from 'vitest'
import { alunoToRow, avaliacaoInputToRow, rowToAluno, rowToTurma, turmaToRow } from './mappers'
import type { AlunoInput } from '@/domain/types'

const metricas = {
  flexibilidade: 22,
  potMMII: 145,
  potMS: 5,
  velocidade: 7,
  agilidade: 12,
  abdominal: 28,
  resistencia: 2400,
}

describe('Supabase mappers', () => {
  it('maps aluno rows without turning nullable numeric columns into invalid values', () => {
    const aluno = rowToAluno({
      id: 'aluno-1',
      nome: 'Ana Silva',
      matricula: 'MAT-001',
      genero: 'feminino',
      data_nascimento: '2010-01-15',
      turma_id: null,
      peso: null,
      altura: null,
      cintura: null,
      flexibilidade: null,
      pot_mmii: null,
      pot_ms: null,
      velocidade: null,
      agilidade: null,
      abdominal: null,
      resistencia: null,
      created_at: '2026-06-01T12:00:00Z',
    })

    expect(aluno.matricula).toBe('MAT-001')
    expect(aluno.peso).toBe(0)
    expect(aluno.altura).toBe(0)
    expect(aluno.imc).toBe(0)
    expect(aluno.rce).toBe(0)
    expect(aluno.metricas.flexibilidade).toBe(0)
  })

  it('serializes aluno input using the real Supabase column names', () => {
    const input: AlunoInput = {
      nome: 'Bruno Costa',
      matricula: 'MAT-002',
      genero: 'masculino',
      dataNascimento: '2009-04-20',
      turmaId: 'turma-1',
      peso: 70,
      altura: 1.75,
      cintura: 0.8,
      metricas,
    }

    expect(alunoToRow(input)).toMatchObject({
      nome: 'Bruno Costa',
      matricula: 'MAT-002',
      genero: 'masculino',
      data_nascimento: '2009-04-20',
      turma_id: 'turma-1',
      imc: 22.9,
      rce: 0.46,
      classificacao_imc: 'Normal',
      pot_mmii: 145,
      pot_ms: 5,
    })
  })

  it('keeps turma ano_letivo as an integer on reads and writes', () => {
    const turma = rowToTurma({
      id: 'turma-1',
      nome: '7A',
      ano_letivo: 2026,
      professor_id: 'prof-1',
      created_at: '2026-02-01T12:00:00Z',
    })

    expect(turma.anoLetivo).toBe(2026)
    expect(turmaToRow({ nome: '7A', anoLetivo: 2026 })).toEqual({
      nome: '7A',
      ano_letivo: 2026,
    })
  })

  it('derives avaliacao reference month and year from the evaluation date', () => {
    expect(
      avaliacaoInputToRow({
        alunoId: 'aluno-1',
        data: '2026-06-16',
        observacoes: null,
        peso: 70,
        altura: 1.75,
        cintura: 0.8,
        metricas,
      }),
    ).toMatchObject({
      aluno_id: 'aluno-1',
      mes_referencia: 'Junho',
      ano_referencia: 2026,
      imc: 22.9,
      rce: 0.46,
    })
  })
})
