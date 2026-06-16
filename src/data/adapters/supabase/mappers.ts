import type { Aluno, AlunoInput, Avaliacao, Genero, Perfil, Professor, ProfessorInput, Turma, Usuario } from '@/domain/types'
import { calcImc, calcRce, classificarImc, idadeFrom } from '@/domain/metrics'
import type { AvaliacaoInput } from '@/data/repositories/types'

const MESES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const todayIso = () => new Date().toISOString().slice(0, 10)

function numberOrZero(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function stringOrDefault(value: unknown, fallback: string): string {
  return stringOrNull(value) ?? fallback
}

function toGenero(value: unknown): Genero {
  return value === 'masculino' || value === 'feminino' || value === 'outro' ? value : 'outro'
}

export function toPerfil(value: unknown): Perfil {
  return value === 'aluno' || value === 'professor' || value === 'admin' ? value : 'professor'
}

export function mesReferenciaFromIso(isoDate: string): string {
  const monthIndex = Number(isoDate.slice(5, 7)) - 1
  return MESES_PT[monthIndex] ?? MESES_PT[new Date().getMonth()]
}

export function anoReferenciaFromIso(isoDate: string): number {
  const year = Number(isoDate.slice(0, 4))
  return Number.isInteger(year) ? year : new Date().getFullYear()
}

export function rowToAluno(r: Record<string, unknown>): Aluno {
  const peso = numberOrZero(r.peso)
  const altura = numberOrZero(r.altura)
  const cintura = numberOrZero(r.cintura)
  const imc = calcImc(peso, altura)
  const dataNascimento = stringOrDefault(r.data_nascimento, todayIso())

  return {
    id: String(r.id),
    nome: stringOrDefault(r.nome, 'Aluno'),
    matricula: stringOrNull(r.matricula),
    genero: toGenero(r.genero),
    dataNascimento,
    turmaId: stringOrNull(r.turma_id),
    peso,
    altura,
    cintura,
    idade: idadeFrom(dataNascimento, todayIso()),
    imc,
    rce: calcRce(cintura, altura),
    classificacaoImc: classificarImc(imc).label,
    metricas: {
      flexibilidade: numberOrZero(r.flexibilidade),
      potMMII: numberOrZero(r.pot_mmii),
      potMS: numberOrZero(r.pot_ms),
      velocidade: numberOrZero(r.velocidade),
      agilidade: numberOrZero(r.agilidade),
      abdominal: numberOrZero(r.abdominal),
      resistencia: numberOrZero(r.resistencia),
    },
    createdAt: stringOrDefault(r.created_at, todayIso()),
  }
}

export function alunoToRow(input: AlunoInput) {
  const imc = calcImc(input.peso, input.altura)

  return {
    nome: input.nome,
    matricula: input.matricula ?? null,
    genero: input.genero,
    data_nascimento: input.dataNascimento,
    turma_id: input.turmaId,
    peso: input.peso,
    altura: input.altura,
    cintura: input.cintura,
    imc,
    rce: calcRce(input.cintura, input.altura),
    classificacao_imc: classificarImc(imc).label,
    flexibilidade: input.metricas.flexibilidade,
    pot_mmii: input.metricas.potMMII,
    pot_ms: input.metricas.potMS,
    velocidade: input.metricas.velocidade,
    agilidade: input.metricas.agilidade,
    abdominal: input.metricas.abdominal,
    resistencia: input.metricas.resistencia,
  }
}

export function rowToAvaliacao(r: Record<string, unknown>): Avaliacao {
  const data = stringOrDefault(r.data, todayIso())
  const peso = numberOrZero(r.peso)
  const altura = numberOrZero(r.altura)
  const cintura = numberOrZero(r.cintura)
  const imc = numberOrZero(r.imc) || calcImc(peso, altura)
  const rce = numberOrZero(r.rce) || calcRce(cintura, altura)

  return {
    id: String(r.id),
    alunoId: String(r.aluno_id),
    data,
    mesReferencia: stringOrDefault(r.mes_referencia, mesReferenciaFromIso(data)),
    anoReferencia: numberOrZero(r.ano_referencia) || anoReferenciaFromIso(data),
    observacoes: stringOrNull(r.observacoes),
    peso,
    altura,
    cintura,
    imc,
    rce,
    metricas: {
      flexibilidade: numberOrZero(r.flexibilidade),
      potMMII: numberOrZero(r.pot_mmii),
      potMS: numberOrZero(r.pot_ms),
      velocidade: numberOrZero(r.velocidade),
      agilidade: numberOrZero(r.agilidade),
      abdominal: numberOrZero(r.abdominal),
      resistencia: numberOrZero(r.resistencia),
    },
  }
}

export function avaliacaoInputToRow(input: AvaliacaoInput) {
  const imc = calcImc(input.peso, input.altura)

  return {
    aluno_id: input.alunoId,
    data: input.data,
    mes_referencia: mesReferenciaFromIso(input.data),
    ano_referencia: anoReferenciaFromIso(input.data),
    observacoes: input.observacoes ?? null,
    peso: input.peso,
    altura: input.altura,
    cintura: input.cintura,
    imc,
    rce: calcRce(input.cintura, input.altura),
    flexibilidade: input.metricas.flexibilidade,
    pot_mmii: input.metricas.potMMII,
    pot_ms: input.metricas.potMS,
    velocidade: input.metricas.velocidade,
    agilidade: input.metricas.agilidade,
    abdominal: input.metricas.abdominal,
    resistencia: input.metricas.resistencia,
  }
}

export function rowToTurma(r: Record<string, unknown>): Turma {
  return {
    id: String(r.id),
    nome: stringOrDefault(r.nome, 'Turma'),
    anoLetivo: numberOrZero(r.ano_letivo),
    professorId: String(r.professor_id),
    createdAt: stringOrDefault(r.created_at, todayIso()),
  }
}

export function turmaToRow(input: { nome: string; anoLetivo: number }) {
  return {
    nome: input.nome,
    ano_letivo: input.anoLetivo,
  }
}

export function rowToUsuario(r: Record<string, unknown>, fallbackEmail = ''): Usuario {
  return {
    id: String(r.id),
    nome: stringOrDefault(r.nome, fallbackEmail || 'Usuario'),
    email: stringOrDefault(r.email, fallbackEmail),
    perfil: toPerfil(r.perfil),
    alunoId: stringOrNull(r.aluno_id),
  }
}

export function rowToProfessor(r: Record<string, unknown>): Professor {
  return {
    id: String(r.id),
    nome: stringOrDefault(r.nome, 'Professor'),
    email: stringOrDefault(r.email, ''),
    escola: stringOrNull(r.escola),
    telefone: stringOrNull(r.telefone),
    dataNascimento: stringOrNull(r.data_nascimento),
    genero: r.genero === 'masculino' || r.genero === 'feminino' || r.genero === 'outro' ? r.genero : null,
    createdAt: stringOrDefault(r.created_at, todayIso()),
  }
}

export function professorToRow(input: ProfessorInput) {
  return {
    nome: input.nome,
    escola: input.escola ?? null,
    telefone: input.telefone ?? null,
    data_nascimento: input.dataNascimento ?? null,
    genero: input.genero ?? null,
  }
}
