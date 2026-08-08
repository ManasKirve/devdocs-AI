interface LogoProps {
  compact?: boolean
  className?: string
}

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <span className={`logo${className ? ` ${className}` : ''}`}>
      <span className="logo-mark" aria-hidden="true">
        &lt;/&gt;
      </span>
      {!compact && (
        <span className="logo-name">
          DevDocs <span className="logo-accent">AI</span>
        </span>
      )}
    </span>
  )
}
