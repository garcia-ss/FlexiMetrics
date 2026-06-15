import type { ClassificacaoImc, MetricaKey } from './types'
import type { BadgeTone } from '@/components/ui/Badge'

/** Round to n decimals returning a number. */
function round(value: number, decimals = 2): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

/** Body Mass Index = weight(kg) / height(m)^2. */
export function calcImc(pesoKg: number, alturaM: number): number {
  if (!alturaM) return 0
  return round(pesoKg / (alturaM * alturaM), 1)
}

/** Waist-to-height ratio = waist(m) / height(m). */
export function calcRce(cinturaM: number, alturaM: number): number {
  if (!alturaM) return 0
  return round(cinturaM / alturaM, 2)
}

export interface ClassificacaoImcInfo {
  label: ClassificacaoImc
  tone: BadgeTone
}

export function classificarImc(imc: number): ClassificacaoImcInfo {
  if (imc < 18.5) return { label: 'Abaixo do peso', tone: 'warning' }
  if (imc <= 24.9) return { label: 'Normal', tone: 'success' }
  if (imc <= 29.9) return { label: 'Sobrepeso', tone: 'warning' }
  return { label: 'Obesidade', tone: 'danger' }
}

/** Whole-year age from an ISO birth date relative to a reference date (default: now via param). */
export function idadeFrom(dataNascimento: string, refIso: string): number {
  const birth = new Date(dataNascimento)
  const ref = new Date(refIso)
  let age = ref.getFullYear() - birth.getFullYear()
  const m = ref.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

export interface MetricaDef {
  key: MetricaKey
  label: string
  short: string
  unit: string
  /** 'desc' = higher is better; 'asc' = lower is better. */
  order: 'asc' | 'desc'
}

export const METRICAS: MetricaDef[] = [
  { key: 'flexibilidade', label: 'Flexibilidade', short: 'Flex.', unit: 'cm', order: 'desc' },
  { key: 'potMMII', label: 'Potência MMII', short: 'Pot. MMII', unit: 'cm', order: 'desc' },
  { key: 'potMS', label: 'Potência MS', short: 'Pot. MS', unit: 'm', order: 'desc' },
  { key: 'velocidade', label: 'Velocidade', short: 'Vel.', unit: 's', order: 'asc' },
  { key: 'agilidade', label: 'Agilidade', short: 'Agil.', unit: 's', order: 'asc' },
  { key: 'abdominal', label: 'Abdominal', short: 'Abd.', unit: 'rep', order: 'desc' },
  { key: 'resistencia', label: 'Resistência', short: 'Resist.', unit: 'ml/kg', order: 'desc' },
]

export const METRICA_BY_KEY: Record<MetricaKey, MetricaDef> = Object.fromEntries(
  METRICAS.map((m) => [m.key, m]),
) as Record<MetricaKey, MetricaDef>
