import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Button, Input, Select } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import type { Perfil } from '@/domain/types'

interface FormState {
  nome: string
  email: string
  password: string
  confirm: string
  perfil: Perfil | ''
}

type Errors = Partial<Record<keyof FormState, string>>

export function CadastroPage() {
  const navigate = useNavigate()
  const { signUp, loading, error } = useAuthStore()
  const [form, setForm] = useState<FormState>({ nome: '', email: '', password: '', confirm: '', perfil: '' })
  const [errors, setErrors] = useState<Errors>({})

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.nome.trim()) e.nome = 'Informe seu nome'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (form.password.length < 6) e.password = 'Mínimo de 6 caracteres'
    if (form.password !== form.confirm) e.confirm = 'As senhas não coincidem'
    if (!form.perfil) e.perfil = 'Selecione um perfil'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    const ok = await signUp({
      nome: form.nome,
      email: form.email,
      password: form.password,
      perfil: form.perfil as Perfil,
    })
    if (ok) navigate('/app', { replace: true })
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a acompanhar a evolução física dos seus alunos"
      footer={
        <>
          Já é cadastrado?{' '}
          <Link to="/login" className="font-semibold text-volt hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Input
          label="Nome completo"
          value={form.nome}
          error={errors.nome}
          leftIcon={<User className="h-4 w-4" />}
          onChange={(e) => set('nome', e.target.value)}
        />
        <Input
          type="email"
          label="E-mail"
          value={form.email}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          onChange={(e) => set('email', e.target.value)}
        />
        <Select
          label="Perfil"
          placeholder="Selecione…"
          value={form.perfil}
          error={errors.perfil}
          options={[
            { value: 'professor', label: 'Professor' },
            { value: 'aluno', label: 'Aluno' },
          ]}
          onChange={(e) => set('perfil', e.target.value)}
        />
        <Input
          type="password"
          label="Senha"
          value={form.password}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          onChange={(e) => set('password', e.target.value)}
        />
        <Input
          type="password"
          label="Confirmar senha"
          value={form.confirm}
          error={errors.confirm}
          leftIcon={<Lock className="h-4 w-4" />}
          onChange={(e) => set('confirm', e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
