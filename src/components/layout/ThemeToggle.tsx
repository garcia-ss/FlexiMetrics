import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-ink hover:bg-elevated cursor-pointer"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'dark' : 'light'}
          initial={{ y: -24, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 24, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="absolute"
        >
          {isDark ? <Sun className="h-5 w-5 text-volt" /> : <Moon className="h-5 w-5 text-info" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
