import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAdmin } from './hooks/useAdmin'
import { ToastProvider } from './components/ui/Toast'
import { Login } from './pages/Login'
import { AdminLayout } from './pages/AdminLayout'
import { DashboardAdmin } from './components/dashboard/DashboardAdmin'
import { GestaoUsuarios } from './components/usuarios/GestaoUsuarios'
import { MonitoramentoChips } from './components/chips/MonitoramentoChips'
import { LogsEventos } from './components/logs/LogsEventos'
import { PainelFinanceiro } from './components/financeiro/PainelFinanceiro'
import { PainelOperacional } from './components/operacional/PainelOperacional'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { loading, authenticated, admin, error, login, logout } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <Loader2 size={32} className="text-ember animate-spin" />
      </div>
    )
  }

  if (!authenticated || !admin) {
    return <Login onLogin={login} error={error} loading={loading} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout admin={admin} onLogout={logout} />}>
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/usuarios" element={<GestaoUsuarios />} />
          <Route path="/chips" element={<MonitoramentoChips />} />
          <Route path="/logs" element={<LogsEventos />} />
          <Route path="/financeiro" element={<PainelFinanceiro />} />
          <Route path="/operacional" element={<PainelOperacional />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
