import type { Aluno, Avaliacao, MetricaKey } from '@/domain/types'
import { METRICAS } from '@/domain/metrics'
import type { DonutDatum } from '@/components/charts'
import type { RadarDatum } from '@/components/charts'

function mean(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

const round = (v: number, d = 1) => {
  const f = 10 ** d
  return Math.round(v * f) / f
}

export interface DashboardKpis {
  total: number
  mediaIdade: number
  mediaImc: number
  mediaMetricas: Record<MetricaKey, number>
  genderData: DonutDatum[]
  imcData: DonutDatum[]
  radar: RadarDatum[]
}

export function computeKpis(alunos: Aluno[]): DashboardKpis {
  const total = alunos.length

  const mediaMetricas = Object.fromEntries(
    METRICAS.map((m) => [m.key, round(mean(alunos.map((a) => a.metricas[m.key])), 1)]),
  ) as Record<MetricaKey, number>

  const generoCount = { masculino: 0, feminino: 0, outro: 0 }
  for (const a of alunos) generoCount[a.genero]++
  const genderData: DonutDatum[] = [
    { name: 'Masculino', value: generoCount.masculino },
    { name: 'Feminino', value: generoCount.feminino },
    { name: 'Outro', value: generoCount.outro },
  ].filter((d) => d.value > 0)

  const imcBuckets: Record<string, number> = { 'Abaixo do peso': 0, Normal: 0, Sobrepeso: 0, Obesidade: 0 }
  for (const a of alunos) imcBuckets[a.classificacaoImc]++
  const imcData: DonutDatum[] = Object.entries(imcBuckets).map(([name, value]) => ({ name, value }))

  const masc = alunos.filter((a) => a.genero === 'masculino')
  const fem = alunos.filter((a) => a.genero === 'feminino')
  const radar: RadarDatum[] = METRICAS.map((m) => {
    const mM = mean(masc.map((a) => a.metricas[m.key]))
    const mF = mean(fem.map((a) => a.metricas[m.key]))
    let sM: number
    let sF: number
    if (m.order === 'desc') {
      const base = Math.max(mM, mF) || 1
      sM = (mM / base) * 100
      sF = (mF / base) * 100
    } else {
      const base = Math.min(mM, mF) || 1
      sM = mM ? (base / mM) * 100 : 0
      sF = mF ? (base / mF) * 100 : 0
    }
    return { subject: m.short, masculino: round(sM, 0), feminino: round(sF, 0) }
  })

  return {
    total,
    mediaIdade: round(mean(alunos.map((a) => a.idade)), 1),
    mediaImc: round(mean(alunos.map((a) => a.imc)), 1),
    mediaMetricas,
    genderData,
    imcData,
    radar,
  }
}

/** Ranking by a single metric respecting whether higher/lower is better. */
export function rankByMetric(alunos: Aluno[], key: MetricaKey, limit = 10): Aluno[] {
  const def = METRICAS.find((m) => m.key === key)!
  return [...alunos]
    .sort((a, b) =>
      def.order === 'asc' ? a.metricas[key] - b.metricas[key] : b.metricas[key] - a.metricas[key],
    )
    .slice(0, limit)
}

/** Average of a metric (or imc) per evaluation month, oldest → newest. */
export function monthlyAverage(avaliacoes: Avaliacao[], key: MetricaKey | 'imc'): { label: string; value: number }[] {
  const groups = new Map<string, { sum: number; count: number; order: number; label: string }>()
  for (const v of avaliacoes) {
    const k = `${v.anoReferencia}-${String(new Date(v.data).getMonth()).padStart(2, '0')}`
    const value = key === 'imc' ? v.imc : v.metricas[key]
    const order = new Date(v.data).getTime()
    const label = `${v.mesReferencia.slice(0, 3)}/${String(v.anoReferencia).slice(2)}`
    const g = groups.get(k)
    if (g) {
      g.sum += value
      g.count++
    } else {
      groups.set(k, { sum: value, count: 1, order, label })
    }
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ label: g.label, value: round(g.sum / g.count, key === 'imc' ? 1 : 0) }))
}
