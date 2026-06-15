import { Filter, XCircle } from 'lucide-react'
import { Select } from '@/components/ui'
import type { AlunoFilters, ClassificacaoImc, Genero, Turma } from '@/domain/types'

interface FiltersBarProps {
  filters: AlunoFilters
  turmas: Turma[]
  showTurma?: boolean
  onChange: (next: AlunoFilters) => void
}

const GENEROS: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
]

const CLASSIFICACOES: ClassificacaoImc[] = ['Abaixo do peso', 'Normal', 'Sobrepeso', 'Obesidade']

export function FiltersBar({ filters, turmas, showTurma = true, onChange }: FiltersBarProps) {
  const hasFilters = Boolean(filters.turmaId || filters.genero || filters.classificacaoImc)

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 self-center text-xs font-bold uppercase tracking-wider text-muted">
        <Filter className="h-4 w-4" /> Filtros
      </div>

      {showTurma && (
        <div className="min-w-[170px]">
          <Select
            label="Turma"
            placeholder="Todas as turmas"
            value={filters.turmaId ?? ''}
            options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
            onChange={(e) => onChange({ ...filters, turmaId: e.target.value || undefined })}
          />
        </div>
      )}

      <div className="min-w-[150px]">
        <Select
          label="Gênero"
          placeholder="Todos"
          value={filters.genero ?? ''}
          options={GENEROS}
          onChange={(e) => onChange({ ...filters, genero: (e.target.value || undefined) as Genero | undefined })}
        />
      </div>

      <div className="min-w-[170px]">
        <Select
          label="Classificação IMC"
          placeholder="Todas"
          value={filters.classificacaoImc ?? ''}
          options={CLASSIFICACOES.map((c) => ({ value: c, label: c }))}
          onChange={(e) =>
            onChange({ ...filters, classificacaoImc: (e.target.value || undefined) as ClassificacaoImc | undefined })
          }
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => onChange({ search: filters.search })}
          className="mb-0.5 ml-auto inline-flex items-center gap-1 text-sm font-medium text-danger hover:underline cursor-pointer"
        >
          Limpar filtros <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
