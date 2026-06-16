import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import type { Perfil } from '@/domain/types'
import { PERFIL_LABEL } from '@/app/navigation'
import { cn } from '@/lib/cn'

const PERFIS: Perfil[] = ['professor', 'aluno']

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('professor@fleximetrics.app')
  const [password, setPassword] = useState('demo1234')
  const [perfil, setPerfil] = useState<Perfil>('professor')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await signIn(email, password, perfil)
    if (ok) navigate('/app', { replace: true })
  }

  return (
    <AuthLayout
      title="Acesso ao sistema"
      subtitle="Entre para acompanhar a performance dos seus alunos"
      footer={
        <>
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="font-semibold text-volt hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Perfil de demonstração</p>
          <div className="grid grid-cols-2 gap-2">
            {PERFIS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPerfil(p)}
                className={cn(
                  'rounded-[var(--radius-md)] border px-2 py-2 text-xs font-medium transition-colors cursor-pointer',
                  perfil === p
                    ? 'border-volt bg-volt-soft text-volt'
                    : 'border-line text-muted hover:text-ink',
                )}
              >
                {PERFIL_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          type="email"
          label="E-mail"
          value={email}
          leftIcon={<Mail className="h-4 w-4" />}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError()
          }}
          required
        />
        <Input
          type="password"
          label="Senha"
          value={password}
          leftIcon={<Lock className="h-4 w-4" />}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError()
          }}
          required
        />

        <div className="text-right">
          <Link to="/forgot" className="text-sm text-muted hover:text-ink hover:underline">
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Entrar
        </Button>
        <p className="text-center text-xs text-subtle">
          Demo offline — qualquer e-mail/senha funciona. Escolha um perfil acima.
        </p>
      </form>
    </AuthLayout>
  )
}
