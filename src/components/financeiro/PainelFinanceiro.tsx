import { useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Award, ShoppingCart } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { apiFetch } from '../../config/api'
import { usePolling } from '../../hooks/usePolling'
import { KPICard } from '../ui/KPICard'
import { KPISkeleton } from '../ui/Skeleton'
import { formatCurrency, PLANOS_PRECOS } from '../../types'
import type { Receita, Metricas, Crescimento } from '../../types'


export function PainelFinanceiro() {
  const fetchReceita = useCallback(() => apiFetch('/admin_receita') as Promise<Receita[]>, [])
  const fetchMetricas = useCallback(() => apiFetch('/admin_metricas') as Promise<Metricas[]>, [])
  const fetchCrescimento = useCallback(() => apiFetch('/admin_crescimento') as Promise<Crescimento[]>, [])

  const { data: receita, loading: loadingR } = usePolling(fetchReceita, 30000)
  const { data: metricasArr, loading: loadingM } = usePolling(fetchMetricas, 30000)
  const { data: crescimento, loading: loadingC } = usePolling(fetchCrescimento, 30000)

  const m = metricasArr?.[0] ?? null

  const stats = useMemo(() => {
    if (!receita) return { total: 0, melhorPlano: '—', ticketMedio: 0, conversao: 0 }
    const pagos = receita.filter(r => PLANOS_PRECOS[r.plano] > 0)
    const total = pagos.reduce((s, r) => s + r.receita_total, 0)
    const totalQtd = pagos.reduce((s, r) => s + r.quantidade, 0)
    const melhor = pagos.sort((a, b) => b.quantidade - a.quantidade)[0]
    return {
      total,
      melhorPlano: melhor?.plano || '—',
      ticketMedio: totalQtd > 0 ? total / totalQtd : 0,
      conversao: m ? (m.planos_pagos / Math.max(m.total_pedidos, 1)) * 100 : 0,
    }
  }, [receita, m])

  // Receita acumulada
  const receitaAcumulada = useMemo(() => {
    if (!crescimento) return []
    let acc = 0
    return crescimento.map(day => {
      // Estimate daily revenue: pagos * avg ticket
      acc += day.pagos * stats.ticketMedio
      return { dia: day.dia, acumulada: Math.round(acc) }
    })
  }, [crescimento, stats.ticketMedio])

  const receitaPaga = (receita || []).filter(r => PLANOS_PRECOS[r.plano] > 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt0">Financeiro</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingM || loadingR ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard label="Receita Total" value={formatCurrency(stats.total)} icon={DollarSign} color="text-amber" />
            <KPICard label="Plano Mais Vendido" value={stats.melhorPlano} icon={Award} color="text-ember" />
            <KPICard label="Ticket Médio" value={formatCurrency(stats.ticketMedio)} icon={ShoppingCart} />
            <KPICard
              label="Conversão"
              value={`${stats.conversao.toFixed(1)}%`}
              icon={TrendingUp}
              color="text-success"
              subtitle={m ? `${m.testes_gratis} testes → ${m.planos_pagos} pagos` : ''}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Receita por plano bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Receita por Plano</h3>
          {loadingR ? (
            <div className="h-64 animate-pulse bg-coal/20 rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={receitaPaga}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="plano" stroke="#808090" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#808090" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }}
                  formatter={(v) => formatCurrency(Number(v))}
                />
                <Bar dataKey="receita_total" fill="#da582d" radius={[4, 4, 0, 0]} name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie testes vs pagos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Testes Grátis vs Pagos</h3>
          {!m ? (
            <div className="h-64 animate-pulse bg-coal/20 rounded" />
          ) : (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width="50%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Testes Grátis', value: m.testes_gratis },
                      { name: 'Planos Pagos', value: m.planos_pagos },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                  >
                    <Cell fill="#808090" />
                    <Cell fill="#27ae60" />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#808090]" />
                  <span className="text-txt2 text-sm">Testes Grátis</span>
                  <span className="text-txt0 font-bold ml-2">{m.testes_gratis}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-txt2 text-sm">Pagos</span>
                  <span className="text-txt0 font-bold ml-2">{m.planos_pagos}</span>
                </div>
                <div className="pt-2 border-t border-coal">
                  <span className="text-txt2 text-xs">Taxa de conversão</span>
                  <div className="text-ember font-bold text-lg">{stats.conversao.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Receita acumulada */}
      {!loadingC && receitaAcumulada.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg2 border border-coal rounded-xl p-5"
        >
          <h3 className="text-txt0 font-semibold mb-4">Receita Acumulada (estimada, 30 dias)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={receitaAcumulada}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="dia" stroke="#808090" tick={{ fontSize: 11 }}
                tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
              <YAxis stroke="#808090" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8 }}
                formatter={(v) => formatCurrency(Number(v))}
                labelFormatter={v => new Date(v).toLocaleDateString('pt-BR')}
              />
              <Area type="monotone" dataKey="acumulada" stroke="#e8943a" fill="#e8943a" fillOpacity={0.15} name="Acumulada" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Tabela detalhada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg2 border border-coal rounded-xl p-5"
      >
        <h3 className="text-txt0 font-semibold mb-4">Detalhamento por Plano</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-coal text-txt2">
                <th className="px-4 py-3 text-left">Plano</th>
                <th className="px-4 py-3 text-right">Qtd</th>
                <th className="px-4 py-3 text-right">Preço Unit.</th>
                <th className="px-4 py-3 text-right">Receita</th>
                <th className="px-4 py-3 text-right">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {(receita || []).map(r => (
                <tr key={r.plano} className="border-b border-coal/30 hover:bg-bg3">
                  <td className="px-4 py-3 text-txt0 font-mono text-xs">{r.plano}</td>
                  <td className="px-4 py-3 text-right text-txt1">{r.quantidade}</td>
                  <td className="px-4 py-3 text-right text-txt1">{formatCurrency(r.preco_unitario)}</td>
                  <td className="px-4 py-3 text-right text-txt0 font-medium">{formatCurrency(r.receita_total)}</td>
                  <td className="px-4 py-3 text-right text-txt2">
                    {stats.total > 0 ? ((r.receita_total / stats.total) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-coal font-bold">
                <td className="px-4 py-3 text-txt0">Total</td>
                <td className="px-4 py-3 text-right text-txt0">
                  {(receita || []).reduce((s, r) => s + r.quantidade, 0)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-ember">{formatCurrency(stats.total)}</td>
                <td className="px-4 py-3 text-right text-txt2">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
