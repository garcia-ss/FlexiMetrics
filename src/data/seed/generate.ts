import type { Aluno, Avaliacao, Genero, MetricaKey, RegistroMetricas, Turma } from '@/domain/types'
import { calcImc, calcRce, classificarImc, idadeFrom } from '@/domain/metrics'

/** Deterministic PRNG (mulberry32) so the demo dataset is stable across reloads. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NOMES_M = ['João', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Guilherme', 'Enzo', 'Arthur', 'Davi', 'Rafael', 'Bruno', 'Caio']
const NOMES_F = ['Maria', 'Ana', 'Sofia', 'Júlia', 'Beatriz', 'Laura', 'Valentina', 'Alice', 'Isabella', 'Manuela', 'Helena', 'Clara']
const SOBRENOMES = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Alves', 'Lima', 'Gomes', 'Ribeiro', 'Martins', 'Rocha']
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const TURMA_DEFS = [
  { nome: 'Turma A — Manhã', anoLetivo: '2026' },
  { nome: 'Turma B — Tarde', anoLetivo: '2026' },
  { nome: 'Turma C — Noite', anoLetivo: '2026' },
  { nome: 'Turma D — Integral', anoLetivo: '2026' },
  { nome: 'Turma E — Sábado', anoLetivo: '2026' },
]

const PROFESSOR_ID = 'professor-demo'

interface SeedResult {
  turmas: Turma[]
  alunos: Aluno[]
  avaliacoes: Avaliacao[]
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Generate a stable demo dataset. `nowIso` controls ages and evaluation dates. */
export function generateData(nowIso: string = new Date().toISOString().slice(0, 10)): SeedResult {
  const rng = mulberry32(20260615)
  const now = new Date(nowIso)

  const turmas: Turma[] = TURMA_DEFS.map((t, i) => ({
    id: `turma-${i + 1}`,
    nome: t.nome,
    anoLetivo: t.anoLetivo,
    professorId: PROFESSOR_ID,
    createdAt: `${t.anoLetivo}-02-01`,
  }))

  const alunos: Aluno[] = []
  const avaliacoes: Avaliacao[] = []
  const TOTAL = 150

  for (let i = 1; i <= TOTAL; i++) {
    const isMasc = rng() > 0.5
    const genero: Genero = isMasc ? 'masculino' : 'feminino'
    const nomeBase = isMasc ? NOMES_M[Math.floor(rng() * NOMES_M.length)] : NOMES_F[Math.floor(rng() * NOMES_F.length)]
    const nome = `${nomeBase} ${SOBRENOMES[Math.floor(rng() * SOBRENOMES.length)]}`

    const idadeAlvo = 14 + Math.floor(rng() * 5) // 14..18
    const birthYear = now.getFullYear() - idadeAlvo
    const dataNascimento = `${birthYear}-${String(1 + Math.floor(rng() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rng() * 28)).padStart(2, '0')}`

    const turmaId = turmas[Math.floor(rng() * turmas.length)].id

    const altura = round(1.5 + rng() * 0.4, 2) // 1.50..1.90
    let imcAlvo = 17 + rng() * 13 // 17..30
    let rceAlvo = 0.4 + rng() * 0.18 // 0.40..0.58

    // Base metric values (will improve over the series)
    let metricas: RegistroMetricas = {
      flexibilidade: 15 + rng() * 15,
      potMMII: 120 + rng() * 55,
      potMS: 4 + rng() * 3,
      velocidade: 6 + rng() * 3, // lower better
      agilidade: 11 + rng() * 4, // lower better
      abdominal: 18 + rng() * 28,
      resistencia: 2000 + rng() * 1400,
    }

    const numAvaliacoes = 4 + Math.floor(rng() * 3) // 4..6
    const alunoId = `aluno-${i}`
    let last: { peso: number; cintura: number; imc: number; rce: number; metricas: RegistroMetricas } | null = null

    for (let m = numAvaliacoes - 1; m >= 0; m--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - m)
      const data = isoDate(d)

      // Gradual improvement towards the latest evaluation
      const peso = round(imcAlvo * altura * altura, 1)
      const cintura = round(rceAlvo * altura, 2)
      const imc = calcImc(peso, altura)
      const rce = calcRce(cintura, altura)

      const snapshot: RegistroMetricas = {
        flexibilidade: round(metricas.flexibilidade, 0),
        potMMII: round(metricas.potMMII, 0),
        potMS: round(metricas.potMS, 1),
        velocidade: round(metricas.velocidade, 2),
        agilidade: round(metricas.agilidade, 2),
        abdominal: Math.round(metricas.abdominal),
        resistencia: Math.round(metricas.resistencia),
      }

      avaliacoes.push({
        id: `aval-${i}-${numAvaliacoes - m}`,
        alunoId,
        data,
        mesReferencia: MESES[d.getMonth()],
        anoReferencia: d.getFullYear(),
        observacoes: null,
        peso,
        altura,
        cintura,
        imc,
        rce,
        metricas: snapshot,
      })
      last = { peso, cintura, imc, rce, metricas: snapshot }

      // Drift towards better values for next (more recent) month
      imcAlvo = clamp(imcAlvo - (imcAlvo > 24.9 ? 0.4 : 0.1) + (rng() - 0.5) * 0.2, 16, 33)
      rceAlvo = clamp(rceAlvo - 0.004 + (rng() - 0.5) * 0.004, 0.38, 0.62)
      metricas = improve(metricas, rng)
    }

    const l = last!
    alunos.push({
      id: alunoId,
      nome,
      genero,
      dataNascimento,
      turmaId,
      peso: l.peso,
      altura,
      cintura: l.cintura,
      idade: idadeFrom(dataNascimento, nowIso),
      imc: l.imc,
      rce: l.rce,
      classificacaoImc: classificarImc(l.imc).label,
      metricas: l.metricas,
      createdAt: avaliacoes[avaliacoes.length - numAvaliacoes].data,
    })
  }

  return { turmas, alunos, avaliacoes }
}

function improve(m: RegistroMetricas, rng: () => number): RegistroMetricas {
  const bump = (v: number, pct: number) => v * (1 + pct * (0.5 + rng()))
  const drop = (v: number, pct: number) => v * (1 - pct * (0.5 + rng()))
  return {
    flexibilidade: bump(m.flexibilidade, 0.02),
    potMMII: bump(m.potMMII, 0.015),
    potMS: bump(m.potMS, 0.015),
    velocidade: drop(m.velocidade, 0.012),
    agilidade: drop(m.agilidade, 0.012),
    abdominal: bump(m.abdominal, 0.02),
    resistencia: bump(m.resistencia, 0.018),
  }
}

function round(value: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export const METRICA_KEYS: MetricaKey[] = [
  'flexibilidade',
  'potMMII',
  'potMS',
  'velocidade',
  'agilidade',
  'abdominal',
  'resistencia',
]
