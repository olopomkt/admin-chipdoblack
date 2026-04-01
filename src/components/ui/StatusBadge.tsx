const statusConfig: Record<string, { label: string; className: string }> = {
  aquecendo: { label: 'Aquecendo', className: 'bg-success/20 text-success border-success/30' },
  aguardando_conexao: { label: 'Aguardando', className: 'bg-warning/20 text-warning border-warning/30' },
  expirado: { label: 'Expirado', className: 'bg-txt2/20 text-txt2 border-txt2/30' },
  pausado: { label: 'Pausado', className: 'bg-amber/20 text-amber border-amber/30' },
  conectada: { label: 'Online', className: 'bg-success/20 text-success border-success/30' },
  desconectada: { label: 'Offline', className: 'bg-crimson/20 text-crimson border-crimson/30' },
  pendente: { label: 'Pendente', className: 'bg-warning/20 text-warning border-warning/30' },
  conectou: { label: 'Conectou', className: 'bg-success/20 text-success border-success/30' },
  desconectou: { label: 'Desconectou', className: 'bg-crimson/20 text-crimson border-crimson/30' },
  ban: { label: 'Ban', className: 'bg-crimson/20 text-crimson border-crimson/30' },
  expirou: { label: 'Expirou', className: 'bg-txt2/20 text-txt2 border-txt2/30' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-coal text-txt2 border-coal' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
