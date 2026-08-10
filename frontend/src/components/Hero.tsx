import { useRef, useEffect, useState, type FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from './Container'
import FadeContent from './bits/FadeContent'
import SplitText from './bits/SplitText'
import TextType from './bits/TextType'
import RotatingText from './bits/RotatingText'
import TrueFocus from './bits/TrueFocus'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import {
  ArrowRightIcon,
  ChevronRightIcon,
  FileIcon,
  GitHubIcon,
} from './icons'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  onAnalyzeRequest: (url: string) => void
}

const HERO_TITLE = 'Understand any codebase with sources.'

const VALUE_STEPS = [
  { label: 'Connect', description: 'Paste a public GitHub repo' },
  { label: 'Index', description: 'Files chunked and embedded' },
  { label: 'Search', description: 'Find code by intent' },
  { label: 'Ask', description: 'Answers cited to file + line' },
]

const MOCK_TREE = [
  { type: 'dir', name: 'src/' },
  { type: 'dir', name: ' services/' },
  { type: 'file', name: ' auth.py', active: true },
  { type: 'file', name: ' db.py' },
]

const MOCK_CODE = [
  { line: 12, text: 'def authenticate(request):', hit: true },
  { line: 13, text: '    token = get_token(request)' },
  { line: 14, text: '    return verify_token(token)' },
]

const MOCK_ASK_TEXT = [
  'How does authentication work?',
  'Where is the database schema?',
  'How is error handling handled?',
]

export default function Hero({ onAnalyzeRequest }: HeroProps) {
  const [url, setUrl] = useState('')
  const prefersReducedMotion = usePrefersReducedMotion()
  const mockParallaxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) return

    const el = mockParallaxRef.current

    if (!el) return

    const tween = gsap.to(el, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [prefersReducedMotion])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const target = url.trim()

    if (!target) return

    onAnalyzeRequest(target)
  }

  const title = prefersReducedMotion ? (
    <h1 className="hero-title">
      {HERO_TITLE}
    </h1>
  ) : (
    <FadeContent
      duration={500}
      delay={100}
      threshold={0}
      className="hero-title-wrap"
    >
      <h1 className="hero-title">
        <TrueFocus
          sentence="Understand any codebase with sources."
          separator=" "
          manualMode={false}
          blurAmount={5}
          borderColor="#00ff88"
          glowColor="rgba(0, 255, 136, 0.6)"
          animationDuration={0.5}
          pauseBetweenAnimations={1}
        />
      </h1>
    </FadeContent>
  )

  return (
    <section className="hero">
      <Container>
        <div className="hero-content">
          {title}

          <FadeContent
            duration={400}
            delay={280}
            threshold={0}
            className="hero-subtitle-wrap"
          >
            <p className="hero-subtitle">
              Connect a GitHub repository and turn it into searchable,
              queryable documentations. Answers grounded in your actual code
              not a summary of it.
            </p>
          </FadeContent>

          <form className="hero-form" onSubmit={handleSubmit}>
            <div className="hero-input-wrap">
              <GitHubIcon size={16} className="input-icon" />

              <input
                className="input has-icon"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="github.com/owner/repository"
                aria-label="GitHub repository URL"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!url.trim()}
            >
              Analyze
              <ArrowRightIcon size={15} />
            </button>
          </form>

          <div className="hero-hint">
            <span className="hero-hint-item">
              <GitHubIcon size={13} />
              Public repositories only
            </span>
          </div>

          <div className="hero-values">
            {VALUE_STEPS.map((step, index) => (
              <div className="hero-value" key={step.label}>
                <span className="hero-value-index" aria-hidden="true">
                  0{index + 1}
                </span>

                <span className="hero-value-label">
                  {step.label}
                </span>

                <span className="hero-value-desc">
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          <div
            className="hero-mock-parallax"
            ref={mockParallaxRef}
          >
            <div className="hero-mock" aria-hidden="true">
              <div className="mock-bar">
                <span className="mock-title">
                  workspace
                </span>

                <TextType
                  as="span"
                  className="mock-status"
                  text="indexed"
                  showCursor={false}
                  loop={false}
                  initialDelay={700}
                  typingSpeed={70}
                />
              </div>

              <div className="mock-body">
                <div className="mock-pane mock-tree">
                  <span className="mock-pane-label">
                    Files
                  </span>

                  {MOCK_TREE.map((row) => (
                    <div
                      className={`mock-tree-row${
                        row.type === 'dir' ? ' is-dir' : ''
                      }${
                        'active' in row && row.active
                          ? ' is-active'
                          : ''
                      }`}
                      key={row.name}
                    >
                      {row.type === 'dir' ? (
                        <ChevronRightIcon size={13} />
                      ) : (
                        <FileIcon size={13} />
                      )}

                      {row.name}
                    </div>
                  ))}
                </div>

                <div className="mock-pane mock-code">
                  <span className="mock-pane-label">
                    src/services/auth.py
                  </span>

                  {MOCK_CODE.map((row) => (
                    <div
                      className={`mock-code-line${
                        row.hit ? ' is-hit' : ''
                      }`}
                      key={row.line}
                    >
                      <span className="mock-ln">
                        {row.line}
                      </span>

                      <span>{row.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mock-pane mock-ask">
                  <span className="mock-pane-label">
                    Ask DevDocs
                  </span>

                  <RotatingText
                    texts={MOCK_ASK_TEXT}
                    mainClassName="mock-ask-box"
                    splitBy="words"
                    staggerDuration={0.02}
                    rotationInterval={4200}
                    transition={{
                      type: 'spring',
                      damping: 28,
                      stiffness: 320,
                    }}
                  />

                  <div className="mock-answer">
                    Auth is verified in{' '}
                    <strong>
                      src/services/auth.py
                    </strong>{' '}
                    — <code>authenticate()</code> extracts
                    the token and calls{' '}
                    <code>verify_token()</code>.
                  </div>

                  <div className="mock-source">
                    <FileIcon size={13} />
                    src/services/auth.py · :12–58
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}