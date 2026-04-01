import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-bg2 border border-coal rounded-xl shadow-2xl ${wide ? 'w-[90vw] max-w-4xl' : 'w-[90vw] max-w-lg'} max-h-[85vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-coal">
              <h3 className="text-lg font-semibold text-txt0">{title}</h3>
              <button onClick={onClose} className="text-txt2 hover:text-txt0 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
