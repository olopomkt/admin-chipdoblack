import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-txt1 text-sm leading-relaxed mb-8">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg bg-bg3 text-txt1 hover:text-txt0 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
            danger
              ? 'bg-crimson/20 text-crimson hover:bg-crimson/30'
              : 'bg-ember/20 text-ember hover:bg-ember/30'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
