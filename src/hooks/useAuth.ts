import { useAuthStore } from '@/stores/authStore'

/** Convenience hook exposing auth state + actions. */
export function useAuth() {
  return useAuthStore()
}
