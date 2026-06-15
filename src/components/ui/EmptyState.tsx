import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-volt-soft text-volt">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = 'Algo deu errado', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/12 text-danger">
        <span className="text-2xl">!</span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-[var(--radius-md)] border border-line px-4 py-2 text-sm text-ink hover:bg-elevated cursor-pointer"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
