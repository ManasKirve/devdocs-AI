import { useEffect, useState } from 'react'
import type { BackendState } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import BackendStatus from './BackendStatus'
import Container from './Container'
import Logo from './Logo'
import { GitHubIcon } from './icons'

const NAV_LINKS = [
  { label: 'Capabilities', href: '#features' },
  { label: 'Analyze', href: '#analyze' },
  { label: 'Search', href: '#search' },
  { label: 'Q&A', href: '#qa' },
]

const SCROLL_EDGE_PX = 8

interface NavbarProps {
  repository?: string | null
  backendState?: BackendState
  health?: HealthResponse | null
}

export default function Navbar({ repository = null, backendState, health }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_EDGE_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMenu() {
    setOpen(false)
  }

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <Container>
        <nav className="navbar-inner" aria-label="Main navigation">
          <a className="navbar-brand" href="#top" aria-label="DevDocs AI home">
            <Logo />
          </a>

          <ul className={`navbar-links${open ? ' is-open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className="navbar-link" href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="navbar-links-github">
              <a
                className="btn btn-ghost btn-sm btn-block"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon size={15} />
                GitHub
              </a>
            </li>
            <li className="navbar-links-cta">
              <a className="btn btn-primary btn-sm btn-block" href="#analyze" onClick={closeMenu}>
                Analyze repository
              </a>
            </li>
          </ul>

          <div className="navbar-spacer" />

          <div className="navbar-actions">
            {repository && (
              <span className="navbar-repo" title={`Indexed: ${repository}`}>
                <span className="navbar-repo-dot" aria-hidden="true" />
                <span className="navbar-repo-name">{repository}</span>
              </span>
            )}
            <BackendStatus state={backendState} health={health} />
            <a
              className="btn btn-ghost btn-sm navbar-github-desktop"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon size={15} />
              GitHub
            </a>
            <a className="btn btn-primary btn-sm navbar-cta-desktop" href="#analyze">
              Analyze
            </a>
            <button
              type="button"
              className={`navbar-toggle${open ? ' is-open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="navbar-toggle-bar" />
              <span className="navbar-toggle-bar" />
              <span className="navbar-toggle-bar" />
            </button>
          </div>
        </nav>
      </Container>
    </header>
  )
}
