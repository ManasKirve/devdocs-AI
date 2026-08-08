import { useCallback, useEffect, useRef, useState } from 'react'
import { checkHealth } from '../services/health'
import type { HealthResponse } from '../types/health'

export type BackendState = 'loading' | 'connected' | 'offline'

const RECHECK_INTERVAL_MS = 30_000

interface UseHealthResult {
  state: BackendState
  health: HealthResponse | null
  recheck: () => void
}

export function useHealth(intervalMs: number = RECHECK_INTERVAL_MS): UseHealthResult {
  const [state, setState] = useState<BackendState>('loading')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const timerRef = useRef<number | null>(null)
  const runningRef = useRef(false)

  const recheck = useCallback(() => {
    if (runningRef.current) return
    runningRef.current = true

    checkHealth()
      .then((data) => {
        setHealth(data)
        setState('connected')
      })
      .catch(() => {
        setState('offline')
      })
      .finally(() => {
        runningRef.current = false
      })
  }, [])

  useEffect(() => {
    recheck()
    timerRef.current = window.setInterval(recheck, intervalMs)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [recheck, intervalMs])

  return { state, health, recheck }
}
