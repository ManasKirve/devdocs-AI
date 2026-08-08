import { useEffect, useState } from 'react'
import { checkHealth } from '../services/health'

type BackendState = 'loading' | 'connected' | 'offline'

const LABELS: Record<Exclude<BackendState, 'loading'>, string> = {
  connected: 'Backend Connected',
  offline: 'Backend Offline',
}

export default function BackendStatus() {
  const [state, setState] = useState<BackendState>('loading')

  useEffect(() => {
    let cancelled = false

    checkHealth()
      .then(() => {
        if (!cancelled) setState('connected')
      })
      .catch(() => {
        if (!cancelled) setState('offline')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const label = state === 'loading' ? 'Checking backend' : LABELS[state]

  return (
    <span
      className={`backend-status backend-status-${state}`}
      role="status"
      aria-live="polite"
    >
      <span className="backend-status-dot" aria-hidden="true" />
      {label}
    </span>
  )
}
