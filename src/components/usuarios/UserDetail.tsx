import { useState, useEffect } from 'react'
import { Cpu, ScrollText, Calendar, Zap, Hash, Clock } from 'lucide-react'
import { apiFetch } from '../../config/api'
import { Modal } from '../ui/Modal'
import { StatusBadge } from '../ui/StatusBadge'
import { useToast } from '../ui/ToastContext'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { formatDate, formatCurrency, PLANOS_PRECOS } from '../../types'
import type { Pedido, Instancia, ChipLog } from '../../types'

interface UserDetailProps {
  pedido: Pedido | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export function UserDetail({ pedido, open, onClose, onUpdated }: UserDetailProps) {
  const { toast } = useToast()
  const [instancias, setInstancias] = useState<Instancia[]>([])
  const [logs, setLogs] = useState<ChipLog[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null)

  // Action form states
  const [extendDays, setExtendDays] = useState(2)
  const [newFreq, setNewFreq] = useState('')
  const [newMaxChips, setNewMaxChips] = useState(0)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (pedido && open) {
      setLoading(true)
      setNewFreq(pedido.frequencia)
      setNewMaxChips(pedido.max_chips)
      setNewStatus(pedido.status)
      Promise.all([
        apiFetch(`/users_instancias?pedido_token=eq.${pedido.token}`),
        apiFetch(`/chip_logs?instancia=in.(${encodeURIComponent('')})&order=criado_em.desc&limit=50`).catch(() => []),
      ]).then(([inst]) => {
        setInstancias(inst || [])
        // Fetch logs for all instances
        if (inst && inst.length > 0) {
          const names = inst.map((i: Instancia) => i.instancia).join(',')
          apiFetch(`/chip_logs?instancia=in.(${names})&order=criado_em.desc&limit=50`)
            .then(l => setLogs(l || []))
            .catch(() => setLogs([]))
        } else {
          setLogs([])
        }
      }).finally(() => setLoading(false))
    }
  }, [pedido, open])

  if (!pedido) return null

  const preco = PLANOS_PRECOS[pedido.plano] ?? 0

  const patchPedido = async (body: Record<string, unknown>) => {
    await apiFetch(`/chip_pedidos?token=eq.${pedido.token}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    toast('Pedido atualizado!', 'success')
    onUpdated()
  }

  const handleExtend = () => {
    setConfirmAction({
      title: 'Estender Prazo',
      message: `Adicionar ${extendDays} dias ao pedido de ${pedido.nome}?`,
      action: async () => {
        const newEnd = new Date(pedido.data_fim)
        newEnd.setDate(newEnd.getDate() + extendDays)
        await patchPedido({ data_fim: newEnd.toISOString() })
      },
    })
  }

  const handleChangeFreq = () => {
    setConfirmAction({
      title: 'Alterar Frequência',
      message: `Mudar frequência para "${newFreq}"?`,
      action: () => patchPedido({ frequencia: newFreq }),
    })
  }

  const handleChangeMaxChips = () => {
    setConfirmAction({
      title: 'Alterar Máx. Chips',
      message: `Alterar máximo de chips para ${newMaxChips}?`,
      action: () => patchPedido({ max_chips: newMaxChips }),
    })
  }

  const handleChangeStatus = () => {
    setConfirmAction({
      title: 'Alterar Status',
      message: `Mudar status para "${newStatus}"?`,
      action: () => patchPedido({ status: newStatus }),
    })
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={`Pedido — ${pedido.nome}`} wide>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-coal/30 rounded" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoItem icon={Hash} label="Token" value={pedido.token.slice(0, 8) + '...'} />
              <InfoItem icon={Zap} label="Plano" value={pedido.plano} />
              <InfoItem icon={Calendar} label="Início" value={formatDate(pedido.data_inicio)} />
              <InfoItem icon={Clock} label="Fim" value={formatDate(pedido.data_fim)} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">E-mail:</span> <span className="text-txt0 ml-1.5">{pedido.email}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Telefone:</span> <span className="text-txt0 ml-1.5">{pedido.telefone}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Status:</span> <StatusBadge status={pedido.status} /></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Valor:</span> <span className="text-txt0 ml-1.5">{formatCurrency(preco)}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Frequência:</span> <span className="text-txt0 ml-1.5">{pedido.frequencia}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Max Chips:</span> <span className="text-txt0 ml-1.5">{pedido.max_chips}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">Conectados:</span> <span className="text-txt0 ml-1.5">{pedido.chips_conectados}</span></div>
              <div className="p-3 bg-bg3/50 rounded-lg"><span className="text-txt2">IP:</span> <span className="text-txt0 ml-1.5">{pedido.ip_cadastro || '—'}</span></div>
            </div>

            {/* Chips */}
            <div>
              <h4 className="text-txt0 font-semibold mb-3 flex items-center gap-2">
                <Cpu size={16} /> Chips Vinculados ({instancias.length})
              </h4>
              {instancias.length === 0 ? (
                <p className="text-txt2 text-sm">Nenhum chip conectado.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-coal">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg3 text-txt2">
                        <th className="px-4 py-3 text-left">Instância</th>
                        <th className="px-4 py-3 text-left">WhatsApp</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">1a Msg</th>
                        <th className="px-4 py-3 text-left">Atualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instancias.map(inst => (
                        <tr key={inst.id} className="border-t border-coal/50">
                          <td className="px-4 py-3 text-txt0 font-mono text-xs">{inst.instancia}</td>
                          <td className="px-4 py-3 text-txt1">{inst.whatsapp}</td>
                          <td className="px-4 py-3"><StatusBadge status={inst.status} /></td>
                          <td className="px-4 py-3 text-txt1">{inst.primeira_mensagem_enviada === 'true' ? 'Sim' : 'Não'}</td>
                          <td className="px-4 py-3 text-txt2 text-xs">{formatDate(inst.updated_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Logs */}
            <div>
              <h4 className="text-txt0 font-semibold mb-3 flex items-center gap-2">
                <ScrollText size={16} /> Logs ({logs.length})
              </h4>
              {logs.length === 0 ? (
                <p className="text-txt2 text-sm">Nenhum log.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-sm p-3 bg-bg3 rounded-lg">
                      <StatusBadge status={log.evento} />
                      <span className="text-txt1 font-mono text-xs">{log.instancia}</span>
                      <span className="text-txt2 text-xs flex-1 truncate">{typeof log.detalhes === 'object' && log.detalhes !== null ? JSON.stringify(log.detalhes) : String(log.detalhes || '—')}</span>
                      <span className="text-txt2 text-xs">{formatDate(log.criado_em)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-coal pt-5">
              <h4 className="text-txt0 font-semibold mb-4">Ações</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-bg3 rounded-lg">
                  <label className="text-txt2 text-sm whitespace-nowrap">Estender:</label>
                  <input type="number" min={1} max={30} value={extendDays} onChange={e => setExtendDays(+e.target.value)}
                    className="w-16 px-2 py-1 bg-bg1 border border-coal rounded text-txt0 text-sm" />
                  <span className="text-txt2 text-sm">dias</span>
                  <button onClick={handleExtend} className="ml-auto px-3 py-1 bg-ember/20 text-ember rounded text-sm hover:bg-ember/30">Aplicar</button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-bg3 rounded-lg">
                  <label className="text-txt2 text-sm whitespace-nowrap">Frequência:</label>
                  <select value={newFreq} onChange={e => setNewFreq(e.target.value)}
                    className="flex-1 px-2 py-1 bg-bg1 border border-coal rounded text-txt0 text-sm">
                    <option value="tranquilo">Tranquilo</option>
                    <option value="neutro">Neutro</option>
                    <option value="rapido">Rápido</option>
                  </select>
                  <button onClick={handleChangeFreq} className="px-3 py-1 bg-ember/20 text-ember rounded text-sm hover:bg-ember/30">Aplicar</button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-bg3 rounded-lg">
                  <label className="text-txt2 text-sm whitespace-nowrap">Max Chips:</label>
                  <input type="number" min={1} max={20} value={newMaxChips} onChange={e => setNewMaxChips(+e.target.value)}
                    className="w-16 px-2 py-1 bg-bg1 border border-coal rounded text-txt0 text-sm" />
                  <button onClick={handleChangeMaxChips} className="ml-auto px-3 py-1 bg-ember/20 text-ember rounded text-sm hover:bg-ember/30">Aplicar</button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-bg3 rounded-lg">
                  <label className="text-txt2 text-sm whitespace-nowrap">Status:</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="flex-1 px-2 py-1 bg-bg1 border border-coal rounded text-txt0 text-sm">
                    <option value="aguardando_conexao">Aguardando</option>
                    <option value="aquecendo">Aquecendo</option>
                    <option value="expirado">Expirado</option>
                    <option value="pausado">Pausado</option>
                  </select>
                  <button onClick={handleChangeStatus} className="px-3 py-1 bg-ember/20 text-ember rounded text-sm hover:bg-ember/30">Aplicar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (confirmAction) {
            try { await confirmAction.action() } catch (e) { toast(String(e), 'error') }
          }
        }}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
      />
    </>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-bg3 rounded-lg">
      <Icon size={14} className="text-ember" />
      <div>
        <div className="text-txt2 text-xs mb-0.5">{label}</div>
        <div className="text-txt0 text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
