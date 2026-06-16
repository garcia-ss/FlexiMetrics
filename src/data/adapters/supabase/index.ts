import type { PontoEvolucao, Usuario } from '@/domain/types'
import type { AvaliacaoInput, DataSource } from '@/data/repositories/types'
import { getSupabase } from '@/lib/supabase'
import {
  alunoToRow,
  avaliacaoInputToRow,
  professorToRow,
  rowToAluno,
  rowToAvaliacao,
  rowToProfessor,
  rowToTurma,
  rowToUsuario,
  turmaToRow,
} from './mappers'

export const supabaseDataSource: DataSource = {
  alunos: {
    async list(filters) {
      const sb = getSupabase()
      let query = sb.from('aluno').select('*').order('nome')
      if (filters?.turmaId) query = query.eq('turma_id', filters.turmaId)
      if (filters?.genero) query = query.eq('genero', filters.genero)
      if (filters?.classificacaoImc) query = query.eq('classificacao_imc', filters.classificacaoImc)
      if (filters?.search) query = query.ilike('nome', `%${filters.search}%`)
      const { data, error } = await query
      if (error) throw error
      return (data ?? []).map(rowToAluno)
    },
    async get(id) {
      const { data, error } = await getSupabase().from('aluno').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data ? rowToAluno(data) : null
    },
    async create(input) {
      const { data, error } = await getSupabase().from('aluno').insert(alunoToRow(input)).select().single()
      if (error) throw error
      return rowToAluno(data)
    },
    async update(id, input) {
      const { data, error } = await getSupabase().from('aluno').update(alunoToRow(input)).eq('id', id).select().single()
      if (error) throw error
      return rowToAluno(data)
    },
    async remove(id) {
      const { error } = await getSupabase().from('aluno').delete().eq('id', id)
      if (error) throw error
    },
    async evolution(id) {
      const { data, error } = await getSupabase().from('avaliacao').select('*').eq('aluno_id', id).order('data')
      if (error) throw error
      return (data ?? []).map(rowToAvaliacao).map(
        (v): PontoEvolucao => ({
          data: v.data,
          mesReferencia: v.mesReferencia,
          anoReferencia: v.anoReferencia,
          imc: v.imc,
          rce: v.rce,
          metricas: v.metricas,
        }),
      )
    },
  },

  turmas: {
    async list() {
      const { data, error } = await getSupabase().from('turma').select('*').order('nome')
      if (error) throw error
      return (data ?? []).map(rowToTurma)
    },
    async get(id) {
      const { data, error } = await getSupabase().from('turma').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data ? rowToTurma(data) : null
    },
    async create(input) {
      const { data, error } = await getSupabase()
        .from('turma')
        .insert(turmaToRow(input))
        .select()
        .single()
      if (error) throw error
      return rowToTurma(data)
    },
    async update(id, input) {
      const { data, error } = await getSupabase()
        .from('turma')
        .update(turmaToRow(input))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return rowToTurma(data)
    },
    async remove(id) {
      const { error } = await getSupabase().from('turma').delete().eq('id', id)
      if (error) throw error
    },
  },

  avaliacoes: {
    async listByAluno(alunoId) {
      const { data, error } = await getSupabase()
        .from('avaliacao')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false })
      if (error) throw error
      return (data ?? []).map(rowToAvaliacao)
    },
    async listRecent(limit = 10) {
      const { data, error } = await getSupabase()
        .from('avaliacao')
        .select('*')
        .order('data', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data ?? []).map(rowToAvaliacao)
    },
    async listAll() {
      const { data, error } = await getSupabase().from('avaliacao').select('*').order('data')
      if (error) throw error
      return (data ?? []).map(rowToAvaliacao)
    },
    async create(input: AvaliacaoInput) {
      const row = avaliacaoInputToRow(input)
      const { data, error } = await getSupabase().from('avaliacao').insert(row).select().single()
      if (error) throw error
      return rowToAvaliacao(data)
    },
    async updateObservacoes(id, observacoes) {
      const { data, error } = await getSupabase()
        .from('avaliacao')
        .update({ observacoes })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return rowToAvaliacao(data)
    },
    async remove(id) {
      const { error } = await getSupabase().from('avaliacao').delete().eq('id', id)
      if (error) throw error
    },
  },

  usuarios: {
    async list() {
      const { data, error } = await getSupabase().from('usuario').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => rowToUsuario(row))
    },
    async linkAluno(usuarioId, alunoId) {
      const { data, error } = await getSupabase()
        .from('usuario')
        .update({ aluno_id: alunoId })
        .eq('id', usuarioId)
        .select()
        .single()
      if (error) throw error
      return rowToUsuario(data)
    },
    async updateNome(usuarioId, nome) {
      const { data, error } = await getSupabase()
        .from('usuario')
        .update({ nome })
        .eq('id', usuarioId)
        .select()
        .single()
      if (error) throw error
      return rowToUsuario(data)
    },
  },

  professores: {
    async list() {
      const { data, error } = await getSupabase().from('professor').select('*').order('nome')
      if (error) throw error
      return (data ?? []).map((row) => rowToProfessor(row))
    },
    async get(id) {
      const { data, error } = await getSupabase().from('professor').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data ? rowToProfessor(data) : null
    },
    async update(id, input) {
      const { data, error } = await getSupabase()
        .from('professor')
        .update(professorToRow(input))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return rowToProfessor(data)
    },
  },

  auth: {
    async current() {
      const sb = getSupabase()
      const { data } = await sb.auth.getUser()
      const u = data.user
      if (!u) return null
      const { data: profile, error } = await sb.from('usuario').select('*').eq('id', u.id).maybeSingle()
      if (error) throw error
      return profile
        ? rowToUsuario(profile, u.email ?? '')
        : { id: u.id, nome: u.email ?? 'Usuario', email: u.email ?? '', perfil: 'professor', alunoId: null }
    },
    async signIn(email, password) {
      const sb = getSupabase()
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) throw error
      const user = await supabaseDataSource.auth.current()
      if (!user) throw new Error('Falha ao carregar perfil do usuário')
      return user
    },
    async signUp(input) {
      const sb = getSupabase()
      const { data, error } = await sb.auth.signUp({ email: input.email, password: input.password })
      if (error) throw error
      const id = data.user?.id
      if (id) {
        const usuarioRow = { id, nome: input.nome, email: input.email, perfil: input.perfil, aluno_id: null }
        const { error: usuarioError } = await sb.from('usuario').insert(usuarioRow)
        if (usuarioError) throw usuarioError

        if (input.perfil === 'professor') {
          const { error: professorError } = await sb.from('professor').insert({
            id,
            nome: input.nome,
            email: input.email,
          })
          if (professorError) throw professorError
        }
      }
      const user: Usuario = { id: id ?? 'unknown', nome: input.nome, email: input.email, perfil: input.perfil }
      return user
    },
    async signOut() {
      const { error } = await getSupabase().auth.signOut()
      if (error) throw error
    },
  },
}
