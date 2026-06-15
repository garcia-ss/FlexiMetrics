import type { ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

export interface SortState {
  key: string
  dir: 'asc' | 'desc'
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  sort?: SortState
  onSortChange?: (key: string) => void
  emptyState?: ReactNode
}

const alignCls = { left: 'text-left', right: 'text-right', center: 'text-center' } as const

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  emptyState,
}: TableProps<T>) {
  return (
    <div className="custom-scrollbar overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn('px-4 py-3 font-semibold', alignCls[c.align ?? 'left'], c.className)}
              >
                {c.sortable && onSortChange ? (
                  <button
                    onClick={() => onSortChange(c.key)}
                    className="inline-flex items-center gap-1 hover:text-ink cursor-pointer"
                  >
                    {c.label}
                    {sort?.key === c.key &&
                      (sort.dir === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5 text-volt" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-volt" />
                      ))}
                  </button>
                ) : (
                  c.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-line/60 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-elevated',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn('px-4 py-3 text-ink', alignCls[c.align ?? 'left'], c.className)}
                >
                  {c.render ? c.render(row) : ((row as Record<string, ReactNode>)[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-subtle">
                {emptyState ?? 'Nenhum registro encontrado.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
