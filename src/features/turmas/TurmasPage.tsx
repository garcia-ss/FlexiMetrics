import { useEffect, useMemo, useState } from 'react'
import { Layers, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Skeleton,
  StatCard,
  Table,
  useToast,
} from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Turma } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'

interface TurmaForm {
  nome: string
  anoLetivo: string
}

const emptyForm: TurmaForm = {
  nome: '',
  anoLetivo: '2026',
}

export function TurmasPage() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Turma | null>(null)
  const [form, setForm] = useState<TurmaForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [turmas, alunos] = await Promise.all([data.turmas.list(), data.alunos.list()])
    return { turmas, alunos }
  }, [])

  const turmas = useMemo(() => result?.turmas ?? [], [result?.turmas])
  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const countByTurma = useMemo(() => {
    const counts = new Map<string, number>()
    for (const aluno of alunos) {
      if (aluno.turmaId) counts.set(aluno.turmaId, (counts.get(aluno.turmaId) ?? 0) + 1)
    }
    return counts
  }, [alunos])

  const withoutTurma = alunos.filter((aluno) => !aluno.turmaId).length
  const biggestTurma = turmas.reduce((best, turma) => {
    const total = countByTurma.get(turma.id) ?? 0
    return total > best.total ? { nome: turma.nome, total } : best
  }, { nome: 'Sem turmas', total: 0 })

  useEffect(() => {
    if (!modalOpen) return
    setForm(editing ? { nome: editing.nome, anoLetivo: editing.anoLetivo } : emptyForm)
    setFormError(null)
    setSaving(false)
  }, [editing, modalOpen])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (turma: Turma) => {
    setEditing(turma)
    setModalOpen(true)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.nome.trim()) {
      setFormError('Informe o nome da turma.')
      return
    }
    if (!form.anoLetivo.trim()) {
      setFormError('Informe o ano letivo.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await data.turmas.update(editing.id, { nome: form.nome.trim(), anoLetivo: form.anoLetivo.trim() })
        toast.success('Turma atualizada.')
      } else {
        await data.turmas.create({ nome: form.nome.trim(), anoLetivo: form.anoLetivo.trim() })
        toast.success('Turma criada.')
      }
      setModalOpen(false)
      reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Nao foi possivel salvar a turma.')
    } finally {
      setSaving(false)
    }
  }

  const removeTurma = async (turma: Turma) => {
    const total = countByTurma.get(turma.id) ?? 0
    if (!window.confirm(`Remover ${turma.nome}? ${total} aluno(s) ficarao sem turma.`)) return
    await data.turmas.remove(turma.id)
    toast.success('Turma removida.')
    reload()
  }

  const columns: Column<Turma>[] = [
    {
      key: 'nome',
      label: 'Turma',
      render: (turma) => (
        <div>
          <p className="font-semibold text-ink">{turma.nome}</p>
          <p className="text-xs text-subtle">Criada em {turma.createdAt}</p>
        </div>
      ),
    },
    { key: 'anoLetivo', label: 'Ano letivo' },
    {
      key: 'alunos',
      label: 'Alunos',
      align: 'right',
      render: (turma) => countByTurma.get(turma.id) ?? 0,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (turma) => (
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label={`Editar ${turma.nome}`} onClick={() => openEdit(turma)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover ${turma.nome}`}
            onClick={() => void removeTurma(turma)}
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
        title="Turmas"
        subtitle="Organizacao dos grupos de acompanhamento"
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Nova turma</Button>}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Turmas" value={turmas.length} icon={<Layers className="h-5 w-5" />} accent />
          <StatCard label="Alunos vinculados" value={alunos.length - withoutTurma} icon={<Users className="h-5 w-5" />} />
          <StatCard label="Maior turma" value={biggestTurma.total} subtitle={biggestTurma.nome} icon={<Users className="h-5 w-5" />} />
        </div>

        {error ? (
          <Card>
            <ErrorState message={error} onRetry={reload} />
          </Card>
        ) : loading ? (
          <Skeleton className="h-96" />
        ) : (
          <Card>
            <CardHeader title="Lista de turmas" subtitle={`${withoutTurma} aluno(s) sem turma`} />
            <Table
              columns={columns}
              rows={turmas}
              rowKey={(turma) => turma.id}
              emptyState={
                <EmptyState
                  icon={<Layers className="h-7 w-7" />}
                  title="Nenhuma turma cadastrada"
                  description="Crie uma turma para organizar alunos e comparar grupos."
                  action={<Button onClick={openCreate}>Criar turma</Button>}
                />
              }
            />
          </Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar turma' : 'Nova turma'}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="turma-form" loading={saving}>
              Salvar turma
            </Button>
          </>
        }
      >
        <form id="turma-form" className="space-y-4" onSubmit={submit}>
          {formError && (
            <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {formError}
            </div>
          )}
          <Input label="Nome" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
          <Input
            label="Ano letivo"
            value={form.anoLetivo}
            onChange={(event) => setForm({ ...form, anoLetivo: event.target.value })}
          />
        </form>
      </Modal>
    </>
  )
}
