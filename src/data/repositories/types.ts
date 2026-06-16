import type {
  Aluno,
  AlunoFilters,
  AlunoInput,
  Avaliacao,
  PontoEvolucao,
  Professor,
  ProfessorInput,
  Turma,
  Usuario,
  Perfil,
} from '@/domain/types'

export interface AlunoRepo {
  list(filters?: AlunoFilters): Promise<Aluno[]>
  get(id: string): Promise<Aluno | null>
  create(input: AlunoInput): Promise<Aluno>
  update(id: string, input: AlunoInput): Promise<Aluno>
  remove(id: string): Promise<void>
  evolution(id: string): Promise<PontoEvolucao[]>
}

export interface TurmaRepo {
  list(): Promise<Turma[]>
  get(id: string): Promise<Turma | null>
  create(input: { nome: string; anoLetivo: number }): Promise<Turma>
  update(id: string, input: { nome: string; anoLetivo: number }): Promise<Turma>
  remove(id: string): Promise<void>
}

export interface AvaliacaoInput {
  alunoId: string
  data: string
  observacoes?: string | null
  peso: number
  altura: number
  cintura: number
  metricas: Avaliacao['metricas']
}

export interface AvaliacaoRepo {
  listByAluno(alunoId: string): Promise<Avaliacao[]>
  listRecent(limit?: number): Promise<Avaliacao[]>
  listAll(): Promise<Avaliacao[]>
  create(input: AvaliacaoInput): Promise<Avaliacao>
  updateObservacoes(id: string, observacoes: string | null): Promise<Avaliacao>
  remove(id: string): Promise<void>
}

export interface UsuarioRepo {
  list(): Promise<Usuario[]>
  linkAluno(usuarioId: string, alunoId: string | null): Promise<Usuario>
  updateNome(usuarioId: string, nome: string): Promise<Usuario>
}

export interface ProfessorRepo {
  list(): Promise<Professor[]>
  get(id: string): Promise<Professor | null>
  update(id: string, input: ProfessorInput): Promise<Professor>
}

export interface AuthRepo {
  current(): Promise<Usuario | null>
  signIn(email: string, password: string, perfil?: Perfil): Promise<Usuario>
  signUp(input: { nome: string; email: string; password: string; perfil: Perfil }): Promise<Usuario>
  signOut(): Promise<void>
}

export interface DataSource {
  alunos: AlunoRepo
  turmas: TurmaRepo
  avaliacoes: AvaliacaoRepo
  usuarios: UsuarioRepo
  professores: ProfessorRepo
  auth: AuthRepo
}
