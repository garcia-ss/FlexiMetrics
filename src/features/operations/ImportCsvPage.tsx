import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Upload, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, Table, useToast } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { AlunoInput } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'
import { parseAlunoCsv } from './operations'

const SAMPLE = 'nome,matricula,genero,data_nascimento,turma,peso,altura,cintura\nAna Silva,001,feminino,2010-01-01,7A,60,1.65,0.74'

export function ImportCsvPage() {
  const toast = useToast()
  const perfil = useAuthStore((state) => state.user?.perfil)
  const [csv, setCsv] = useState(SAMPLE)
  const [saving, setSaving] = useState(false)

  const { data: turmas, loading, error, reload } = useAsync(async () => data.turmas.list(), [])
  const parsed = useMemo(() => parseAlunoCsv(csv, turmas ?? []), [csv, turmas])

  if (perfil === 'aluno') return <Navigate to="/app" replace />

  const importRows = async () => {
    setSaving(true)
    try {
      for (const row of parsed) await data.alunos.create(row)
      toast.success(`${parsed.length} aluno(s) importado(s).`)
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<AlunoInput>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'matricula', label: 'Matricula', render: (row) => row.matricula ?? '-' },
    { key: 'genero', label: 'Genero' },
    { key: 'turma', label: 'Turma', render: (row) => (turmas ?? []).find((turma) => turma.id === row.turmaId)?.nome ?? 'Sem turma' },
  ]

  return (
    <>
      <Topbar title="Importar alunos" subtitle="Cadastro em lote via CSV" />
      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-96" />
        ) : (
          <>
            <Card>
              <CardHeader title="CSV" subtitle="Colunas: nome, matricula, genero, data_nascimento, turma, peso, altura, cintura" icon={<Upload className="h-5 w-5" />} />
              <div className="space-y-4 px-5 pb-5">
                <textarea
                  value={csv}
                  onChange={(event) => setCsv(event.target.value)}
                  className="min-h-48 w-full rounded-[var(--radius-md)] border border-line bg-elevated px-3 py-2 font-mono text-sm text-ink outline-none focus:border-volt focus:ring-2 focus:ring-volt/30"
                />
                <Button leftIcon={<Upload className="h-4 w-4" />} loading={saving} disabled={!parsed.length} onClick={() => void importRows()}>
                  Importar {parsed.length} aluno(s)
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Pre-visualizacao" />
              <Table
                columns={columns}
                rows={parsed}
                rowKey={(row) => `${row.nome}-${row.matricula ?? row.dataNascimento}`}
                emptyState={<EmptyState icon={<Users className="h-7 w-7" />} title="Sem linhas validas" description="Cole um CSV com cabecalho." />}
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}
