import { useState } from 'react'
import BackendStatus from './BackendStatus'
import Container from './Container'
import Logo from './Logo'
import { GitHubIcon } from './icons'

const NAV_LINKS = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Repositories', href: '#repository' },
  { label: 'Documentation', href: '#ai' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <Container>
        <nav className="navbar-inner" aria-label="Main navigation">
          <a className="navbar-brand" href="#">
            <Logo />
          </a>

          <ul className={`navbar-links${open ? ' is-open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a className="navbar-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
            <li className="navbar-links-github">
              <a
                className="btn btn-ghost btn-sm navbar-github"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon size={16} />
                GitHub
              </a>
            </li>
          </ul>

          <BackendStatus />

          <a
            className="btn btn-ghost btn-sm navbar-github navbar-github-desktop"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon size={16} />
            GitHub
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
        </nav>
      </Container>
    </header>
  )
}
