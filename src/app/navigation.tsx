import type { ReactNode } from 'react'
import { LayoutDashboard, Users, Layers, ClipboardList, Trophy, LineChart } from 'lucide-react'
import type { Perfil } from '@/domain/types'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

const ICON = 'h-5 w-5'

export function navFor(perfil: Perfil): NavItem[] {
  if (perfil === 'aluno') {
    return [{ to: '/app', label: 'Minha evolução', icon: <LineChart className={ICON} />, end: true }]
  }

  const items: NavItem[] = [
    { to: '/app', label: 'Visão geral', icon: <LayoutDashboard className={ICON} />, end: true },
    { to: '/app/alunos', label: 'Alunos', icon: <Users className={ICON} /> },
  ]
  if (perfil === 'professor' || perfil === 'admin') {
    items.push({ to: '/app/turmas', label: 'Turmas', icon: <Layers className={ICON} /> })
  }
  items.push(
    { to: '/app/avaliacoes', label: 'Avaliações', icon: <ClipboardList className={ICON} /> },
    { to: '/app/ranking', label: 'Ranking', icon: <Trophy className={ICON} /> },
  )
  return items
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  admin: 'Administrador',
}
