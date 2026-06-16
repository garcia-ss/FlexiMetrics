import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Save, UserRound } from 'lucide-react'
import { Topbar } from '@/components/layout/Topbar'
import { Button, Card, CardHeader, ErrorState, Input, Select, Skeleton, useToast } from '@/components/ui'
import { data } from '@/data'
import type { Genero, ProfessorInput } from '@/domain/types'
import { useAsync } from '@/hooks/useAsync'
import { useAuthStore } from '@/stores/authStore'

export function ProfessorProfilePage() {
  const toast = useToast()
  const user = useAuthStore((state) => state.user)
  const [form, setForm] = useState<ProfessorInput>({ nome: '', escola: '', telefone: '', dataNascimento: '', genero: null })
  const [saving, setSaving] = useState(false)

  const { data: professor, loading, error, reload } = useAsync(async () => {
    if (!user || user.perfil === 'aluno') return null
    return data.professores.get(user.id)
  }, [user?.id, user?.perfil])

  useEffect(() => {
    if (!user) return
    setForm({
      nome: professor?.nome ?? user.nome,
      escola: professor?.escola ?? '',
      telefone: professor?.telefone ?? '',
      dataNascimento: professor?.dataNascimento ?? '',
      genero: professor?.genero ?? null,
    })
  }, [professor, user])

  if (user?.perfil === 'aluno') return <Navigate to="/app" replace />

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await data.professores.update(user.id, form)
      await data.usuarios.updateNome(user.id, form.nome)
      toast.success('Perfil atualizado.')
      reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Topbar title="Meu perfil" subtitle="Dados profissionais do professor" />
      <div className="p-4 sm:p-6">
        {error ? (
          <Card><ErrorState message={error} onRetry={reload} /></Card>
        ) : loading ? (
          <Skeleton className="h-96" />
        ) : (
          <Card>
            <CardHeader title="Perfil profissional" icon={<UserRound className="h-5 w-5" />} />
            <form className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2" onSubmit={submit}>
              <Input label="Nome" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required />
              <Input label="Escola" value={form.escola ?? ''} onChange={(event) => setForm({ ...form, escola: event.target.value })} />
              <Input label="Telefone" value={form.telefone ?? ''} onChange={(event) => setForm({ ...form, telefone: event.target.value })} />
              <Input type="date" label="Data de nascimento" value={form.dataNascimento ?? ''} onChange={(event) => setForm({ ...form, dataNascimento: event.target.value || null })} />
              <Select
                label="Genero"
                placeholder="Nao informado"
                value={form.genero ?? ''}
                options={[
                  { value: 'masculino', label: 'Masculino' },
                  { value: 'feminino', label: 'Feminino' },
                  { value: 'outro', label: 'Outro' },
                ]}
                onChange={(event) => setForm({ ...form, genero: (event.target.value || null) as Genero | null })}
              />
              <div className="flex items-end">
                <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>Salvar perfil</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </>
  )
}
