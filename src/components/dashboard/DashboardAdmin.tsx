import { useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Zap, Cpu, DollarSign, UserPlus, TrendingUp,
  Wifi, WifiOff, Clock, AlertTriangle,
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

const PIE_COLORS = ['#da582d', '#e8943a', '#27ae60', '#3498db', '#9b59b6', '#f39c12', '#c0392b', '#1abc9c']

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
      <h1 className="text-2xl font-bold text-txt0">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loadingM ? (
          Array.from({ length: 6 }).map((_, i) => <KPISkeleton key={i} />)
        ) : m ? (
          <>
            <KPICard label="Total Usuários" value={m.usuarios_unicos} icon={Users} />
            <KPICard label="Planos Ativos" value={m.pedidos_ativos} icon={Zap} color="text-success" />
            <KPICard label="Chips Online" value={m.instancias_online} icon={Cpu} color="text-success" />
            <KPICard label="Receita Total" value={formatCurrency(receitaTotal)} icon={DollarSign} color="text-amber" />
            <KPICard label="Novos Hoje" value={m.novos_hoje} icon={UserPlus} color="text-amber" />
            <KPICard label="Conversão" value={`${taxaConversao.toFixed(1)}%`} icon={TrendingUp} subtitle={`${m.planos_pagos} pagos / ${m.testes_gratis} testes`} />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico Crescimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Crescimento (30 dias)</h3>
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
                <Area type="monotone" dataKey="novos_pedidos" stroke="#da582d" fill="#da582d" fillOpacity={0.15} name="Novos" />
                <Area type="monotone" dataKey="pagos" stroke="#27ae60" fill="#27ae60" fillOpacity={0.1} name="Pagos" />
                <Area type="monotone" dataKey="testes" stroke="#e8943a" fill="#e8943a" fillOpacity={0.1} name="Testes" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Gráfico Receita */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Receita por Plano</h3>
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
              <div className="space-y-2 text-sm">
                {(receita || []).filter(r => r.receita_total > 0).map((r, i) => (
                  <div key={r.plano} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-txt2 flex-1 truncate">{r.plano}</span>
                    <span className="text-txt0 font-medium">{formatCurrency(r.receita_total)}</span>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Saúde do Sistema</h3>
          {m && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
                  <Wifi size={18} className="text-success" />
                  <div>
                    <div className="text-txt0 font-semibold">{m.instancias_online}</div>
                    <div className="text-txt2 text-xs">Chips Online</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
                  <WifiOff size={18} className="text-crimson" />
                  <div>
                    <div className="text-txt0 font-semibold">{m.instancias_offline}</div>
                    <div className="text-txt2 text-xs">Chips Offline</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
                  <Clock size={18} className="text-warning" />
                  <div>
                    <div className="text-txt0 font-semibold">{m.pedidos_aguardando}</div>
                    <div className="text-txt2 text-xs">Aguardando Conexão</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
                  <AlertTriangle size={18} className="text-crimson" />
                  <div>
                    <div className="text-txt0 font-semibold">{m.pedidos_expirados}</div>
                    <div className="text-txt2 text-xs">Expirados</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-txt2 mb-1">
                  <span>Online vs Total</span>
                  <span>{m.total_instancias > 0 ? ((m.instancias_online / m.total_instancias) * 100).toFixed(0) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-bg3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${m.total_instancias > 0 ? (m.instancias_online / m.total_instancias) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feed Atividade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Atividade Recente</h3>
          {loadingL ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-coal/20 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(logs || []).map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-bg3 rounded-lg">
                  <StatusBadge status={log.evento} />
                  <div className="flex-1 min-w-0">
                    <div className="text-txt0 text-sm truncate">{log.instancia}</div>
                    <div className="text-txt2 text-xs truncate">{log.usuario_nome || log.usuario_email}</div>
                  </div>
                  <span className="text-txt2 text-xs whitespace-nowrap">{formatDate(log.criado_em)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Receita Bar Chart */}
      {!loadingR && receita && receita.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Quantidade por Plano</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={receita}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="plano" stroke="#808090" tick={{ fontSize: 10 }} />
              <YAxis stroke="#808090" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }}
              />
              <Bar dataKey="quantidade" fill="#da582d" radius={[4, 4, 0, 0]} name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}
