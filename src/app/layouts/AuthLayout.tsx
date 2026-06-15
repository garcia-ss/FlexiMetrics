import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      {/* Ambient volt glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-volt/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-info/10 blur-3xl" />

      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-[var(--radius-xl)] border border-line bg-card p-8 shadow-[var(--shadow-lg)]"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-volt text-volt-ink">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">FlexiMetrics</span>
        </div>
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </motion.div>
    </div>
  )
}
