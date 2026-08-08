import { useState, type FormEvent } from 'react'
import Container from './Container'
import { ArrowRightIcon, GitHubIcon } from './icons'

const PLACEHOLDER_URL = 'https://github.com/owner/repository'

export default function RepositoryAnalyzer() {
  const [url, setUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!url.trim()) return
    setSubmitted(true)
  }

  return (
    <section className="section repository" id="repository">
      <Container>
        <div className="repository-panel">
          <div className="repository-copy">
            <p className="eyebrow">Get started</p>
            <h2 className="section-title">Analyze a repository</h2>
            <p className="repository-text">
              Paste a public GitHub repository URL and DevDocs AI will index it — building
              documentation, search, and answers from your actual code.
            </p>
          </div>

          <form className="repository-form" onSubmit={handleSubmit}>
            <div className="repository-input-group">
              <GitHubIcon size={16} className="repository-input-icon" />
              <input
                type="url"
                className="repository-input"
                placeholder={PLACEHOLDER_URL}
                aria-label="GitHub repository URL"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value)
                  setSubmitted(false)
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary repository-submit">
              Analyze Repository
              <ArrowRightIcon size={16} />
            </button>
          </form>

          {submitted && (
            <p className="repository-note" role="status">
              Repository analysis is UI-only for now — API integration ships in an upcoming
              milestone.
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}
