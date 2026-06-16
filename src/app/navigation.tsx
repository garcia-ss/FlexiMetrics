import type { ReactNode } from 'react'
import {
  Bell,
  FileText,
  History,
  LayoutDashboard,
  Link2,
  MessageSquare,
  ShieldCheck,
  Target,
  Upload,
  UserRound,
  Users,
  Layers,
  ClipboardList,
  Trophy,
  LineChart,
  Lightbulb,
} from 'lucide-react'
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
    return [
      { to: '/app', label: 'Minha evolução', icon: <LineChart className={ICON} />, end: true },
      { to: '/app/historico', label: 'Histórico', icon: <History className={ICON} /> },
      { to: '/app/metas', label: 'Metas', icon: <Target className={ICON} /> },
      { to: '/app/feedback', label: 'Feedback', icon: <MessageSquare className={ICON} /> },
      { to: '/app/notificacoes', label: 'Notificações', icon: <Bell className={ICON} /> },
    ]
  }

  const items: NavItem[] = [
    { to: '/app', label: 'Visão geral', icon: <LayoutDashboard className={ICON} />, end: true },
    { to: '/app/insights', label: 'Insights', icon: <Lightbulb className={ICON} /> },
    { to: '/app/relatorios', label: 'Relatórios', icon: <FileText className={ICON} /> },
    { to: '/app/historico', label: 'Histórico', icon: <History className={ICON} /> },
    { to: '/app/metas', label: 'Metas', icon: <Target className={ICON} /> },
    { to: '/app/feedback', label: 'Feedback', icon: <MessageSquare className={ICON} /> },
    { to: '/app/notificacoes', label: 'Notificações', icon: <Bell className={ICON} /> },
    { to: '/app/alunos', label: 'Alunos', icon: <Users className={ICON} /> },
  ]
  if (perfil === 'professor' || perfil === 'admin') {
    items.push({ to: '/app/turmas', label: 'Turmas', icon: <Layers className={ICON} /> })
  }
  items.push(
    { to: '/app/avaliacoes', label: 'Avaliações', icon: <ClipboardList className={ICON} /> },
    { to: '/app/importar', label: 'Importar', icon: <Upload className={ICON} /> },
    { to: '/app/ranking', label: 'Ranking', icon: <Trophy className={ICON} /> },
    { to: '/app/perfil', label: 'Meu perfil', icon: <UserRound className={ICON} /> },
  )
  if (perfil === 'admin') {
    items.push(
      { to: '/app/vinculos', label: 'Vínculos', icon: <Link2 className={ICON} /> },
      { to: '/app/admin', label: 'Admin', icon: <ShieldCheck className={ICON} /> },
    )
  }
  return items
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  admin: 'Administrador',
}
