import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Cpu, ScrollText, DollarSign, Settings,
  LogOut, Menu, X, RefreshCw, ChevronLeft, ChevronRight
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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-transparent flex overflow-hidden">
      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex flex-col glass-panel border-r border-coal fixed h-screen z-40 shadow-2xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent admin={admin} onLogout={onLogout} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed h-screen w-64 glass-panel border-r border-coal z-50 lg:hidden flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
            >
              <SidebarContent admin={admin} onLogout={onLogout} onNavClick={() => setSidebarOpen(false)} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex-1 relative z-10 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-30 glass-panel border-b border-coal px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-txt2 hover:text-txt0 rounded-md hover:bg-white/5 transition-colors"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-txt0 font-semibold text-lg hidden sm:block">Painel Admin</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 text-xs md:text-sm text-txt2 px-3 py-1.5 rounded-full bg-black/20 border border-coal/30">
              <RefreshCw size={14} className="animate-spin text-cyan" style={{ animationDuration: '3s' }} />
              <span className="hidden sm:inline font-mono tracking-wide">Auto-refresh</span>
            </div>
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-cyan/5 border border-cyan/20">
              <span className="text-sm font-medium text-txt0">{admin.nome || admin.email}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ admin, onLogout, onNavClick, collapsed, onToggleCollapse }: { admin: AdminUser; onLogout: () => void; onNavClick?: () => void; collapsed: boolean; onToggleCollapse?: () => void }) {
  return (
    <div className="flex flex-col h-full relative">
      <div className={`p-4 border-b border-coal flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'gap-4'}`}>
        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 bg-cyan/10 rounded-xl border border-cyan/30 flex items-center justify-center tech-glow">
          <Cpu size={collapsed ? 20 : 24} className="text-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-txt0 font-bold tracking-wide uppercase text-sm">Chip do Black</h1>
            <p className="text-cyan text-xs font-mono tracking-widest mt-0.5 opacity-80">SYS_ADMIN</p>
          </div>
        )}
        {onNavClick && (
          <button onClick={onNavClick} className="ml-auto text-txt2 hover:text-txt0 p-2 lg:hidden">
            <X size={20} />
          </button>
        )}
        {onToggleCollapse && (
          <button onClick={onToggleCollapse} className="absolute -right-3 top-6 bg-coal border border-txt2/20 rounded-full p-1 text-txt2 hover:text-txt0 hover:bg-black transition-colors z-50 shadow-md">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} py-3 
               rounded-xl text-sm font-medium transition-all duration-300 relative group
               ${isActive
                  ? 'bg-cyan/10 border border-cyan/30 text-cyan tech-glow shadow-[inset_0_0_12px_rgba(0,229,255,0.1)]'
                  : 'border border-transparent text-txt2 hover:text-txt0 hover:bg-white/5 hover:border-white/10'
               }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className={collapsed ? '' : 'flex-shrink-0'} />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-coal glass-panel pb-6 md:pb-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && (
          <div className="px-3 py-2 mb-3 bg-black/30 rounded-lg border border-coal/50 text-[11px] text-txt2 font-mono tracking-wide truncate flex items-center gap-2">
            <div className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(0,230,118,0.8)]" />
            <span className="truncate">{admin.email}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? "Encerrar Sessão" : undefined}
          className={`w-full flex items-center justify-center gap-3 ${collapsed ? 'p-3 rounded-full' : 'px-4 py-3 rounded-xl'} border border-crimson/30 transition-all duration-300 text-sm font-medium text-crimson hover:bg-crimson/10 hover:shadow-[0_0_12px_rgba(255,42,85,0.2)]`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  )
}
