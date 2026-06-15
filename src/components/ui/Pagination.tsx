import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const safeTotal = Math.max(totalPages, 1)
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-line text-muted ' +
    'hover:bg-elevated hover:text-ink disabled:opacity-40 disabled:pointer-events-none cursor-pointer'

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <p className="text-sm text-muted">
        Página <span className="tabular text-ink">{page}</span> de{' '}
        <span className="tabular text-ink">{safeTotal}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          className={btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          className={btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotal}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
