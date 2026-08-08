import BackendStatus from './BackendStatus'
import Container from './Container'
import Logo from './Logo'
import type { BackendState } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import { GitHubIcon } from './icons'

const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Analyze', href: '#analyze' },
  { label: 'Search', href: '#search' },
  { label: 'Q&A', href: '#qa' },
]

interface FooterProps {
  backendState?: BackendState
  health?: HealthResponse | null
}

export default function Footer({ backendState, health }: FooterProps) {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              DevDocs AI turns any GitHub repository into a searchable, queryable
              knowledge base — with answers grounded in your real code.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            {FOOTER_LINKS.map((link) => (
              <a className="footer-link" key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <a
            className="btn btn-ghost btn-sm"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon size={15} />
            GitHub
          </a>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DevDocs AI. Built for developers.</p>
          <BackendStatus compact state={backendState} health={health} />
        </div>
      </Container>
    </footer>
  )
}
