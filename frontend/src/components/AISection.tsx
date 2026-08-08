import Container from './Container'
import Logo from './Logo'
import { SparkIcon } from './icons'

const ANSWER = [
  'Requests pass through src/auth/middleware.ts, which validates the JWT sent in the Authorization header. On success, the payload is attached to the request context as req.user.',
  'Protected routes depend on require_auth from src/auth/dependencies.py. Refresh tokens are persisted in PostgreSQL via src/auth/token_store.py and rotated on every refresh.',
]

const SOURCES = [
  'src/auth/middleware.ts',
  'src/auth/dependencies.py',
  'src/auth/token_store.py',
]

export default function AISection() {
  return (
    <section className="section ai-section" id="ai">
      <Container>
        <div className="section-heading">
          <p className="eyebrow">AI assistant</p>
          <h2 className="section-title">Ask your codebase anything.</h2>
          <p className="section-subtitle">
            Natural-language answers grounded in your repository, with citations that point
            back to the source.
          </p>
        </div>

        <div className="chat-card">
          <div className="chat-question">
            <span className="chat-avatar chat-avatar-user" aria-hidden="true">
              you
            </span>
            <p className="chat-question-text">How does authentication work in this project?</p>
          </div>

          <div className="chat-answer">
            <div className="chat-answer-head">
              <SparkIcon size={15} />
              <Logo compact />
              <span className="chat-answer-label">DevDocs AI</span>
              <span className="chat-tag">Retrieved &middot; 3 sources</span>
            </div>
            <div className="chat-answer-body">
              {ANSWER.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="chat-files">
              {SOURCES.map((file) => (
                <span className="chat-file" key={file}>
                  {file}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
