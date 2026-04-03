import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Eye, EyeOff, Loader2 } from 'lucide-react'

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  error: string | null
  loading: boolean
}

export function Login({ onLogin, error, loading }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen bg-bg1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ember/10 rounded-2xl mb-4">
            <Flame size={32} className="text-ember" />
          </div>
          <h1 className="text-2xl font-bold text-txt0">Chip do Black</h1>
          <p className="text-txt2 mt-1">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg2 border border-coal rounded-xl p-7 space-y-5">
          <div>
            <label className="block text-sm text-txt2 mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-bg3 border border-coal rounded-lg text-txt0 placeholder-txt2 focus:outline-none focus:border-ember/50"
              placeholder="admin@chipdoblack.online"
            />
          </div>

          <div>
            <label className="block text-sm text-txt2 mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-bg3 border border-coal rounded-lg text-txt0 placeholder-txt2 focus:outline-none focus:border-ember/50 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt2 hover:text-txt0"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-2.5 bg-crimson/10 border border-crimson/30 rounded-lg text-crimson text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ember hover:bg-ember/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
