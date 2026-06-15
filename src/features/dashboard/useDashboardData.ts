import { useMemo } from 'react'
import { data } from '@/data'
import type { Aluno, AlunoFilters, Avaliacao, MetricaKey, Turma } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { computeKpis, monthlyAverage, type DashboardKpis } from './kpis'

export interface DashboardResult {
  loading: boolean
  error: string | null
  reload: () => void
  alunos: Aluno[]
  turmas: Turma[]
  kpis: DashboardKpis
  avaliacoesCount: number
  evolutionFor: (key: MetricaKey | 'imc') => { label: string; value: number }[]
}

const EMPTY_KPIS: DashboardKpis = {
  total: 0,
  mediaIdade: 0,
  mediaImc: 0,
  mediaMetricas: {
    flexibilidade: 0, potMMII: 0, potMS: 0, velocidade: 0, agilidade: 0, abdominal: 0, resistencia: 0,
  },
  genderData: [],
  imcData: [],
  radar: [],
}

export function useDashboardData(filters: AlunoFilters): DashboardResult {
  const { data: result, loading, error, reload } = useAsync<{
    alunos: Aluno[]
    turmas: Turma[]
    avaliacoes: Avaliacao[]
  }>(async () => {
    const [alunos, turmas, avaliacoes] = await Promise.all([
      data.alunos.list(filters),
      data.turmas.list(),
      data.avaliacoes.listAll(),
    ])
    return { alunos, turmas, avaliacoes }
  }, [filters.turmaId, filters.genero, filters.classificacaoImc, filters.search])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const avaliacoes = useMemo(() => result?.avaliacoes ?? [], [result?.avaliacoes])

  const kpis = useMemo(() => (alunos.length ? computeKpis(alunos) : EMPTY_KPIS), [alunos])

  const alunoIds = useMemo(() => new Set(alunos.map((a) => a.id)), [alunos])
  const filteredAvaliacoes = useMemo(
    () => avaliacoes.filter((v) => alunoIds.has(v.alunoId)),
    [avaliacoes, alunoIds],
  )

  const evolutionFor = useMemo(() => {
    return (key: MetricaKey | 'imc') => monthlyAverage(filteredAvaliacoes, key)
  }, [filteredAvaliacoes])

  return {
    loading,
    error,
    reload,
    alunos,
    turmas,
    kpis,
    avaliacoesCount: filteredAvaliacoes.length,
    evolutionFor,
  }
}
