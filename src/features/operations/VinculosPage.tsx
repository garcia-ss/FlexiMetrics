import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Link2, Save } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, EmptyState, ErrorState, Select, Skeleton, Table, useToast } from '@/components/ui'
import type { Column } from '@/components/ui'
import { data } from '@/data'
import type { Usuario } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'

export function VinculosPage() {
  const toast = useToast()
  const perfil = useAuthStore((state) => state.user?.perfil)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const { data: result, loading, error, reload } = useAsync(async () => {
    const [usuarios, alunos] = await Promise.all([data.usuarios.list(), data.alunos.list()])
    return { usuarios, alunos }
  }, [])

  const alunos = useMemo(() => result?.alunos ?? [], [result?.alunos])
  const usuarios = useMemo(() => (result?.usuarios ?? []).filter((usuario) => usuario.perfil === 'aluno'), [result?.usuarios])
  const alunoById = useMemo(() => new Map(alunos.map((aluno) => [aluno.id, aluno])), [alunos])

  if (perfil !== 'admin') return <Navigate to="/app" replace />

  const save = async (usuario: Usuario) => {
    setSaving(usuario.id)
    try {
      await data.usuarios.linkAluno(usuario.id, draft[usuario.id] || null)
      toast.success('Vinculo atualizado.')
      reload()
    } finally {
      setSaving(null)
    }
  }

  const columns: Column<Usuario>[] = [
    {
      key: 'usuario',
      label: 'Usuario aluno',
      render: (usuario) => (
        <div>
          <p className="font-semibold text-ink">{usuario.nome}</p>
          <p className="text-xs text-subtle">{usuario.email}</p>
        </div>
      ),
    },
    {
      key: 'vinculo',
      label: 'Aluno vinculado',
      render: (usuario) => alunoById.get(usuario.alunoId ?? '')?.nome ?? 'Sem vinculo',
    },
    {
      key: 'novo',
      label: 'Selecionar aluno',
      render: (usuario) => (
        <Select
          value={draft[usuario.id] ?? usuario.alunoId ?? ''}
          placeholder="Sem vinculo"
          options={alunos.map((aluno) => ({ value: aluno.id, label: aluno.nome }))}
          onChange={(event) => setDraft((current) => ({ ...current, [usuario.id]: event.target.value }))}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (usuario) => (
        <Button size="sm" leftIcon={<Save className="h-4 w-4" />} loading={saving === usuario.id} onClick={() => void save(usuario)}>
          Salvar
        </Button>
      ),
    },
  ]

  return (
    <>
      <Topbar title="Vinculos" subtitle="Associe contas de aluno aos registros fisicos" />
      <div className="p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-[520px]" />
        ) : (
          <Card>
            <CardHeader title="Contas de aluno" subtitle={`${usuarios.length} usuario(s)`} icon={<Link2 className="h-5 w-5" />} />
            <Table
              columns={columns}
              rows={usuarios}
              rowKey={(usuario) => usuario.id}
              emptyState={<EmptyState icon={<Link2 className="h-7 w-7" />} title="Sem usuarios alunos" description="Cadastre usuarios com perfil aluno para vincular." />}
            />
          </Card>
        )}
      </div>
    </>
  )
}
