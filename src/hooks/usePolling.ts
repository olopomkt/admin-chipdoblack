import { useEffect, useRef, useCallback, useState } from 'react'

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number = 30000
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const result = await fetchFn()
      if (mountedRef.current) {
        setData(result)
        setError(null)
        setLoading(false)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setLoading(false)
      }
    }
  }, [fetchFn])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    intervalRef.current = window.setInterval(refresh, intervalMs)
    return () => {
      mountedRef.current = false
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh, intervalMs])

  return { data, loading, error, refresh }
}
