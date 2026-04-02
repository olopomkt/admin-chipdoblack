import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
}

export function KPICard({ label, value, icon: Icon, color = 'text-cyan', subtitle }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,229,255,0.15)] hover:border-cyan/30 transition-all duration-300"
    >
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full -mr-16 -mt-16 group-hover:from-cyan/10 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10">
        <span className="text-txt2 text-xs font-semibold tracking-wider uppercase">{label}</span>
        <div className={`p-2.5 rounded-xl bg-black/40 border border-coal ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className="drop-shadow-[0_0_8px_currentColor]" />
        </div>
      </div>
      <span className="text-3xl font-bold text-txt0 font-mono tracking-tight relative z-10 drop-shadow-md">{value}</span>
      {subtitle && <span className="text-xs text-txt1/70 font-mono relative z-10">{subtitle}</span>}
    </motion.div>
  )
}
