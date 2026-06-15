import { create } from 'zustand'
import type { Perfil, Usuario } from '@/domain/types'
import { data } from '@/data'

interface AuthState {
  user: Usuario | null
  loading: boolean
  initialized: boolean
  error: string | null
  init: () => Promise<void>
  signIn: (email: string, password: string, perfil?: Perfil) => Promise<boolean>
  signUp: (input: { nome: string; email: string; password: string; perfil: Perfil }) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  init: async () => {
    try {
      const user = await data.auth.current()
      set({ user, initialized: true })
    } catch {
      set({ initialized: true })
    }
  },

  signIn: async (email, password, perfil) => {
    set({ loading: true, error: null })
    try {
      const user = await data.auth.signIn(email, password, perfil)
      set({ user, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Falha ao entrar' })
      return false
    }
  },

  signUp: async (input) => {
    set({ loading: true, error: null })
    try {
      const user = await data.auth.signUp(input)
      set({ user, loading: false })
      return true
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Falha ao cadastrar' })
      return false
    }
  },

  signOut: async () => {
    await data.auth.signOut()
    set({ user: null })
  },

  clearError: () => set({ error: null }),
}))
