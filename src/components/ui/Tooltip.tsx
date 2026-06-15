import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'right' | 'bottom'
  className?: string
}

const sides = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
}

/** Lightweight CSS-only tooltip (hover/focus). */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-[var(--radius-sm)] border border-line',
          'bg-card px-2 py-1 text-xs text-ink opacity-0 shadow-[var(--shadow-md)] transition-opacity',
          'group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          sides[side],
        )}
      >
        {label}
      </span>
    </span>
  )
}
