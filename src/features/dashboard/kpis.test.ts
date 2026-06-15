import { describe, it, expect } from 'vitest'
import { computeKpis, rankByMetric } from './kpis'
import type { Aluno, RegistroMetricas } from '@/domain/types'

function metricas(over: Partial<RegistroMetricas> = {}): RegistroMetricas {
  return { flexibilidade: 20, potMMII: 150, potMS: 5, velocidade: 7, agilidade: 12, abdominal: 30, resistencia: 2500, ...over }
}

function aluno(over: Partial<Aluno>): Aluno {
  return {
    id: 'a', nome: 'X', genero: 'masculino', dataNascimento: '2010-01-01', turmaId: null,
    peso: 60, altura: 1.7, cintura: 0.7, idade: 16, imc: 20.8, rce: 0.41,
    classificacaoImc: 'Normal', metricas: metricas(), createdAt: '2026-01-01', ...over,
  }
}

describe('computeKpis', () => {
  it('aggregates totals, means and distributions', () => {
    const alunos = [
      aluno({ id: '1', genero: 'masculino', idade: 16, imc: 20, classificacaoImc: 'Normal' }),
      aluno({ id: '2', genero: 'feminino', idade: 18, imc: 26, classificacaoImc: 'Sobrepeso' }),
    ]
    const k = computeKpis(alunos)
    expect(k.total).toBe(2)
    expect(k.mediaIdade).toBe(17)
    expect(k.mediaImc).toBe(23)
    expect(k.genderData).toEqual([
      { name: 'Masculino', value: 1 },
      { name: 'Feminino', value: 1 },
    ])
    expect(k.imcData.find((d) => d.name === 'Sobrepeso')?.value).toBe(1)
  })

  it('handles empty input without throwing', () => {
    const k = computeKpis([])
    expect(k.total).toBe(0)
    expect(k.mediaImc).toBe(0)
  })
})

describe('rankByMetric', () => {
  it('orders descending metrics with higher first', () => {
    const alunos = [
      aluno({ id: 'low', metricas: metricas({ abdominal: 10 }) }),
      aluno({ id: 'high', metricas: metricas({ abdominal: 50 }) }),
    ]
    expect(rankByMetric(alunos, 'abdominal')[0].id).toBe('high')
  })
  it('orders ascending metrics with lower first', () => {
    const alunos = [
      aluno({ id: 'slow', metricas: metricas({ velocidade: 9 }) }),
      aluno({ id: 'fast', metricas: metricas({ velocidade: 5 }) }),
    ]
    expect(rankByMetric(alunos, 'velocidade')[0].id).toBe('fast')
  })
})
