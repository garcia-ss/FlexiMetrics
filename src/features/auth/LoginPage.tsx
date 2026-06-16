import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await signIn(email, password)
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
        {error && (
          <div className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          type="email"
          label="E-mail"
          placeholder="seu@email.com"
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
          placeholder="••••••••"
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
      </form>
    </AuthLayout>
  )
}
