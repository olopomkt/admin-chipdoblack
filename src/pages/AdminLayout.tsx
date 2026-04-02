import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Cpu, ScrollText, DollarSign, Settings,
  LogOut, Menu, X, RefreshCw,
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
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-72 glass-panel border-r border-coal fixed h-screen z-40 shadow-2xl">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed h-screen w-72 glass-panel border-r border-coal z-50 lg:hidden flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
            >
              <SidebarContent admin={admin} onLogout={onLogout} onNavClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-72 relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 glass-panel border-b border-coal px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
      <div className="p-6 border-b border-coal flex items-center gap-4">
        <div className="w-12 h-12 bg-cyan/10 rounded-xl border border-cyan/30 flex items-center justify-center tech-glow">
          <Cpu size={24} className="text-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
        </div>
        <div>
          <h1 className="text-txt0 font-bold tracking-wide uppercase text-sm">Chip do Black</h1>
          <p className="text-cyan text-xs font-mono tracking-widest mt-0.5 opacity-80">SYS_ADMIN</p>
        </div>
        {onNavClick && (
          <button onClick={onNavClick} className="ml-auto text-txt2 hover:text-txt0 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-cyan/10 border border-cyan/30 text-cyan tech-glow shadow-[inset_0_0_12px_rgba(0,229,255,0.1)] translate-x-1'
                  : 'border border-transparent text-txt2 hover:text-txt0 hover:bg-white/5 hover:border-white/10'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-coal glass-panel">
        <div className="px-4 py-2 mb-2 bg-black/20 rounded border border-coal/50 text-xs text-txt2 font-mono tracking-wide truncate flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(0,230,118,0.8)]" />
          {admin.email}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-crimson/30 rounded-xl text-sm font-medium text-crimson hover:bg-crimson/10 hover:shadow-[0_0_12px_rgba(255,42,85,0.2)] transition-all duration-300"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
      </div>
    </>
  )
}
