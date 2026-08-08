import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import type { BackendState } from '../hooks/useHealth'
import type { HealthResponse } from '../types/health'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
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
  const [activeId, setActiveId] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_EDGE_PX)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => link.href.replace('#', ''))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const indicator = indicatorRef.current
    const list = listRef.current
    if (!indicator || !list) return

    const positionIndicator = () => {
      const activeLink = activeId ? linkRefs.current.get(activeId) : null
      if (!activeLink) {
        const vars = { autoAlpha: 0 }
        if (prefersReducedMotion) gsap.set(indicator, vars)
        else gsap.to(indicator, { ...vars, duration: 0.25, ease: 'power2.out' })
        return
      }
      const listRect = list.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const vars = {
        left: linkRect.left - listRect.left,
        width: linkRect.width,
        autoAlpha: 1,
      }
      if (prefersReducedMotion) gsap.set(indicator, vars)
      else gsap.to(indicator, { ...vars, duration: 0.4, ease: 'power3.out' })
    }

    positionIndicator()
    window.addEventListener('resize', positionIndicator)
    return () => window.removeEventListener('resize', positionIndicator)
  }, [activeId, prefersReducedMotion])

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

          <ul ref={listRef} className={`navbar-links${open ? ' is-open' : ''}`}>
            <span
              ref={indicatorRef}
              className="navbar-link-indicator"
              aria-hidden="true"
            />
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('#', '')
              return (
                <li key={link.href}>
                  <a
                    ref={(node) => {
                      if (node) linkRefs.current.set(id, node)
                      else linkRefs.current.delete(id)
                    }}
                    className={`navbar-link${activeId === id ? ' is-active' : ''}`}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
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
