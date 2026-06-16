import { useMemo, useState } from 'react'
import { Download, FileText, Printer, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, EmptyState, ErrorState, Select, Skeleton, StatCard, Table } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Aluno } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { downloadCsv } from '@/lib/csv'
import { fmtNum } from '@/lib/format'
import { alunoCsvRows, buildReportSummary } from './operations'

export function ReportsPage() {
  const [turmaId, setTurmaId] = useState('')
  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, turmas, avaliacoes] = await Promise.all([data.alunos.list(), data.turmas.list(), data.avaliacoes.listAll()])
    return { alunos, turmas, avaliacoes }
  }, [])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const avaliacoes = useMemo(() => result?.avaliacoes ?? [], [result?.avaliacoes])
  const filteredAlunos = useMemo(() => alunos.filter((aluno) => !turmaId || aluno.turmaId === turmaId), [alunos, turmaId])
  const filteredIds = useMemo(() => new Set(filteredAlunos.map((aluno) => aluno.id)), [filteredAlunos])
  const filteredAvaliacoes = useMemo(
    () => avaliacoes.filter((avaliacao) => filteredIds.has(avaliacao.alunoId)),
    [avaliacoes, filteredIds],
  )
  const report = useMemo(
    () => buildReportSummary({ alunos: filteredAlunos, turmas: turmaId ? turmas.filter((turma) => turma.id === turmaId) : turmas, avaliacoes: filteredAvaliacoes }),
    [filteredAlunos, filteredAvaliacoes, turmaId, turmas],
  )

  const exportCsv = () => {
    downloadCsv(
      'relatorio-fleximetrics.csv',
      ['Nome', 'Matricula', 'Genero', 'Turma', 'Idade', 'IMC', 'RCE'],
      alunoCsvRows(filteredAlunos, turmas),
    )
  }

  const columns: Column<Aluno>[] = [
    { key: 'nome', label: 'Aluno', render: (aluno) => <span className="font-semibold text-ink">{aluno.nome}</span> },
    { key: 'matricula', label: 'Matricula', render: (aluno) => aluno.matricula ?? '-' },
    { key: 'idade', label: 'Idade', align: 'right', render: (aluno) => `${aluno.idade} anos` },
    { key: 'imc', label: 'IMC', align: 'right', render: (aluno) => fmtNum(aluno.imc) },
    { key: 'rce', label: 'RCE', align: 'right', render: (aluno) => fmtNum(aluno.rce, 2) },
  ]

  return (
    <>
      <Topbar
        title="Relatorios"
        subtitle="Resumo exportavel de alunos, turmas e avaliacoes"
        actions={
          <>
            <Button variant="secondary" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
              Imprimir/PDF
            </Button>
            <Button leftIcon={<Download className="h-4 w-4" />} onClick={exportCsv}>
              CSV
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatCard label="Alunos" value={report.totalAlunos} icon={<Users className="h-5 w-5" />} accent />
              <StatCard label="Turmas" value={report.totalTurmas} icon={<FileText className="h-5 w-5" />} />
              <StatCard label="Avaliacoes" value={report.totalAvaliacoes} icon={<FileText className="h-5 w-5" />} />
              <StatCard label="IMC medio" value={fmtNum(report.mediaImc)} icon={<FileText className="h-5 w-5" />} />
            </div>

            <Card>
              <CardHeader title="Filtro do relatorio" subtitle={`${filteredAlunos.length} aluno(s) no recorte`} />
              <div className="px-5 pb-5">
                <Select
                  label="Turma"
                  placeholder="Todas"
                  value={turmaId}
                  options={turmas.map((turma) => ({ value: turma.id, label: turma.nome }))}
                  onChange={(event) => setTurmaId(event.target.value)}
                />
              </div>
            </Card>

            <Card>
              <CardHeader title="Resumo por turma" />
              <Table
                columns={[
                  { key: 'nome', label: 'Turma' },
                  { key: 'alunos', label: 'Alunos', align: 'right' },
                  { key: 'avaliacoes', label: 'Avaliacoes', align: 'right' },
                  { key: 'mediaImc', label: 'IMC medio', align: 'right', render: (row) => fmtNum(row.mediaImc) },
                ]}
                rows={report.turmas}
                rowKey={(row) => row.id}
              />
            </Card>

            <Card>
              <CardHeader title="Alunos no relatorio" />
              <Table
                columns={columns}
                rows={filteredAlunos}
                rowKey={(aluno) => aluno.id}
                emptyState={<EmptyState icon={<FileText className="h-7 w-7" />} title="Sem dados" description="Ajuste os filtros." />}
              />
            </Card>
          </>
        )}
      </div>
    </>
  )
}
