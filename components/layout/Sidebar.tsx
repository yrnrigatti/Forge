'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  isMobileMenuOpen?: boolean
  onCloseMobileMenu?: () => void
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Exercícios', href: '/exercises', icon: CogIcon },
  { name: 'Treinos', href: '/workouts', icon: DocumentTextIcon },
  { name: 'Sessões', href: '/sessions', icon: ClockIcon },
  { name: 'Histórico', href: '/history', icon: ChartBarIcon },
]

export function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleLinkClick = () => {
    // Fecha o menu mobile quando um link é clicado
    if (onCloseMobileMenu) {
      onCloseMobileMenu()
    }
  }

  return (
    <div className={`
      fixed left-0 top-0 h-full w-64 bg-[#1F1F1F] border-r border-[#2C2C2C] flex flex-col z-40
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0
      ${
        isMobileMenuOpen 
          ? 'translate-x-0' 
          : '-translate-x-full lg:translate-x-0'
      }
    `}>
      {/* Header */}
      <div className="p-6 border-b border-[#2C2C2C]">
        <h1 className="text-2xl font-bold text-[#FF6B35]">
          Forge
        </h1>
        <p className="text-sm text-[#A3A3A3] mt-1">
          Seu companheiro de treinos
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#A3A3A3] hover:bg-[#2C2C2C] hover:text-[#E5E5E5]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-[#2C2C2C]">
        <div className="mb-3">
          <p className="text-sm text-[#A3A3A3] truncate">
            {user.email}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={signOut}
          className="w-full flex items-center gap-2 bg-[#2C2C2C] text-[#A3A3A3] hover:bg-[#FF3D00] hover:text-white border-[#2C2C2C]"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}