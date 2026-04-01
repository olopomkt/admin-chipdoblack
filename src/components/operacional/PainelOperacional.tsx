import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Plus, Trash2, ExternalLink, Users,
  Loader2, RefreshCw, Gift,
} from 'lucide-react'
import { apiFetch } from '../../config/api'
import { useToast } from '../ui/Toast'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Modal } from '../ui/Modal'
import type { AdminUser } from '../../types'

export function PainelOperacional() {
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-txt0">Operacional</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AcoesEmMassa toast={toast} />
        <CriarCortesia toast={toast} />
      </div>

      <GerenciarAdmins toast={toast} />
      <LinksRapidos />
    </div>
  )
}

function AcoesEmMassa({ toast }: { toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [loading, setLoading] = useState(false)
  const [confirmExpire, setConfirmExpire] = useState(false)

  const expirarVencidos = async () => {
    setLoading(true)
    try {
      const now = new Date().toISOString()
      await apiFetch(`/chip_pedidos?data_fim=lt.${now}&status=neq.expirado`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'expirado' }),
      })
      toast('Planos vencidos expirados com sucesso!', 'success')
    } catch (e) {
      toast(String(e), 'error')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg2 border border-coal rounded-xl p-5"
    >
      <h3 className="text-txt0 font-semibold mb-4">Ações em Massa</h3>
      <div className="space-y-3">
        <button
          onClick={() => setConfirmExpire(true)}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-bg3 border border-coal rounded-lg text-sm text-txt1 hover:border-warning/50 hover:text-warning transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} className="text-warning" />}
          Expirar planos vencidos manualmente
        </button>
      </div>

      <ConfirmDialog
        open={confirmExpire}
        onClose={() => setConfirmExpire(false)}
        onConfirm={expirarVencidos}
        title="Expirar Planos Vencidos"
        message="Isso vai marcar como 'expirado' todos os pedidos com data_fim no passado. Deseja continuar?"
        confirmLabel="Expirar Todos"
        danger
      />
    </motion.div>
  )
}

function CriarCortesia({ toast }: { toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '',
    plano: '2chips_3dias', max_chips: 2, dias: 3, frequencia: 'neutro',
  })

  const handleCreate = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const fim = new Date(now)
      fim.setDate(fim.getDate() + form.dias)

      await apiFetch('/chip_pedidos', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          plano: form.plano,
          max_chips: form.max_chips,
          dias: form.dias,
          frequencia: form.frequencia,
          status: 'aguardando_conexao',
          chips_conectados: 0,
          data_inicio: now.toISOString(),
          data_fim: fim.toISOString(),
        }),
      })
      toast('Pedido cortesia criado!', 'success')
      setOpen(false)
      setForm({ nome: '', email: '', telefone: '', plano: '2chips_3dias', max_chips: 2, dias: 3, frequencia: 'neutro' })
    } catch (e) {
      toast(String(e), 'error')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-bg2 border border-coal rounded-xl p-5"
    >
      <h3 className="text-txt0 font-semibold mb-4">Cortesia</h3>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-bg3 border border-coal rounded-lg text-sm text-txt1 hover:border-ember/50 hover:text-ember transition-colors"
      >
        <Gift size={18} className="text-ember" />
        Criar pedido cortesia
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Criar Pedido Cortesia">
        <div className="space-y-4">
          <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome"
            className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0 placeholder-txt2" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="E-mail" type="email"
            className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0 placeholder-txt2" />
          <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone"
            className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0 placeholder-txt2" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-txt2 text-xs mb-1 block">Max Chips</label>
              <input type="number" min={1} max={20} value={form.max_chips}
                onChange={e => setForm({ ...form, max_chips: +e.target.value })}
                className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0" />
            </div>
            <div>
              <label className="text-txt2 text-xs mb-1 block">Dias</label>
              <input type="number" min={1} max={30} value={form.dias}
                onChange={e => setForm({ ...form, dias: +e.target.value })}
                className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0" />
            </div>
          </div>
          <select value={form.frequencia} onChange={e => setForm({ ...form, frequencia: e.target.value })}
            className="w-full px-3 py-2 bg-bg3 border border-coal rounded-lg text-sm text-txt0">
            <option value="tranquilo">Tranquilo</option>
            <option value="neutro">Neutro</option>
            <option value="rapido">Rápido</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={loading || !form.nome || !form.email}
            className="w-full py-2.5 bg-ember hover:bg-ember/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Criar Cortesia
          </button>
        </div>
      </Modal>
    </motion.div>
  )
}

function GerenciarAdmins({ toast }: { toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newNome, setNewNome] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/admin_users?order=criado_em.desc')
      setAdmins(data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const addAdmin = async () => {
    try {
      await apiFetch('/admin_users', {
        method: 'POST',
        body: JSON.stringify({ email: newEmail, nome: newNome }),
      })
      toast('Admin adicionado!', 'success')
      setShowAdd(false)
      setNewEmail('')
      setNewNome('')
      fetchAdmins()
    } catch (e) {
      toast(String(e), 'error')
    }
  }

  const removeAdmin = async (admin: AdminUser) => {
    try {
      await apiFetch(`/admin_users?email=eq.${admin.email}`, { method: 'DELETE' })
      toast('Admin removido!', 'success')
      fetchAdmins()
    } catch (e) {
      toast(String(e), 'error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-bg2 border border-coal rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-txt0 font-semibold flex items-center gap-2">
          <Users size={18} /> Administradores
        </h3>
        <div className="flex gap-2">
          <button onClick={fetchAdmins} className="p-2 text-txt2 hover:text-txt0 rounded">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-3 py-1.5 bg-ember/20 text-ember rounded-lg text-sm hover:bg-ember/30"
          >
            <Plus size={14} /> Adicionar
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="flex gap-2 mb-4 p-3 bg-bg3 rounded-lg">
          <input value={newNome} onChange={e => setNewNome(e.target.value)} placeholder="Nome"
            className="flex-1 px-3 py-2 bg-bg1 border border-coal rounded text-sm text-txt0 placeholder-txt2" />
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="E-mail" type="email"
            className="flex-1 px-3 py-2 bg-bg1 border border-coal rounded text-sm text-txt0 placeholder-txt2" />
          <button onClick={addAdmin} disabled={!newEmail}
            className="px-4 py-2 bg-ember text-white rounded text-sm disabled:opacity-50">
            Salvar
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-coal/30 rounded" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.email} className="flex items-center gap-3 p-3 bg-bg3 rounded-lg">
              <div className="flex-1">
                <div className="text-txt0 text-sm font-medium">{admin.nome}</div>
                <div className="text-txt2 text-xs">{admin.email}</div>
              </div>
              <button
                onClick={() => setDeleteTarget(admin)}
                className="p-1.5 text-txt2 hover:text-crimson rounded transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeAdmin(deleteTarget)}
        title="Remover Admin"
        message={`Remover "${deleteTarget?.nome}" (${deleteTarget?.email}) dos administradores?`}
        confirmLabel="Remover"
        danger
      />
    </motion.div>
  )
}

function LinksRapidos() {
  const links = [
    { label: 'N8N Editor', url: 'https://n8n.infinityacademyb2b.com.br', icon: ExternalLink },
    { label: 'Portainer', url: 'https://portainer.infinityacademyb2b.com.br', icon: ExternalLink },
    { label: 'Evolution API', url: 'https://evolution.infinityacademyb2b.com.br', icon: ExternalLink },
    { label: 'Status Page', url: 'https://status.chipdoblack.online', icon: ExternalLink },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-bg2 border border-coal rounded-xl p-5"
    >
      <h3 className="text-txt0 font-semibold mb-4">Links Rápidos</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {links.map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-bg3 border border-coal rounded-lg text-sm text-txt1 hover:text-ember hover:border-ember/30 transition-colors"
          >
            <link.icon size={16} />
            {link.label}
          </a>
        ))}
      </div>
    </motion.div>
  )
}
