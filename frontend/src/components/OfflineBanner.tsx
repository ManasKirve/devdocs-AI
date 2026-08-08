import { AlertIcon, RefreshIcon, XIcon } from './icons'

interface OfflineBannerProps {
  visible: boolean
  onDismiss: () => void
  onRetry: () => void
}

export default function OfflineBanner({ visible, onDismiss, onRetry }: OfflineBannerProps) {
  if (!visible) return null

  return (
    <div className="banner" role="alert" aria-live="polite">
      <AlertIcon size={15} className="banner-icon" />
      <span className="banner-message">
        Cannot reach the DevDocs AI backend. Repository analysis, search, and Q&amp;A are
        unavailable until the server is reachable.
      </span>
      <div className="banner-actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          <RefreshIcon size={13} />
          Retry
        </button>
        <button type="button" className="btn btn-text btn-sm" onClick={onDismiss} aria-label="Dismiss">
          <XIcon size={13} />
        </button>
      </div>
    </div>
  )
}
