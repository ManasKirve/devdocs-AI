import Container from './Container'
import Logo from './Logo'
import { GitHubIcon } from './icons'

const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Repositories', href: '#repository' },
  { label: 'AI Assistant', href: '#ai' },
  { label: 'Stack', href: '#technologies' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-inner">
          <div className="footer-brand">
            <Logo />
            <p className="footer-description">
              AI-powered developer documentation and codebase intelligence platform.
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
            className="btn btn-ghost btn-sm footer-github"
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DevDocs AI. Built for developers.</p>
        </div>
      </Container>
    </footer>
  )
}
