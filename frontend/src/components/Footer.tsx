import BackendStatus from './BackendStatus'
import Container from './Container'
import Logo from './Logo'
import type { BackendState } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import { ArrowUpRightIcon } from './icons'

const PRODUCT_LINKS = [
  { label: 'Capabilities', href: '#features' },
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
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              DevDocs AI turns any GitHub repository into a searchable, queryable
              knowledge base — with answers grounded in your real code.
            </p>
          </div>

          <div className="footer-columns">
            <nav className="footer-col" aria-label="Product">
              <h3 className="footer-col-title">Product</h3>
              <ul className="footer-links">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.href}>
                    <a className="footer-link" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="footer-col" aria-label="Resources">
              <h3 className="footer-col-title">Resources</h3>
              <ul className="footer-links">
                <li>
                  <a className="footer-link" href="#how-it-works">
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link footer-link-external"
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                    <ArrowUpRightIcon size={13} />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DevDocs AI. Built for developers.</p>
          <BackendStatus compact state={backendState} health={health} />
        </div>
      </Container>
    </footer>
  )
}
