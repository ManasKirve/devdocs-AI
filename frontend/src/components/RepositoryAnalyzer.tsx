import { useEffect, useRef, useState, type FormEvent } from 'react'
import Container from './Container'
import FadeContent from './bits/FadeContent'
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  GitHubIcon,
  MessagesIcon,
  RefreshIcon,
} from './icons'
import { getFriendlyError } from '../services/http'
import { ingestRepository } from '../services/repositories'
import type { IngestResponse } from '../types/repositories'
import { formatCount } from '../lib/format'

const PLACEHOLDER_URL = 'github.com/owner/repository'
const STEP_INTERVAL_MS = 850

const EXAMPLE_REPOS = ['fastapi/fastapi', 'pallets/flask', 'golang/go']

const STEPS = [
  { label: 'Fetching repository', detail: 'cloning github.com/owner/repository' },
  { label: 'Analyzing source', detail: 'mapping files and languages' },
  { label: 'Chunking files', detail: 'splitting code into indexed units' },
  { label: 'Embedding chunks', detail: 'vectorizing code semantics' },
  { label: 'Building the index', detail: 'preparing search and retrieval' },
]

type Status = 'idle' | 'analyzing' | 'completed' | 'error'

interface RepositoryAnalyzerProps {
  onRepositoryChange?: (repository: string | null) => void
  initialUrl?: string
}

function normalizeRepositoryUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/^github\.com\//i, '')
    .replace(/\/$/, '')
}

function isValidRepositoryUrl(value: string): boolean {
  const cleaned = normalizeRepositoryUrl(value)
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(cleaned)
}

export default function RepositoryAnalyzer({
  onRepositoryChange,
  initialUrl = '',
}: RepositoryAnalyzerProps) {
  const [url, setUrl] = useState(initialUrl)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<IngestResponse | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [submittedUrl, setSubmittedUrl] = useState('')
  const startedAtRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl)
  }, [initialUrl])

  useEffect(() => {
    if (status !== 'analyzing') return
    startedAtRef.current = Date.now()
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current
      setActiveStep(
        Math.min(Math.floor(elapsed / STEP_INTERVAL_MS), STEPS.length - 1),
      )
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [status])

  const isAnalyzing = status === 'analyzing'
  const dirty = url.trim().length > 0
  const valid = dirty && isValidRepositoryUrl(url)
  const showValidation = dirty && !valid

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = url.trim()
    if (!target || !valid || isAnalyzing) return
    void handleAnalyze(target)
  }

  async function handleAnalyze(target: string) {
    setStatus('analyzing')
    setError('')
    setResult(null)
    setSubmittedUrl(target)
    setActiveStep(0)
    onRepositoryChange?.(null)

    try {
      const data = await ingestRepository(target)
      setResult(data)
      setActiveStep(STEPS.length - 1)
      setStatus('completed')
      onRepositoryChange?.(data.repository)
    } catch (err) {
      setError(getFriendlyError(err))
      setStatus('error')
    }
  }

  function handleInputChange(value: string) {
    setUrl(value)
    if (status === 'analyzing' || status === 'completed' || status === 'error') {
      setStatus('idle')
      setError('')
      setResult(null)
      onRepositoryChange?.(null)
    }
  }

  function handleReset() {
    setUrl('')
    setStatus('idle')
    setError('')
    setResult(null)
    setSubmittedUrl('')
    onRepositoryChange?.(null)
    inputRef.current?.focus()
  }

  function handleExampleClick(repository: string) {
    setUrl(repository)
    inputRef.current?.blur()
    void handleAnalyze(repository)
  }

  function topLanguages(result: IngestResponse): string[] {
    const counts = new Map<string, number>()
    for (const doc of result.documents) {
      const lang = doc.language || 'Other'
      counts.set(lang, (counts.get(lang) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang, count]) => `${lang} ${count}`)
  }

  return (
    <section className="section analyzer" id="analyze">
      <Container>
        <div className="analyzer-grid">
          <FadeContent duration={700} threshold={0.15}>
            <div className="analyzer-copy">
              <p className="eyebrow">Get started</p>
              <h2 className="section-title">Analyze a repository</h2>
              <p className="section-subtitle">
                Paste a public GitHub repository URL. DevDocs AI fetches, chunks, and
                embeds your code, then exposes it to semantic search and grounded Q&amp;A.
              </p>
              <div className="analyzer-actions">
                <a className="btn btn-ghost" href="#search">
                  <ArrowRightIcon size={14} />
                  Try code search
                </a>
                <a className="btn btn-ghost" href="#qa">
                  <MessagesIcon size={14} />
                  Ask a question
                </a>
              </div>
            </div>
          </FadeContent>

          <FadeContent duration={700} delay={120} threshold={0.15}>
            <form className="analyzer-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="repository-url">
              GitHub repository URL
            </label>
            <div className="analyzer-input-wrap">
              <GitHubIcon size={16} className="analyzer-input-icon" />
              <input
                ref={inputRef}
                id="repository-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={`analyzer-input${showValidation ? ' is-invalid' : ''}`}
                placeholder={PLACEHOLDER_URL}
                aria-label="GitHub repository URL"
                aria-invalid={showValidation}
                value={url}
                disabled={isAnalyzing}
                onChange={(event) => handleInputChange(event.target.value)}
              />
            </div>

            {showValidation && (
              <p className="input-hint is-error" role="alert">
                <AlertIcon size={13} />
                <code className="input-hint-code">github.com/owner/repository</code>
              </p>
            )}

            <div className="analyzer-chips" aria-label="Example repositories">
              <span className="analyzer-chips-label">Try</span>
              {EXAMPLE_REPOS.map((repository) => (
                <button
                  type="button"
                  className="analyzer-chip"
                  key={repository}
                  disabled={isAnalyzing}
                  onClick={() => handleExampleClick(repository)}
                >
                  {repository}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={!valid || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze repository
                  <ArrowRightIcon size={15} />
                </>
              )}
            </button>
            <p className="analyzer-hint">
              Public repositories only. Analysis runs on the DevDocs AI backend.
            </p>

            {isAnalyzing && (
              <div className="progress" role="status" aria-live="polite">
                {STEPS.map((step, index) => {
                  const stepState =
                    index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending'
                  const detail =
                    index === 0 && submittedUrl
                      ? `cloning ${submittedUrl}`
                      : step.detail
                  return (
                    <div className={`progress-step is-${stepState}`} key={step.label}>
                      <span className="progress-step-icon" aria-hidden="true">
                        {stepState === 'done' ? (
                          <CheckIcon size={12} />
                        ) : stepState === 'active' ? (
                          <span className="progress-step-ring" />
                        ) : (
                          <span className="progress-step-dot" />
                        )}
                      </span>
                      <span className="progress-step-main">
                        <span className="progress-step-label">{step.label}</span>
                        <span className="progress-step-detail">{detail}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {status === 'error' && (
              <div className="analyzer-error" role="alert">
                <AlertIcon size={16} />
                <div className="analyzer-error-main">
                  <span className="analyzer-error-title">Analysis failed</span>
                  <span>{error}</span>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="analyzer-error-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void handleAnalyze(submittedUrl || url)}
                >
                  <RefreshIcon size={13} />
                  Retry
                </button>
              </div>
            )}

            {status === 'completed' && result && (
              <div className="result-card" role="status">
                <div className="result-identity">
                  <span className="result-status-dot" aria-hidden="true" />
                  <span className="result-status-label">Indexed</span>
                  <code className="result-repo">{result.repository}</code>
                </div>
                <dl className="result-table">
                  <div className="result-row">
                    <dt>Files processed</dt>
                    <dd>{formatCount(result.files_processed)}</dd>
                  </div>
                  <div className="result-row">
                    <dt>Chunks created</dt>
                    <dd>{formatCount(result.chunks_created)}</dd>
                  </div>
                  <div className="result-row">
                    <dt>Embeddings</dt>
                    <dd>{formatCount(result.embeddings_created)}</dd>
                  </div>
                  <div className="result-row">
                    <dt>Files skipped</dt>
                    <dd>{formatCount(result.files_skipped)}</dd>
                  </div>
                  {result.documents.length > 0 && (
                    <div className="result-row">
                      <dt>Languages</dt>
                      <dd>{topLanguages(result).join(' · ')}</dd>
                    </div>
                  )}
                </dl>
                <div className="analyzer-actions">
                  <a className="btn btn-primary btn-sm" href="#search">
                    <ArrowRightIcon size={13} />
                    Start exploring
                  </a>
                  <a className="btn btn-ghost btn-sm" href="#qa">
                    <MessagesIcon size={13} />
                    Ask a question
                  </a>
                  <button
                    type="button"
                    className="btn btn-text btn-sm"
                    onClick={handleReset}
                  >
                    <RefreshIcon size={13} />
                    Analyze another
                  </button>
                </div>
              </div>
            )}
          </form>
          </FadeContent>
        </div>
      </Container>
    </section>
  )
}
