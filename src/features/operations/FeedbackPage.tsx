import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { MessageSquare, Save } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, EmptyState, ErrorState, Skeleton, Table, useToast } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Avaliacao } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { fmtDate } from '@/lib/format'
import { useAuthStore } from '@/stores/authStore'

export function FeedbackPage() {
  const toast = useToast()
  const user = useAuthStore((state) => state.user)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [alunos, avaliacoes] = await Promise.all([data.alunos.list(), data.avaliacoes.listRecent(50)])
    return { alunos, avaliacoes }
  }, [])

  const alunoById = useMemo(() => new Map((result?.alunos ?? []).map((aluno) => [aluno.id, aluno])), [result?.alunos])
  const avaliacoes = useMemo(() => {
    const rows = result?.avaliacoes ?? []
    return user?.perfil === 'aluno' ? rows.filter((avaliacao) => avaliacao.alunoId === user.alunoId) : rows
  }, [result?.avaliacoes, user?.alunoId, user?.perfil])

  if (user?.perfil === 'aluno' && !user.alunoId) return <Navigate to="/app" replace />

  const save = async (avaliacao: Avaliacao) => {
    setSaving(avaliacao.id)
    try {
      await data.avaliacoes.updateObservacoes(avaliacao.id, draft[avaliacao.id] ?? avaliacao.observacoes ?? null)
      toast.success('Feedback atualizado.')
      reload()
    } finally {
      setSaving(null)
    }
  }

  const columns: Column<Avaliacao>[] = [
    { key: 'aluno', label: 'Aluno', render: (avaliacao) => alunoById.get(avaliacao.alunoId)?.nome ?? 'Aluno' },
    { key: 'data', label: 'Data', render: (avaliacao) => fmtDate(avaliacao.data) },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (avaliacao) =>
        user?.perfil === 'aluno' ? (
          avaliacao.observacoes || 'Sem feedback'
        ) : (
          <textarea
            value={draft[avaliacao.id] ?? avaliacao.observacoes ?? ''}
            onChange={(event) => setDraft((current) => ({ ...current, [avaliacao.id]: event.target.value }))}
            className="min-h-20 w-full rounded-[var(--radius-md)] border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-volt focus:ring-2 focus:ring-volt/30"
          />
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (avaliacao) =>
        user?.perfil === 'aluno' ? null : (
          <Button size="sm" loading={saving === avaliacao.id} leftIcon={<Save className="h-4 w-4" />} onClick={() => void save(avaliacao)}>
            Salvar
          </Button>
        ),
    },
  ]

  return (
    <>
      <Topbar title="Feedback" subtitle="Comentarios associados as avaliacoes" />
      <div className="p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <CardHeader title="Feedbacks recentes" icon={<MessageSquare className="h-5 w-5" />} />
            <Table columns={columns} rows={avaliacoes} rowKey={(avaliacao) => avaliacao.id} emptyState={<EmptyState icon={<MessageSquare className="h-7 w-7" />} title="Sem avaliacoes" description="Registre avaliacoes para adicionar feedback." />} />
          </Card>
        )}
      </div>
    </>
  )
}
