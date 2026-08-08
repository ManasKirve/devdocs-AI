import BackendStatus from './BackendStatus'
import Container from './Container'
import Logo from './Logo'
import { GitHubIcon } from './icons'

const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Analyze', href: '#analyze' },
  { label: 'Search', href: '#search' },
  { label: 'Q&A', href: '#qa' },
]

export default function Footer() {
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
          <BackendStatus compact />
        </div>
      </Container>
    </footer>
  )
}
