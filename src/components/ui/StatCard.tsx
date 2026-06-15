import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  subtitle?: string
  accent?: boolean
  className?: string
}

export function StatCard({ label, value, icon, subtitle, accent, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'rounded-[var(--radius-lg)] border border-line bg-card p-5 shadow-[var(--shadow-sm)]',
        'hover:border-volt/40 transition-colors',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className={cn('tabular mt-2 text-3xl font-bold leading-none', accent ? 'text-volt' : 'text-ink')}>
            {value}
          </p>
          {subtitle && <p className="mt-2 text-xs text-subtle">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-volt-soft text-volt">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface MiniStatProps {
  label: string
  value: ReactNode
  unit?: string
}

export function MiniStat({ label, value, unit }: MiniStatProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-[var(--radius-md)] border border-line bg-card p-4 shadow-[var(--shadow-sm)] hover:border-volt/40 transition-colors"
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-subtle">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="tabular text-xl font-bold text-ink">{value}</span>
        {unit && <span className="text-xs text-subtle">{unit}</span>}
      </div>
    </motion.div>
  )
}
