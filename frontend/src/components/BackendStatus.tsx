import { useHealth, type BackendState } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'

interface BackendStatusProps {
  compact?: boolean
  state?: BackendState
  health?: HealthResponse | null
}

export default function BackendStatus({ compact = false, state, health }: BackendStatusProps) {
  const internal = state === undefined ? useHealth() : null
  const current: BackendState = state ?? internal?.state ?? 'loading'
  const currentHealth = health ?? internal?.health ?? null

  if (current === 'loading') {
    return (
      <span className="backend-status backend-status-loading" role="status" aria-live="polite">
        <span className="backend-status-dot" aria-hidden="true" />
        Checking API
      </span>
    )
  }

  if (current === 'offline') {
    return (
      <span className="backend-status backend-status-offline" role="status" aria-live="polite">
        <span className="backend-status-dot" aria-hidden="true" />
        API offline
      </span>
    )
  }

  return (
    <span className="backend-status backend-status-connected" role="status" aria-live="polite">
      <span className="backend-status-dot" aria-hidden="true" />
      {compact ? 'Connected' : currentHealth?.version ? `API · v${currentHealth.version}` : 'API connected'}
    </span>
  )
}
