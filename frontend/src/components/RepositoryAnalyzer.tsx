import { useState, type FormEvent } from 'react'
import Container from './Container'
import { ArrowRightIcon, GitHubIcon } from './icons'
import { ingestRepository } from '../services/repositories'
import type { IngestResponse } from '../types/repositories'

const PLACEHOLDER_URL = 'https://github.com/owner/repository'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function RepositoryAnalyzer() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<IngestResponse | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = url.trim()
    if (!target) return

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const data = await ingestRepository(target)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository')
      setStatus('error')
    }
  }

  function handleInputChange(value: string) {
    setUrl(value)
    setStatus('idle')
    setError('')
    setResult(null)
  }

  const isLoading = status === 'loading'

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
                onChange={(event) => handleInputChange(event.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary repository-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing…' : 'Analyze Repository'}
              {!isLoading && <ArrowRightIcon size={16} />}
            </button>

            {status === 'loading' && (
              <p className="repository-note" role="status">
                Fetching repository files from GitHub…
              </p>
            )}

            {status === 'error' && (
              <p className="repository-error" role="alert">
                {error}
              </p>
            )}

            {status === 'success' && result && (
              <div className="repository-result" role="status">
                <div className="repository-result-row">
                  <span className="repository-result-label">Repository</span>
                  <span className="repository-result-value">{result.repository}</span>
                </div>
                <div className="repository-result-row">
                  <span className="repository-result-label">Files processed</span>
                  <span className="repository-result-value">{result.files_processed}</span>
                </div>
                <div className="repository-result-row">
                  <span className="repository-result-label">Files skipped</span>
                  <span className="repository-result-value">{result.files_skipped}</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </Container>
    </section>
  )
}
