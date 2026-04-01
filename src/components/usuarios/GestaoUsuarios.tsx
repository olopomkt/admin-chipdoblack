import { useState, useCallback } from 'react'
import { apiFetch } from '../../config/api'
import { usePolling } from '../../hooks/usePolling'
import { DataTable, type Column } from '../ui/DataTable'
import { StatusBadge } from '../ui/StatusBadge'
import { UserDetail } from './UserDetail'
import { formatDate } from '../../types'
import type { Pedido } from '../../types'

export function GestaoUsuarios() {
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [planoFilter, setPlanoFilter] = useState('')

  const fetchPedidos = useCallback(() => {
    let url = '/chip_pedidos?order=criado_em.desc&limit=500'
    if (statusFilter) url += `&status=eq.${statusFilter}`
    if (planoFilter) url += `&plano=eq.${planoFilter}`
    return apiFetch(url) as Promise<Pedido[]>
  }, [statusFilter, planoFilter])

  const { data: pedidos, loading, refresh } = usePolling(fetchPedidos, 30000)

  const columns: Column<Pedido>[] = [
    { key: 'nome', label: 'Nome', render: row => <span className="text-txt0 font-medium">{row.nome}</span> },
    { key: 'email', label: 'E-mail', className: 'hidden md:table-cell' },
    { key: 'telefone', label: 'Telefone', className: 'hidden lg:table-cell' },
    { key: 'plano', label: 'Plano', render: row => <span className="font-mono text-xs">{row.plano}</span> },
    { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
    { key: 'chips_conectados', label: 'Chips', render: row => <span>{row.chips_conectados}/{row.max_chips}</span> },
    { key: 'criado_em', label: 'Criado', render: row => <span className="text-xs">{formatDate(row.criado_em)}</span>, className: 'hidden lg:table-cell' },
    { key: 'data_fim', label: 'Expira', render: row => <span className="text-xs">{formatDate(row.data_fim)}</span>, className: 'hidden xl:table-cell' },
  ]

  const planos = [...new Set((pedidos || []).map(p => p.plano))].sort()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt0">Gestão de Usuários</h1>

      <DataTable
        columns={columns}
        data={pedidos || []}
        loading={loading}
        searchKeys={['nome', 'email', 'telefone']}
        searchPlaceholder="Buscar por nome, e-mail ou telefone..."
        onRowClick={(row) => setSelectedPedido(row)}
        exportable
        exportFilename="usuarios-chipdoblack"
        filters={
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt1"
            >
              <option value="">Todos os status</option>
              <option value="aquecendo">Aquecendo</option>
              <option value="aguardando_conexao">Aguardando</option>
              <option value="expirado">Expirado</option>
              <option value="pausado">Pausado</option>
            </select>
            <select
              value={planoFilter}
              onChange={e => setPlanoFilter(e.target.value)}
              className="px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt1"
            >
              <option value="">Todos os planos</option>
              {planos.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        }
      />

      <UserDetail
        pedido={selectedPedido}
        open={!!selectedPedido}
        onClose={() => setSelectedPedido(null)}
        onUpdated={refresh}
      />
    </div>
  )
}
