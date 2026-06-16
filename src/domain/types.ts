/** FlexiMetrics — Domain model (shared across data layer and UI). */

export type Genero = 'masculino' | 'feminino' | 'outro'

export type Perfil = 'aluno' | 'professor' | 'admin'

/** Physical test metric keys (excludes derived imc/rce, which live on Aluno). */
export type MetricaKey =
  | 'flexibilidade'
  | 'potMMII'
  | 'potMS'
  | 'velocidade'
  | 'agilidade'
  | 'abdominal'
  | 'resistencia'

export type RegistroMetricas = Record<MetricaKey, number>

export type ClassificacaoImc = 'Abaixo do peso' | 'Normal' | 'Sobrepeso' | 'Obesidade'

export interface Aluno {
  id: string
  nome: string
  genero: Genero
  dataNascimento: string // ISO date (YYYY-MM-DD)
  turmaId: string | null
  /** Body composition (raw inputs) */
  peso: number // kg
  altura: number // m
  cintura: number // m
  /** Derived (computed on write by the data layer) */
  idade: number
  imc: number
  rce: number
  classificacaoImc: ClassificacaoImc
  metricas: RegistroMetricas
  createdAt: string
}

export interface Turma {
  id: string
  nome: string
  anoLetivo: string
  professorId: string
  createdAt: string
}

export interface Avaliacao {
  id: string
  alunoId: string
  data: string // ISO date
  mesReferencia: string // e.g. "Março"
  anoReferencia: number
  observacoes: string | null
  peso: number
  altura: number
  cintura: number
  imc: number
  rce: number
  metricas: RegistroMetricas
}

export interface PontoEvolucao {
  data: string
  mesReferencia: string
  anoReferencia: number
  imc: number
  rce: number
  metricas: RegistroMetricas
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: Perfil
  /** Linked aluno record id when perfil === 'aluno' */
  alunoId?: string | null
}

/** Input shape for creating/updating an aluno (raw, derived fields recomputed). */
export interface AlunoInput {
  nome: string
  genero: Genero
  dataNascimento: string
  turmaId: string | null
  peso: number
  altura: number
  cintura: number
  metricas: RegistroMetricas
}

export interface AlunoFilters {
  turmaId?: string
  genero?: Genero
  classificacaoImc?: ClassificacaoImc
  search?: string
}
