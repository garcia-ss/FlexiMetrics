import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  Pagination,
  Select,
  Skeleton,
  Table,
  useToast,
} from '@/components/ui'
import type { Column, SortState } from '@/components/ui'
import { data } from '@/data'
import { classificarImc } from '@/domain/metrics'
import type { Aluno, AlunoInput, ClassificacaoImc, Genero } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { downloadCsv } from '@/lib/csv'
import { fmtNum } from '@/lib/format'
import { AlunoFormModal } from './AlunoFormModal'

const PAGE_SIZE = 12
const CLASSIFICACOES: ClassificacaoImc[] = ['Abaixo do peso', 'Normal', 'Sobrepeso', 'Obesidade']

export function AlunosPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [genero, setGenero] = useState<Genero | ''>('')
  const [classificacao, setClassificacao] = useState<ClassificacaoImc | ''>('')
  const [turmaId, setTurmaId] = useState('')
  const [sort, setSort] = useState<SortState>({ key: 'nome', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Aluno | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, turmas] = await Promise.all([data.alunos.list(), data.turmas.list()])
    return { alunos, turmas }
  }, [])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const turmaById = useMemo(() => new Map(turmas.map((t) => [t.id, t])), [turmas])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = alunos.filter((aluno) => {
      if (query && !aluno.nome.toLowerCase().includes(query)) return false
      if (genero && aluno.genero !== genero) return false
      if (classificacao && aluno.classificacaoImc !== classificacao) return false
      if (turmaId && aluno.turmaId !== turmaId) return false
      return true
    })

    return rows.sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      if (sort.key === 'idade') return (a.idade - b.idade) * dir
      if (sort.key === 'imc') return (a.imc - b.imc) * dir
      if (sort.key === 'rce') return (a.rce - b.rce) * dir
      return a.nome.localeCompare(b.nome) * dir
    })
  }, [alunos, classificacao, genero, search, sort.dir, sort.key, turmaId])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (aluno: Aluno) => {
    setEditing(aluno)
    setModalOpen(true)
  }

  const saveAluno = async (input: AlunoInput) => {
    if (editing) {
      await data.alunos.update(editing.id, input)
      toast.success('Aluno atualizado.')
    } else {
      await data.alunos.create(input)
      toast.success('Aluno cadastrado.')
    }
    reload()
  }

  const removeAluno = async (aluno: Aluno) => {
    if (!window.confirm(`Remover ${aluno.nome}? As avaliacoes vinculadas tambem serao removidas.`)) return
    await data.alunos.remove(aluno.id)
    toast.success('Aluno removido.')
    reload()
  }

  const exportCsv = () => {
    downloadCsv(
      'alunos-fleximetrics.csv',
      ['Nome', 'Genero', 'Turma', 'Idade', 'IMC', 'RCE'],
      filtered.map((aluno) => [
        aluno.nome,
        aluno.genero,
        aluno.turmaId ? turmaById.get(aluno.turmaId)?.nome ?? 'Sem turma' : 'Sem turma',
        aluno.idade,
        fmtNum(aluno.imc),
        fmtNum(aluno.rce, 2),
      ]),
    )
  }

  const onSortChange = (key: string) => {
    setSort((current) => ({
      key,
      dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const columns: Column<Aluno>[] = [
    {
      key: 'nome',
      label: 'Aluno',
      sortable: true,
      render: (aluno) => (
        <div>
          <p className="font-semibold text-ink">{aluno.nome}</p>
          <p className="text-xs text-subtle">{aluno.genero}</p>
        </div>
      ),
    },
    {
      key: 'turma',
      label: 'Turma',
      render: (aluno) => (aluno.turmaId ? turmaById.get(aluno.turmaId)?.nome ?? 'Sem turma' : 'Sem turma'),
    },
    { key: 'idade', label: 'Idade', sortable: true, align: 'right', render: (aluno) => `${aluno.idade} anos` },
    {
      key: 'imc',
      label: 'IMC',
      sortable: true,
      align: 'right',
      render: (aluno) => <Badge tone={classificarImc(aluno.imc).tone}>{fmtNum(aluno.imc)}</Badge>,
    },
    { key: 'rce', label: 'RCE', sortable: true, align: 'right', render: (aluno) => fmtNum(aluno.rce, 2) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (aluno) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Editar ${aluno.nome}`}
            onClick={(event) => {
              event.stopPropagation()
              openEdit(aluno)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover ${aluno.nome}`}
            onClick={(event) => {
              event.stopPropagation()
              void removeAluno(aluno)
            }}
          >
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Topbar
        title="Alunos"
        subtitle="Cadastro, filtros e acompanhamento dos alunos"
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} onClick={exportCsv}>
              CSV
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Novo aluno
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Card>
          <CardHeader title="Filtros" subtitle={`${filtered.length} de ${alunos.length} alunos no recorte`} />
          <div className="grid grid-cols-1 gap-3 px-5 pb-5 md:grid-cols-4">
            <Input
              label="Busca"
              value={search}
              leftIcon={<Search className="h-4 w-4" />}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Nome do aluno"
            />
            <Select
              label="Turma"
              placeholder="Todas"
              value={turmaId}
              options={turmas.map((turma) => ({ value: turma.id, label: turma.nome }))}
              onChange={(event) => {
                setTurmaId(event.target.value)
                setPage(1)
              }}
            />
            <Select
              label="Genero"
              placeholder="Todos"
              value={genero}
              options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'feminino', label: 'Feminino' },
                { value: 'outro', label: 'Outro' },
              ]}
              onChange={(event) => {
                setGenero((event.target.value || '') as Genero | '')
                setPage(1)
              }}
            />
            <Select
              label="IMC"
              placeholder="Todas"
              value={classificacao}
              options={CLASSIFICACOES.map((item) => ({ value: item, label: item }))}
              onChange={(event) => {
                setClassificacao((event.target.value || '') as ClassificacaoImc | '')
                setPage(1)
              }}
            />
          </div>
        </Card>

        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <Table
              columns={columns}
              rows={paged}
              rowKey={(aluno) => aluno.id}
              sort={sort}
              onSortChange={onSortChange}
              onRowClick={(aluno) => navigate(`/app/alunos/${aluno.id}`)}
              emptyState={
                <EmptyState
                  icon={<UserRound className="h-7 w-7" />}
                  title="Nenhum aluno encontrado"
                  description="Ajuste os filtros ou cadastre um novo aluno."
                  action={<Button onClick={openCreate}>Cadastrar aluno</Button>}
                />
              }
            />
            {filtered.length > PAGE_SIZE && (
              <div className="border-t border-line p-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </Card>
        )}
      </div>

      <AlunoFormModal
        open={modalOpen}
        aluno={editing}
        turmas={turmas}
        onClose={() => setModalOpen(false)}
        onSubmit={saveAluno}
      />
    </>
  )
}
