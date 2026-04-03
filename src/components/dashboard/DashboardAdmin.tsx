import { useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Zap, Cpu, DollarSign, UserPlus, TrendingUp,
  Wifi, WifiOff, Clock, AlertTriangle, PieChart as PieChartIcon, BarChart as BarChartIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { apiFetch } from '../../config/api'
import { usePolling } from '../../hooks/usePolling'
import { KPICard } from '../ui/KPICard'
import { KPISkeleton } from '../ui/Skeleton'
import { StatusBadge } from '../ui/StatusBadge'
import { formatCurrency, formatDate } from '../../types'
import type { Metricas, Crescimento, Receita, LogRecente } from '../../types'

const PIE_COLORS = ['#00e5ff', '#2962ff', '#d500f9', '#f03e65', '#00e676', '#ffa000']

export function DashboardAdmin() {
  const fetchMetricas = useCallback(() => apiFetch('/admin_metricas') as Promise<Metricas[]>, [])
  const fetchCrescimento = useCallback(() => apiFetch('/admin_crescimento') as Promise<Crescimento[]>, [])
  const fetchReceita = useCallback(() => apiFetch('/admin_receita') as Promise<Receita[]>, [])
  const fetchLogs = useCallback(() => apiFetch('/admin_logs_recentes?limit=10') as Promise<LogRecente[]>, [])

  const { data: metricasArr, loading: loadingM } = usePolling(fetchMetricas, 30000)
  const { data: crescimento, loading: loadingC } = usePolling(fetchCrescimento, 30000)
  const { data: receita, loading: loadingR } = usePolling(fetchReceita, 30000)
  const { data: logs, loading: loadingL } = usePolling(fetchLogs, 30000)

  const m = metricasArr?.[0] ?? null
  const receitaTotal = receita?.reduce((sum, r) => sum + (r.receita_total || 0), 0) ?? 0
  const taxaConversao = m ? (m.planos_pagos / Math.max(m.total_pedidos, 1) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-txt0 to-txt2 bg-clip-text text-transparent">Dashboard Overview</h1>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan/20 to-transparent ml-4 rounded-full max-w-[200px]" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loadingM ? (
          Array.from({ length: 6 }).map((_, i) => <KPISkeleton key={i} />)
        ) : m ? (
          <>
            <KPICard label="Total Usuários" value={m.usuarios_unicos} icon={Users} />
            <KPICard label="Planos Ativos" value={m.pedidos_ativos} icon={Zap} color="text-success" />
            <KPICard label="Chips Online" value={m.instancias_online} icon={Cpu} color="text-success" />
            <KPICard label="Receita Total" value={formatCurrency(receitaTotal)} icon={DollarSign} color="text-success" />
            <KPICard label="Novos Hoje" value={m.novos_hoje} icon={UserPlus} color="text-amber" />
            <KPICard label="Conversão" value={`${taxaConversao.toFixed(1)}%`} icon={TrendingUp} subtitle={`${m.planos_pagos} pagos / ${m.testes_gratis} testes`} />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico Crescimento */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-7 relative overflow-hidden group hover:border-cyan/20 transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          <h3 className="text-txt0 font-semibold mb-6 tracking-wide flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan drop-shadow-[0_0_8px_currentColor]" />
            Crescimento (30 dias)
          </h3>
          {loadingC ? (
            <div className="h-64 animate-pulse bg-coal/20 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={crescimento || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="dia" stroke="#808090" tick={{ fontSize: 11 }}
                  tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                <YAxis stroke="#808090" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }}
                  labelStyle={{ color: '#f0f0f0' }}
                  labelFormatter={v => new Date(v).toLocaleDateString('pt-BR')}
                />
                <Area type="monotone" dataKey="novos_pedidos" stroke="#00e5ff" strokeWidth={2} fill="#00e5ff" fillOpacity={0.15} name="Novos" />
                <Area type="monotone" dataKey="pagos" stroke="#00e676" strokeWidth={2} fill="#00e676" fillOpacity={0.1} name="Pagos" />
                <Area type="monotone" dataKey="testes" stroke="#ffa000" strokeWidth={2} fill="#ffa000" fillOpacity={0.1} name="Testes" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Gráfico Receita */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-2xl p-7 relative overflow-hidden group hover:border-purple-neon/20 transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-neon/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          <h3 className="text-txt0 font-semibold mb-6 tracking-wide flex items-center gap-2">
            <PieChartIcon size={18} className="text-purple-neon drop-shadow-[0_0_8px_currentColor]" />
            Receita por Plano
          </h3>
          {loadingR ? (
            <div className="h-64 animate-pulse bg-coal/20 rounded" />
          ) : (
            <div className="grid grid-cols-2 gap-4 items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={(receita || []).filter(r => r.receita_total > 0)}
                    dataKey="receita_total"
                    nameKey="plano"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {(receita || []).filter(r => r.receita_total > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }}
                    formatter={(v) => formatCurrency(Number(v))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 text-sm flex-1">
                {(receita || []).filter(r => r.receita_total > 0).map((r, i) => (
                  <div key={r.plano} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-coal/30 hover:bg-black/40 transition-colors">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: PIE_COLORS[i % PIE_COLORS.length], color: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-txt1 font-medium flex-1 truncate">{r.plano}</span>
                    <span className="text-txt0 font-mono font-bold tracking-tight">{formatCurrency(r.receita_total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Saúde */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl p-7 relative overflow-hidden group hover:border-success/20 transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          <h3 className="text-txt0 font-semibold mb-6 tracking-wide flex items-center gap-2">
            <Wifi size={18} className="text-success drop-shadow-[0_0_8px_currentColor]" />
            Saúde do Sistema
          </h3>
          {m && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-5 bg-black/30 border border-coal/50 rounded-xl hover:border-success/30 transition-colors">
                  <div className="p-2.5 bg-success/10 rounded-lg">
                    <Wifi size={20} className="text-success drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <div>
                    <div className="text-txt0 font-bold font-mono tracking-tight text-lg">{m.instancias_online}</div>
                    <div className="text-txt2 text-xs font-medium uppercase tracking-wider">Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-black/30 border border-coal/50 rounded-xl hover:border-crimson/30 transition-colors">
                  <div className="p-2.5 bg-crimson/10 rounded-lg">
                    <WifiOff size={20} className="text-crimson drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <div>
                    <div className="text-txt0 font-bold font-mono tracking-tight text-lg">{m.instancias_offline}</div>
                    <div className="text-txt2 text-xs font-medium uppercase tracking-wider">Offline</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-black/30 border border-coal/50 rounded-xl hover:border-warning/30 transition-colors">
                  <div className="p-2.5 bg-warning/10 rounded-lg">
                    <Clock size={20} className="text-warning drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <div>
                    <div className="text-txt0 font-bold font-mono tracking-tight text-lg">{m.pedidos_aguardando}</div>
                    <div className="text-txt2 text-xs font-medium uppercase tracking-wider">Aguardando</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-black/30 border border-coal/50 rounded-xl hover:border-crimson/30 transition-colors">
                  <div className="p-2.5 bg-crimson/10 rounded-lg">
                    <AlertTriangle size={20} className="text-crimson drop-shadow-[0_0_8px_currentColor]" />
                  </div>
                  <div>
                    <div className="text-txt0 font-bold font-mono tracking-tight text-lg">{m.pedidos_expirados}</div>
                    <div className="text-txt2 text-xs font-medium uppercase tracking-wider">Expirados</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-txt1/80 font-mono mb-2 uppercase tracking-wider">
                  <span>Online vs Total</span>
                  <span className="text-success">{m.total_instancias > 0 ? ((m.instancias_online / m.total_instancias) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-black/50 border border-coal/50 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,230,118,0.8)] relative"
                    style={{ width: `${m.total_instancias > 0 ? (m.instancias_online / m.total_instancias) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feed Atividade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-7 relative overflow-hidden group hover:border-amber/20 transition-colors duration-300"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          <h3 className="text-txt0 font-semibold mb-6 tracking-wide flex items-center gap-2">
            <Zap size={18} className="text-amber drop-shadow-[0_0_8px_currentColor]" />
            Atividade Recente
          </h3>
          {loadingL ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-coal/20 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {(logs || []).map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="flex items-center gap-4 p-4 bg-black/30 border border-coal/30 hover:border-coal hover:bg-black/50 rounded-xl transition-colors"
                >
                  <StatusBadge status={log.evento} />
                  <div className="flex-1 min-w-0">
                    <div className="text-txt0 text-sm font-medium truncate">{log.instancia}</div>
                    <div className="text-txt2 text-xs truncate">{log.usuario_nome || log.usuario_email}</div>
                  </div>
                  <span className="text-txt2/80 text-xs font-mono whitespace-nowrap bg-black/40 px-2 py-1 rounded">{formatDate(log.criado_em)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Receita Bar Chart */}
      {!loadingR && receita && receita.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-7 relative overflow-hidden group hover:border-blue-neon/20 transition-colors duration-300 xl:col-span-2"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-neon/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          <h3 className="text-txt0 font-semibold mb-6 tracking-wide flex items-center gap-2">
            <BarChartIcon size={18} className="text-blue-neon drop-shadow-[0_0_8px_currentColor]" />
            Quantidade por Plano
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={receita}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="plano" stroke="#8b949e" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: 'rgba(13, 17, 26, 0.9)', border: '1px solid rgba(56, 65, 89, 0.4)', borderRadius: 12, backdropFilter: 'blur(8px)' }}
                itemStyle={{ color: '#00e5ff' }}
              />
              <Bar dataKey="quantidade" fill="#00e5ff" radius={[6, 6, 0, 0]} name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
