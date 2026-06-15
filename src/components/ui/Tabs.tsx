import { cn } from '@/lib/cn'

export interface TabItem {
  value: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('inline-flex gap-1 rounded-[var(--radius-md)] border border-line bg-surface p-1', className)} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
              active ? 'bg-volt text-volt-ink' : 'text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
