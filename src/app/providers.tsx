import { useEffect, type ReactNode } from 'react'
import { ToastProvider } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

export function Providers({ children }: { children: ReactNode }) {
  const init = useAuthStore((s) => s.init)

  useEffect(() => {
    init()
  }, [init])

  return <ToastProvider>{children}</ToastProvider>
}
