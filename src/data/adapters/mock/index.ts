import type { Aluno, AlunoInput, Avaliacao, PontoEvolucao, Turma, Usuario } from '@/domain/types'
import { calcImc, calcRce, classificarImc, idadeFrom } from '@/domain/metrics'
import type { AvaliacaoInput, DataSource } from '@/data/repositories/types'
import { delay, getDb, persist, persistUser, uid } from './store'

const todayIso = () => new Date().toISOString().slice(0, 10)
const mesPt = (iso: string) =>
  ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][
    new Date(iso).getMonth()
  ]

function buildAluno(id: string, input: AlunoInput, createdAt: string): Aluno {
  const imc = calcImc(input.peso, input.altura)
  const rce = calcRce(input.cintura, input.altura)
  return {
    id,
    nome: input.nome,
    genero: input.genero,
    dataNascimento: input.dataNascimento,
    turmaId: input.turmaId,
    peso: input.peso,
    altura: input.altura,
    cintura: input.cintura,
    idade: idadeFrom(input.dataNascimento, todayIso()),
    imc,
    rce,
    classificacaoImc: classificarImc(imc).label,
    metricas: input.metricas,
    createdAt,
  }
}

export const mockDataSource: DataSource = {
  alunos: {
    async list(filters) {
      let rows = [...getDb().alunos]
      if (filters?.turmaId) rows = rows.filter((a) => a.turmaId === filters.turmaId)
      if (filters?.genero) rows = rows.filter((a) => a.genero === filters.genero)
      if (filters?.classificacaoImc) rows = rows.filter((a) => a.classificacaoImc === filters.classificacaoImc)
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        rows = rows.filter((a) => a.nome.toLowerCase().includes(q))
      }
      rows.sort((a, b) => a.nome.localeCompare(b.nome))
      return delay(rows)
    },
    async get(id) {
      return delay(getDb().alunos.find((a) => a.id === id) ?? null)
    },
    async create(input) {
      const aluno = buildAluno(uid('aluno'), input, todayIso())
      const db = getDb()
      db.alunos.unshift(aluno)
      // seed an initial avaliacao so evolution has a starting point
      db.avaliacoes.push(makeAvaliacao(aluno))
      persist()
      return delay(aluno)
    },
    async update(id, input) {
      const db = getDb()
      const idx = db.alunos.findIndex((a) => a.id === id)
      if (idx === -1) throw new Error('Aluno não encontrado')
      const updated = buildAluno(id, input, db.alunos[idx].createdAt)
      db.alunos[idx] = updated
      persist()
      return delay(updated)
    },
    async remove(id) {
      const db = getDb()
      db.alunos = db.alunos.filter((a) => a.id !== id)
      db.avaliacoes = db.avaliacoes.filter((v) => v.alunoId !== id)
      persist()
      return delay(undefined)
    },
    async evolution(id) {
      const rows = getDb()
        .avaliacoes.filter((v) => v.alunoId === id)
        .sort((a, b) => a.data.localeCompare(b.data))
      const points: PontoEvolucao[] = rows.map((v) => ({
        data: v.data,
        mesReferencia: v.mesReferencia,
        anoReferencia: v.anoReferencia,
        imc: v.imc,
        rce: v.rce,
        metricas: v.metricas,
      }))
      return delay(points)
    },
  },

  turmas: {
    async list() {
      return delay([...getDb().turmas].sort((a, b) => a.nome.localeCompare(b.nome)))
    },
    async get(id) {
      return delay(getDb().turmas.find((t) => t.id === id) ?? null)
    },
    async create(input) {
      const turma: Turma = {
        id: uid('turma'),
        nome: input.nome,
        anoLetivo: input.anoLetivo,
        professorId: 'professor-demo',
        createdAt: todayIso(),
      }
      getDb().turmas.push(turma)
      persist()
      return delay(turma)
    },
    async update(id, input) {
      const db = getDb()
      const idx = db.turmas.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error('Turma não encontrada')
      db.turmas[idx] = { ...db.turmas[idx], nome: input.nome, anoLetivo: input.anoLetivo }
      persist()
      return delay(db.turmas[idx])
    },
    async remove(id) {
      const db = getDb()
      db.turmas = db.turmas.filter((t) => t.id !== id)
      db.alunos = db.alunos.map((a) => (a.turmaId === id ? { ...a, turmaId: null } : a))
      persist()
      return delay(undefined)
    },
  },

  avaliacoes: {
    async listByAluno(alunoId) {
      return delay(
        getDb()
          .avaliacoes.filter((v) => v.alunoId === alunoId)
          .sort((a, b) => b.data.localeCompare(a.data)),
      )
    },
    async listRecent(limit = 10) {
      return delay([...getDb().avaliacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, limit))
    },
    async listAll() {
      return delay([...getDb().avaliacoes])
    },
    async create(input: AvaliacaoInput) {
      const imc = calcImc(input.peso, input.altura)
      const rce = calcRce(input.cintura, input.altura)
      const avaliacao: Avaliacao = {
        id: uid('aval'),
        alunoId: input.alunoId,
        data: input.data,
        mesReferencia: mesPt(input.data),
        anoReferencia: new Date(input.data).getFullYear(),
        observacoes: input.observacoes ?? null,
        peso: input.peso,
        altura: input.altura,
        cintura: input.cintura,
        imc,
        rce,
        metricas: input.metricas,
      }
      const db = getDb()
      db.avaliacoes.push(avaliacao)
      // sync the aluno's current snapshot to the most recent evaluation
      const idx = db.alunos.findIndex((a) => a.id === input.alunoId)
      if (idx !== -1) {
        const latest = db.avaliacoes
          .filter((v) => v.alunoId === input.alunoId)
          .sort((a, b) => b.data.localeCompare(a.data))[0]
        db.alunos[idx] = {
          ...db.alunos[idx],
          peso: latest.peso,
          altura: latest.altura,
          cintura: latest.cintura,
          imc: latest.imc,
          rce: latest.rce,
          classificacaoImc: classificarImc(latest.imc).label,
          metricas: latest.metricas,
        }
      }
      persist()
      return delay(avaliacao)
    },
    async remove(id) {
      const db = getDb()
      db.avaliacoes = db.avaliacoes.filter((v) => v.id !== id)
      persist()
      return delay(undefined)
    },
  },

  auth: {
    async current() {
      return delay(getDb().user, 120)
    },
    async signIn(email, _password, perfil = 'professor') {
      const user: Usuario = {
        id: 'user-demo',
        nome: nomeFromEmail(email),
        email,
        perfil,
        alunoId: perfil === 'aluno' ? (getDb().alunos[0]?.id ?? null) : null,
      }
      persistUser(user)
      return delay(user, 600)
    },
    async signUp(input) {
      const user: Usuario = {
        id: 'user-demo',
        nome: input.nome,
        email: input.email,
        perfil: input.perfil,
        alunoId: input.perfil === 'aluno' ? (getDb().alunos[0]?.id ?? null) : null,
      }
      persistUser(user)
      return delay(user, 600)
    },
    async signOut() {
      persistUser(null)
      return delay(undefined, 120)
    },
  },
}

function makeAvaliacao(aluno: Aluno): Avaliacao {
  return {
    id: uid('aval'),
    alunoId: aluno.id,
    data: aluno.createdAt,
    mesReferencia: mesPt(aluno.createdAt),
    anoReferencia: new Date(aluno.createdAt).getFullYear(),
    observacoes: 'Avaliação inicial',
    peso: aluno.peso,
    altura: aluno.altura,
    cintura: aluno.cintura,
    imc: aluno.imc,
    rce: aluno.rce,
    metricas: aluno.metricas,
  }
}

function nomeFromEmail(email: string): string {
  const base = email.split('@')[0]?.replace(/[._-]/g, ' ') ?? 'Usuário'
  return base
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
