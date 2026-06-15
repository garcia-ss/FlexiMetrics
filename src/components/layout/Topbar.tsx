import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { ProfileMenu } from './ProfileMenu'
import { useUiStore } from '@/stores/uiStore'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Abrir menu"
          className="rounded-[var(--radius-md)] p-2 text-muted hover:bg-elevated hover:text-ink lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-ink sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {actions}
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  )
}
