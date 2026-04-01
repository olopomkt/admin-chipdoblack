import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
}

export function KPICard({ label, value, icon: Icon, color = 'text-ember', subtitle }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg2 border border-coal rounded-xl p-5 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-txt2 text-sm">{label}</span>
        <Icon size={20} className={color} />
      </div>
      <span className="text-2xl font-bold text-txt0">{value}</span>
      {subtitle && <span className="text-xs text-txt2">{subtitle}</span>}
    </motion.div>
  )
}
