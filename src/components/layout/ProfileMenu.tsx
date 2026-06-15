import { useNavigate } from 'react-router-dom'
import { LogOut, UserCircle2 } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { PERFIL_LABEL } from '@/app/navigation'

function initials(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function ProfileMenu() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 hover:bg-elevated cursor-pointer"
          aria-label="Menu do usuário"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-volt text-sm font-bold text-volt-ink">
            {initials(user.nome)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-ink">{user.nome}</span>
            <span className="block text-xs leading-tight text-subtle">{PERFIL_LABEL[user.perfil]}</span>
          </span>
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-ink">{user.nome}</p>
            <p className="truncate text-xs text-subtle">{user.email}</p>
          </div>
          <DropdownItem onClick={close}>
            <UserCircle2 className="h-4 w-4" /> {PERFIL_LABEL[user.perfil]}
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              close()
              handleSignOut()
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </DropdownItem>
        </>
      )}
    </Dropdown>
  )
}
