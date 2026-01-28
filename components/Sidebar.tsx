'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Users as UsersIcon, MessageSquare, Menu, X, MessageCircle, Megaphone, LogOut, Link2, ListChecks } from 'lucide-react'
import { removeAuthToken } from '@/lib/api'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: UsersIcon },
  { path: '/thoughts', label: 'Thoughts', icon: MessageSquare },
  { path: '/prompts', label: 'Prompts', icon: ListChecks },
  { path: '/feedback', label: 'Feedback', icon: MessageCircle },
  { path: '/broadcast', label: 'Broadcast', icon: Megaphone },
  { path: '/connections', label: 'Connections (Melt)', icon: Link2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded border border-black bg-white p-2 md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-black bg-white transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-black p-6">
            <h1 className="text-2xl font-bold">Metal Admin</h1>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path
                const Icon = item.icon
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="border-t border-black p-4">
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-black transition-colors hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

