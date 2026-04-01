import { useState, useCallback } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { apiFetch } from '../../config/api'
import { usePolling } from '../../hooks/usePolling'
import { DataTable, type Column } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { Modal } from '../ui/Modal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useToast } from '../ui/Toast'
import { formatDate } from '../../types'
import type { Instancia, ChipLog } from '../../types'

function hasProblems(inst: Instancia): string[] {
  const problems: string[] = []
  if (inst.status === 'desconectada') {
    const updated = new Date(inst.updated_at).getTime()
    if (Date.now() - updated > 3600000) problems.push('Offline há mais de 1h')
  }
  if (inst.processando_em) {
    const proc = new Date(inst.processando_em).getTime()
    if (Date.now() - proc > 120000) problems.push('Processamento travado (>2min)')
  }
  if (inst.primeira_mensagem_enviada !== 'true') {
    problems.push('Sem primeira mensagem')
  }
  return problems
}

export function MonitoramentoChips() {
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedChip, setSelectedChip] = useState<Instancia | null>(null)
  const [chipLogs, setChipLogs] = useState<ChipLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Instancia | null>(null)

  const fetchInstancias = useCallback(() => {
    let url = '/users_instancias?order=created_at.desc&limit=500'
    if (statusFilter) url += `&status=eq.${statusFilter}`
    return apiFetch(url) as Promise<Instancia[]>
  }, [statusFilter])

  const { data: instancias, loading, refresh } = usePolling(fetchInstancias, 30000)

  const openChipLogs = async (inst: Instancia) => {
    setSelectedChip(inst)
    setLoadingLogs(true)
    try {
      const logs = await apiFetch(`/chip_logs?instancia=eq.${inst.instancia}&order=criado_em.desc&limit=100`)
      setChipLogs(logs || [])
    } catch { setChipLogs([]) }
    setLoadingLogs(false)
  }

  const deleteInstancia = async (inst: Instancia) => {
    try {
      await apiFetch(`/users_instancias?instancia=eq.${inst.instancia}`, { method: 'DELETE' })
      toast('Instância deletada!', 'success')
      refresh()
    } catch (e) {
      toast(String(e), 'error')
    }
  }

  const columns: Column<Instancia>[] = [
    {
      key: 'instancia',
      label: 'Instância',
      render: row => {
        const probs = hasProblems(row)
        return (
          <div className="flex items-center gap-2">
            <span className="text-txt0 font-mono text-xs">{row.instancia}</span>
            {probs.length > 0 && (
              <span title={probs.join(', ')}>
                <AlertTriangle size={14} className="text-warning" />
              </span>
            )}
          </div>
        )
      },
    },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
    { key: 'frequencia', label: 'Freq.' },
    { key: 'pedido_token', label: 'Token', render: row => <span className="font-mono text-xs">{String(row.pedido_token).slice(0, 8)}</span>, className: 'hidden lg:table-cell' },
    { key: 'data_fim', label: 'Expira', render: row => <span className="text-xs">{formatDate(row.data_fim)}</span>, className: 'hidden lg:table-cell' },
    { key: 'processando_em', label: 'Proc.', render: row => row.processando_em ? <span className="text-xs">{formatDate(row.processando_em)}</span> : <span className="text-txt2">—</span>, className: 'hidden xl:table-cell' },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: row => (
        <button
          onClick={e => { e.stopPropagation(); setDeleteTarget(row) }}
          className="p-1.5 text-txt2 hover:text-crimson rounded transition-colors"
          title="Deletar instância"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ]

  const problematicos = (instancias || []).filter(i => hasProblems(i).length > 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt0">Monitoramento de Chips</h1>

      {problematicos.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-warning" />
            <span className="text-warning font-semibold text-sm">{problematicos.length} chip(s) com problemas</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {problematicos.slice(0, 6).map(inst => (
              <div key={inst.id} className="flex items-center gap-2 text-sm p-2 bg-bg2 rounded">
                <span className="text-txt0 font-mono text-xs">{inst.instancia}</span>
                <span className="text-warning text-xs">{hasProblems(inst).join(', ')}</span>
              </div>
            ))}
            {problematicos.length > 6 && (
              <div className="text-txt2 text-sm p-2">+{problematicos.length - 6} mais...</div>
            )}
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={instancias || []}
        loading={loading}
        searchKeys={['instancia', 'whatsapp', 'pedido_token']}
        searchPlaceholder="Buscar por instância, WhatsApp ou token..."
        onRowClick={(row) => openChipLogs(row)}
        filters={
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt1"
          >
            <option value="">Todos os status</option>
            <option value="conectada">Online</option>
            <option value="desconectada">Offline</option>
            <option value="pendente">Pendente</option>
          </select>
        }
      />

      {/* Modal logs do chip */}
      <Modal
        open={!!selectedChip}
        onClose={() => setSelectedChip(null)}
        title={`Logs — ${selectedChip?.instancia || ''}`}
        wide
      >
        {loadingLogs ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-coal/30 rounded" />)}
          </div>
        ) : chipLogs.length === 0 ? (
          <p className="text-txt2">Nenhum log encontrado.</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {chipLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
                <StatusBadge status={log.evento} />
                <span className="text-txt1 text-sm flex-1">{log.detalhes || '—'}</span>
                <span className="text-txt2 text-xs whitespace-nowrap">{formatDate(log.criado_em)}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteInstancia(deleteTarget)}
        title="Deletar Instância"
        message={`Tem certeza que deseja deletar a instância "${deleteTarget?.instancia}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        danger
      />
    </div>
  )
}
