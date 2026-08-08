import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  spotlightColor?: string
  style?: CSSProperties
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(76, 142, 255, 0.1)',
  style,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`)
  }

  const customStyle = {
    '--spotlight-color': spotlightColor,
    ...style,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
      style={customStyle}
    >
      <span className="spotlight-card-glow" aria-hidden="true" />
      {children}
    </div>
  )
}
