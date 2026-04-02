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
    <div className="min-h-screen bg-transparent flex overflow-hidden w-full">
      {/* Sidebar desktop - Flex Nativo e Sticky (não sobrepõe, empurra conteúdo) */}
      <aside 
        className="hidden lg:flex flex-col glass-panel border-r border-coal sticky top-0 h-screen z-40 transition-all duration-300 flex-shrink-0 shadow-2xl"
        style={{ width: collapsed ? '5rem' : '16rem' }}
      >
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 h-screen w-64 glass-panel border-r border-coal z-50 lg:hidden flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
            >
              <SidebarContent admin={admin} onLogout={onLogout} onNavClick={() => setSidebarOpen(false)} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content - ocupa todo resto do espaço flex */}
      <div className="flex-1 min-w-0 relative z-10 flex flex-col min-h-screen transition-all duration-300">
        <header className="sticky top-0 z-30 glass-panel border-b border-coal px-5 md:px-8 lg:px-10 py-4 flex items-center justify-between shadow-sm">
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

        <main className="p-5 md:p-8 lg:p-10 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ admin, onLogout, onNavClick, collapsed, onToggleCollapse }: { admin: AdminUser; onLogout: () => void; onNavClick?: () => void; collapsed: boolean; onToggleCollapse?: () => void }) {
  return (
    <div className="flex flex-col h-full relative w-full">
      <div className={`p-4 border-b border-coal flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'gap-4 px-6'}`}>
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
          <button 
            onClick={onToggleCollapse} 
            className="hidden lg:flex absolute -right-3.5 top-6 bg-bg1 border border-txt2/30 rounded-full p-1.5 text-txt2 hover:text-cyan hover:border-cyan hover:bg-black transition-all z-50 shadow-[0_0_10px_rgba(0,0,0,0.8)] focus:outline-none"
          >
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
            {!collapsed && <span className="whitespace-nowrap truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-4 border-t border-coal glass-panel pb-6 md:pb-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && (
          <div className="px-3 py-2 mb-3 bg-black/30 rounded-lg border border-coal/50 text-[11px] text-txt2 font-mono tracking-wide flex items-center gap-2 overflow-hidden">
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
