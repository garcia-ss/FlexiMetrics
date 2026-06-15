import { describe, it, expect } from 'vitest'
import { calcImc, calcRce, classificarImc, idadeFrom, METRICAS } from './metrics'

describe('calcImc', () => {
  it('computes BMI rounded to 1 decimal', () => {
    expect(calcImc(70, 1.75)).toBe(22.9) // 22.857 -> 22.9
    expect(calcImc(90, 1.8)).toBe(27.8)
  })
  it('guards against zero height', () => {
    expect(calcImc(70, 0)).toBe(0)
  })
})

describe('calcRce', () => {
  it('computes waist/height to 2 decimals', () => {
    expect(calcRce(0.8, 1.75)).toBe(0.46)
  })
})

describe('classificarImc', () => {
  it('classifies across boundaries', () => {
    expect(classificarImc(17).label).toBe('Abaixo do peso')
    expect(classificarImc(18.5).label).toBe('Normal')
    expect(classificarImc(24.9).label).toBe('Normal')
    expect(classificarImc(27).label).toBe('Sobrepeso')
    expect(classificarImc(29.9).label).toBe('Sobrepeso')
    expect(classificarImc(31).label).toBe('Obesidade')
  })
})

describe('idadeFrom', () => {
  it('computes whole-year age relative to reference', () => {
    expect(idadeFrom('2010-06-15', '2026-06-15')).toBe(16)
    expect(idadeFrom('2010-06-16', '2026-06-15')).toBe(15) // birthday not yet reached
  })
})

describe('METRICAS', () => {
  it('declares 7 physical metrics with defined order', () => {
    expect(METRICAS).toHaveLength(7)
    for (const m of METRICAS) expect(['asc', 'desc']).toContain(m.order)
  })
})
