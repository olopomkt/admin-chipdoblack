import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Cpu, ScrollText, DollarSign, Settings,
  Flame, LogOut, Menu, X, RefreshCw,
} from 'lucide-react'
import type { AdminUser } from '../types'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/chips', label: 'Chips', icon: Cpu },
  { to: '/logs', label: 'Logs', icon: ScrollText },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/operacional', label: 'Operacional', icon: Settings },
]

interface AdminLayoutProps {
  admin: AdminUser
  onLogout: () => void
}

export function AdminLayout({ admin, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg1 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg2 border-r border-coal fixed h-screen">
        <SidebarContent admin={admin} onLogout={onLogout} />
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed h-screen w-64 bg-bg2 border-r border-coal z-50 lg:hidden flex flex-col"
            >
              <SidebarContent admin={admin} onLogout={onLogout} onNavClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-bg2/80 backdrop-blur-md border-b border-coal px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-txt2 hover:text-txt0"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-txt0 font-semibold text-lg hidden sm:block">Painel Admin</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-txt2">
              <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="hidden sm:inline">Auto-refresh</span>
            </div>
            <span className="text-sm text-txt1 hidden sm:block">{admin.nome || admin.email}</span>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ admin, onLogout, onNavClick }: { admin: AdminUser; onLogout: () => void; onNavClick?: () => void }) {
  return (
    <>
      <div className="p-5 border-b border-coal flex items-center gap-3">
        <div className="w-10 h-10 bg-ember/10 rounded-xl flex items-center justify-center">
          <Flame size={22} className="text-ember" />
        </div>
        <div>
          <h1 className="text-txt0 font-bold text-sm">Chip do Black</h1>
          <p className="text-txt2 text-xs">Admin Panel</p>
        </div>
        {onNavClick && (
          <button onClick={onNavClick} className="ml-auto text-txt2 hover:text-txt0 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ember/10 text-ember'
                  : 'text-txt2 hover:text-txt0 hover:bg-bg3'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-coal">
        <div className="px-3 py-2 text-xs text-txt2 truncate">{admin.email}</div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-crimson hover:bg-crimson/10 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  )
}
