import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Button, Input } from '@/components/ui'

export function ForgotPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle={sent ? undefined : 'Enviaremos um link de redefinição para o seu e-mail'}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-volt hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-volt-soft text-volt">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm text-muted">
            Se houver uma conta para <strong className="text-ink">{email}</strong>, você receberá um e-mail com instruções.
          </p>
        </motion.div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <Input
            type="email"
            label="E-mail cadastrado"
            value={email}
            leftIcon={<Mail className="h-4 w-4" />}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" size="lg">
            Enviar link de recuperação
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
