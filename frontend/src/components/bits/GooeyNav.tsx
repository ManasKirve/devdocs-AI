import { useEffect, useRef, useState } from 'react'
import { registerBits } from '../../debug/registry'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface GooeyNavItem {
  label: string
  href: string
}

interface GooeyNavProps {
  items: GooeyNavItem[]
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  className?: string
  particleCount?: number
  animationTime?: number
  particleR?: number
  particleDistances?: [number, number]
  particleSpread?: number
  particles?: boolean
}

export default function GooeyNav({
  items,
  activeIndex: activeIndexProp,
  onActiveIndexChange = () => {},
  className = '',
  particleCount = 6,
  animationTime = 420,
  particleR = 3,
  particleDistances = [56, 4],
  particleSpread = 1,
  particles = true,
}: GooeyNavProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef<number>(0)
  const firstPlaceRef = useRef(true)
  const userChangedRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    registerBits('GooeyNav')
  }, [])

  const isControlled = activeIndexProp !== undefined
  const currentIndex = isControlled ? activeIndexProp : activeIndex

  useEffect(() => {
    activeIndexRef.current = currentIndex
  }, [currentIndex])

  function placePill(link: HTMLAnchorElement | null, animate: boolean) {
    const container = containerRef.current
    if (!link || !container) return
    const containerRect = container.getBoundingClientRect()
    const rect = link.getBoundingClientRect()
    const effect = container.querySelector<HTMLElement>('.gooey-nav-effect')
    if (!effect) return
    effect.style.left = `${rect.left - containerRect.left}px`
    effect.style.top = `${rect.top - containerRect.top}px`
    effect.style.width = `${rect.width}px`
    effect.style.height = `${rect.height}px`
    if (animate) {
      effect.classList.remove('is-active')
      void effect.offsetWidth
      effect.classList.add('is-active')
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const link = container.querySelector<HTMLAnchorElement>(
      `li[data-index="${currentIndex}"] a`,
    )
    if (firstPlaceRef.current) {
      placePill(link, false)
      firstPlaceRef.current = false
    } else {
      const shouldPop = userChangedRef.current
      placePill(link, shouldPop)
      userChangedRef.current = false
    }
    setIsReady(true)
  }, [currentIndex])

  useEffect(() => {
    function reposition() {
      const container = containerRef.current
      const link = container?.querySelector<HTMLAnchorElement>(
        `li[data-index="${activeIndexRef.current}"] a`,
      )
      placePill(link ?? null, false)
    }
    window.addEventListener('resize', reposition)
    document.fonts?.addEventListener?.('loadingdone', reposition)
    return () => {
      window.removeEventListener('resize', reposition)
      document.fonts?.removeEventListener?.('loadingdone', reposition)
    }
  }, [])

  function makeParticles(trigger: HTMLElement) {
    if (!particles || reducedMotion || particleCount <= 0) return
    const container = containerRef.current
    if (!container) return
    const rect = trigger.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerX = rect.left - containerRect.left + rect.width / 2
    const centerY = rect.top - containerRect.top + rect.height / 2

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span')
      particle.className = 'gooey-particle'
      const size = Math.random() * particleR + particleR
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.background = i % 3 === 0 ? 'var(--color-2)' : 'var(--color-1)'
      const angle = Math.random() * Math.PI * 2
      const distance = (Math.random() * particleDistances[0] + particleDistances[1]) * particleSpread
      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`)
      particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`)
      particle.style.animation = `gooey-fly ${Math.round(animationTime / 3)}ms ${Math.round(
        animationTime / 10,
      )}ms var(--linear-ease) forwards`
      container.appendChild(particle)
      window.setTimeout(() => particle.remove(), animationTime)
    }
  }

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string, linkIndex: number) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    userChangedRef.current = true
    setActiveIndex(linkIndex)
    onActiveIndexChange(linkIndex)
    makeParticles(event.currentTarget)
    if (href) window.location.hash = href
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLAnchorElement>, href: string, linkIndex: number) {
    if (event.key !== ' ') return
    event.preventDefault()
    handleClick(event as unknown as React.MouseEvent<HTMLAnchorElement>, href, linkIndex)
  }

  return (
    <>
      <style>{`
        .gooey-nav {
          --linear-ease: cubic-bezier(0.22, 1, 0.36, 1);
          --color-1: var(--accent);
          --color-2: var(--accent-hover);
          --gooey-blur: 8px;
          --gooey-contrast: 2.4;
          position: relative;
          display: inline-flex;
        }

        .gooey-nav ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          position: relative;
          z-index: 3;
        }

        .gooey-nav li {
          position: relative;
          flex-shrink: 0;
        }

        .gooey-nav li.is-active a {
          color: var(--text-on-accent);
          font-weight: 600;
        }

        .gooey-nav a {
          display: inline-block;
          padding: 7px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-secondary);
          outline: none;
          transition: color var(--duration-fast) var(--ease-default);
        }

        .gooey-nav a:hover {
          color: var(--text-primary);
        }

        .gooey-nav a:focus-visible {
          box-shadow: var(--focus-ring);
        }

        .gooey-nav-effect {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          filter: blur(var(--gooey-blur)) contrast(var(--gooey-contrast));
          mix-blend-mode: lighten;
          transition: opacity var(--duration-base) var(--ease-default);
        }

        .gooey-nav.is-ready .gooey-nav-effect {
          opacity: 1;
          transition:
            left 320ms var(--linear-ease),
            top 320ms var(--linear-ease),
            width 320ms var(--linear-ease),
            height 320ms var(--linear-ease),
            opacity var(--duration-base) var(--ease-default);
        }

        .gooey-nav-effect::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #000;
        }

        .gooey-nav-effect::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          border-radius: var(--radius-full);
          background: var(--accent);
        }

        .gooey-nav-effect.is-active::after {
          animation: gooey-pill 380ms var(--linear-ease) forwards;
        }

        @keyframes gooey-pill {
          0% {
            transform: scale(0.2);
            opacity: 0.5;
          }
          55% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .gooey-particle {
          position: absolute;
          z-index: 4;
          pointer-events: none;
          border-radius: 50%;
          background: var(--color-1);
          opacity: 0;
        }

        @keyframes gooey-fly {
          from {
            opacity: 0.85;
          }
          to {
            transform: translate(var(--x), var(--y));
            opacity: 0;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`gooey-nav${isReady ? ' is-ready' : ''}${className ? ` ${className}` : ''}`}
      >
        <ul data-gooey="true" aria-label="Primary">
          {items.map((item, index) => {
            const isActive = index === currentIndex
            return (
              <li key={item.href} data-index={index} className={isActive ? 'is-active' : ''}>
                <a
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(event) => handleClick(event, item.href, index)}
                  onKeyDown={(event) => handleKeyDown(event, item.href, index)}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
        <span className="gooey-nav-effect" aria-hidden="true" />
      </div>
    </>
  )
}
