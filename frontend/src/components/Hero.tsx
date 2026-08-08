import Container from './Container'
import { ArrowRightIcon } from './icons'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-background" aria-hidden="true" />
      <Container>
        <div className="hero-inner">
          <p className="hero-badge">
            <span className="hero-badge-dot" aria-hidden="true" />
            AI-powered codebase intelligence
          </p>
          <h1 className="hero-title">
            Understand Any Codebase <span className="hero-title-accent">With AI</span>
          </h1>
          <p className="hero-subtitle">
            DevDocs AI lets developers understand and interact with their codebase using AI.
            Connect a repository, get instant documentation, and ask questions about your code
            in plain language.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#repository">
              Connect Repository
              <ArrowRightIcon size={16} />
            </a>
            <a className="btn btn-ghost" href="#ai">
              Explore Documentation
            </a>
          </div>
          <dl className="hero-stats">
            <div className="hero-stat">
              <dt>Indexed</dt>
              <dd>Repo &rarr; knowledge</dd>
            </div>
            <div className="hero-stat">
              <dt>Answers</dt>
              <dd>Grounded in code</dd>
            </div>
            <div className="hero-stat">
              <dt>Docs</dt>
              <dd>Always up to date</dd>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  )
}
