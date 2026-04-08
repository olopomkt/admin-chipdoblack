import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../config/api'
import { usePolling } from '../../hooks/usePolling'
import { DataTable, type Column } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDate } from '../../types'
import type { LogRecente } from '../../types'

const EVENTOS = ['conectou', 'desconectou', 'expirou', 'ban']

export function LogsEventos() {
  const [eventoFilter, setEventoFilter] = useState('')

  const fetchLogs = useCallback(() =>
    apiFetch('/admin_logs_recentes') as Promise<LogRecente[]>
  , [])

  const { data: allLogs, loading } = usePolling(fetchLogs, 30000)

  const logs = eventoFilter
    ? (allLogs || []).filter(l => l.evento === eventoFilter)
    : (allLogs || [])

  const eventCounts = (allLogs || []).reduce((acc, l) => {
    acc[l.evento] = (acc[l.evento] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const columns: Column<LogRecente>[] = [
    {
      key: 'evento',
      label: 'Evento',
      render: row => <StatusBadge status={row.evento} />,
    },
    {
      key: 'instancia',
      label: 'Instância',
      render: row => <span className="font-mono text-xs text-txt0">{row.instancia}</span>,
    },
    { key: 'usuario_nome', label: 'Usuário', render: row => <span className="text-txt0">{row.usuario_nome || '—'}</span> },
    { key: 'usuario_email', label: 'E-mail', className: 'hidden lg:table-cell' },
    { key: 'plano', label: 'Plano', render: row => <span className="font-mono text-xs">{row.plano}</span>, className: 'hidden md:table-cell' },
    { key: 'detalhes', label: 'Detalhes', render: row => <span className="text-txt2 text-xs truncate max-w-[200px] block">{row.detalhes || '—'}</span>, className: 'hidden xl:table-cell' },
    { key: 'criado_em', label: 'Data', render: row => <span className="text-xs">{formatDate(row.criado_em)}</span> },
  ]

  // Timeline visual
  const critical = logs.filter(l => l.evento === 'ban' || l.evento === 'desconectou')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt0">Logs & Eventos</h1>

      {/* Event summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {EVENTOS.map(ev => (
          <motion.button
            key={ev}
            whileHover={{ scale: 1.02 }}
            onClick={() => setEventoFilter(eventoFilter === ev ? '' : ev)}
            className={`p-4 rounded-xl border transition-colors text-left ${
              eventoFilter === ev
                ? 'bg-ember/10 border-ember/30'
                : 'bg-bg2 border-coal hover:border-coal/80'
            }`}
          >
            <StatusBadge status={ev} />
            <div className="text-xl font-bold text-txt0 mt-2">{eventCounts[ev] || 0}</div>
          </motion.button>
        ))}
      </div>

      {/* Critical events highlight */}
      {critical.length > 0 && (
        <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-5">
          <h3 className="text-crimson font-semibold text-sm mb-4">Eventos Críticos Recentes</h3>
          <div className="space-y-2.5 max-h-40 overflow-y-auto">
            {critical.slice(0, 10).map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-crimson/5">
                <StatusBadge status={log.evento} />
                <span className="text-txt0 font-mono text-xs">{log.instancia}</span>
                <span className="text-txt1">{log.usuario_nome || log.usuario_email}</span>
                <span className="text-txt2 text-xs ml-auto">{formatDate(log.criado_em)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-bg2 border border-coal rounded-xl p-6">
        <h3 className="text-txt0 font-semibold mb-5">Timeline</h3>
        <div className="relative pl-7 space-y-4 max-h-60 overflow-y-auto">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-coal" />
          {logs.slice(0, 20).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative flex items-center gap-3"
            >
              <div className={`absolute -left-[17px] w-2.5 h-2.5 rounded-full ${
                log.evento === 'ban' || log.evento === 'desconectou'
                  ? 'bg-crimson'
                  : log.evento === 'conectou'
                  ? 'bg-success'
                  : 'bg-txt2'
              }`} />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <StatusBadge status={log.evento} />
                <span className="text-txt0 text-sm font-mono truncate">{log.instancia}</span>
                <span className="text-txt2 text-xs truncate hidden md:inline">{log.usuario_nome}</span>
              </div>
              <span className="text-txt2 text-xs whitespace-nowrap">{formatDate(log.criado_em)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchKeys={['instancia', 'usuario_email', 'usuario_nome', 'detalhes']}
        searchPlaceholder="Buscar nos logs..."
        filters={
          <select
            value={eventoFilter}
            onChange={e => setEventoFilter(e.target.value)}
            className="px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt1"
          >
            <option value="">Todos os eventos</option>
            {EVENTOS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        }
      />
    </div>
  )
}
