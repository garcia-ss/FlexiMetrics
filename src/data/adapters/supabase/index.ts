/**
 * Supabase data adapter (denormalized schema — see db/migrations/0001_init.sql).
 *
 * NOTE: This adapter is wired and type-correct but has not been validated against
 * a live project (the original Supabase instance is unreachable). To activate:
 *   1. Create a Supabase project and run db/migrations + db/seed.
 *   2. Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_DATA_SOURCE=supabase.
 */
import type { Aluno, AlunoInput, Avaliacao, PontoEvolucao, Turma, Usuario, Perfil } from '@/domain/types'
import { calcImc, calcRce, classificarImc, idadeFrom } from '@/domain/metrics'
import type { AvaliacaoInput, DataSource } from '@/data/repositories/types'
import { getSupabase } from '@/lib/supabase'

const todayIso = () => new Date().toISOString().slice(0, 10)
const mesPt = (iso: string) =>
  ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][
    new Date(iso).getMonth()
  ]

/** DB row → domain Aluno (derived fields recomputed for safety). */
function rowToAluno(r: Record<string, unknown>): Aluno {
  const peso = Number(r.peso)
  const altura = Number(r.altura)
  const cintura = Number(r.cintura)
  const imc = calcImc(peso, altura)
  return {
    id: String(r.id),
    nome: String(r.nome),
    genero: r.genero as Aluno['genero'],
    dataNascimento: String(r.data_nascimento),
    turmaId: (r.turma_id as string | null) ?? null,
    peso,
    altura,
    cintura,
    idade: idadeFrom(String(r.data_nascimento), todayIso()),
    imc,
    rce: calcRce(cintura, altura),
    classificacaoImc: classificarImc(imc).label,
    metricas: {
      flexibilidade: Number(r.flexibilidade),
      potMMII: Number(r.pot_mmii),
      potMS: Number(r.pot_ms),
      velocidade: Number(r.velocidade),
      agilidade: Number(r.agilidade),
      abdominal: Number(r.abdominal),
      resistencia: Number(r.resistencia),
    },
    createdAt: String(r.created_at ?? todayIso()),
  }
}

function alunoToRow(input: AlunoInput) {
  const imc = calcImc(input.peso, input.altura)
  return {
    nome: input.nome,
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

function rowToAvaliacao(r: Record<string, unknown>): Avaliacao {
  return {
    id: String(r.id),
    alunoId: String(r.aluno_id),
    data: String(r.data),
    mesReferencia: String(r.mes_referencia),
    anoReferencia: Number(r.ano_referencia),
    observacoes: (r.observacoes as string | null) ?? null,
    peso: Number(r.peso),
    altura: Number(r.altura),
    cintura: Number(r.cintura),
    imc: Number(r.imc),
    rce: Number(r.rce),
    metricas: {
      flexibilidade: Number(r.flexibilidade),
      potMMII: Number(r.pot_mmii),
      potMS: Number(r.pot_ms),
      velocidade: Number(r.velocidade),
      agilidade: Number(r.agilidade),
      abdominal: Number(r.abdominal),
      resistencia: Number(r.resistencia),
    },
  }
}

function rowToTurma(r: Record<string, unknown>): Turma {
  return {
    id: String(r.id),
    nome: String(r.nome),
    anoLetivo: String(r.ano_letivo),
    professorId: String(r.professor_id),
    createdAt: String(r.created_at ?? todayIso()),
  }
}

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
        .insert({ nome: input.nome, ano_letivo: input.anoLetivo })
        .select()
        .single()
      if (error) throw error
      return rowToTurma(data)
    },
    async update(id, input) {
      const { data, error } = await getSupabase()
        .from('turma')
        .update({ nome: input.nome, ano_letivo: input.anoLetivo })
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
      const imc = calcImc(input.peso, input.altura)
      const row = {
        aluno_id: input.alunoId,
        data: input.data,
        mes_referencia: mesPt(input.data),
        ano_referencia: new Date(input.data).getFullYear(),
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
      const { data, error } = await getSupabase().from('avaliacao').insert(row).select().single()
      if (error) throw error
      return rowToAvaliacao(data)
    },
    async remove(id) {
      const { error } = await getSupabase().from('avaliacao').delete().eq('id', id)
      if (error) throw error
    },
  },

  auth: {
    async current() {
      const sb = getSupabase()
      const { data } = await sb.auth.getUser()
      const u = data.user
      if (!u) return null
      const { data: profile } = await sb.from('usuario').select('*').eq('id', u.id).maybeSingle()
      return {
        id: u.id,
        nome: (profile?.nome as string) ?? u.email ?? 'Usuário',
        email: u.email ?? '',
        perfil: ((profile?.perfil as Perfil) ?? 'professor'),
        alunoId: (profile?.aluno_id as string | null) ?? null,
      }
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
        await sb.from('usuario').insert({ id, nome: input.nome, email: input.email, perfil: input.perfil })
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
