import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { navFor } from '@/app/navigation'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return null
  const items = navFor(user.perfil)

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-elevated text-ink before:absolute before:left-0 before:h-6 before:w-1 before:-translate-x-3 before:rounded-r-full before:bg-volt relative'
                : 'text-muted hover:bg-elevated hover:text-ink',
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-volt text-volt-ink">
        <Activity className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink">FlexiMetrics</span>
    </div>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
        <Brand />
        <NavItems />
        <div className="mt-auto px-5 py-4 text-xs text-subtle">v1.0 · Performance Lab</div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-line bg-surface"
            >
              <div className="flex items-center justify-between pr-3">
                <Brand />
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Fechar menu"
                  className="rounded-full p-2 text-muted hover:bg-elevated hover:text-ink cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavItems onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
