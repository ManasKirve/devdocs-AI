import { useState, type FormEvent } from 'react'
import AnswerContent from './AnswerContent'
import Container from './Container'
import FadeContent from './bits/FadeContent'
import SpotlightCard from './bits/SpotlightCard'
import {
  AlertIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  FileIcon,
  LinkIcon,
  RefreshIcon,
} from './icons'
import { getFriendlyError } from '../services/http'
import { askRag } from '../services/rag'
import type { RAGResponse, RAGSource } from '../types/rag'
import { formatScore, gitHubSourceUrl, splitPath } from '../lib/format'

const SUGGESTIONS = [
  'How does authentication work in this codebase?',
  'Where is the database connection created?',
  'How is error handling defined?',
  'Explain the core data models',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

interface CodebaseQAProps {
  repository: string | null
}

function SourceRow({
  source,
  repository,
  index,
}: {
  source: RAGSource
  repository: string | null
  index: number
}) {
  const { directory, basename } = splitPath(source.file_path)

  return (
    <li className="source-row" id={`qa-source-${index + 1}`}>
      <span className="source-row-index" aria-hidden="true">
        {index + 1}
      </span>
      <span className="source-row-icon" aria-hidden="true">
        <FileIcon size={14} />
      </span>
      <div className="source-row-main">
        <span className="source-row-file" title={source.file_path}>
          {directory && <span className="source-row-dir">{directory}</span>}
          {basename}
        </span>
        <span className="source-row-meta">
          <span className="lang">{source.language || 'code'}</span>
          <span>
            :{source.start_line}–{source.end_line}
          </span>
          <span>Chunk {source.chunk_index}</span>
        </span>
      </div>
      <span className="source-row-score">{formatScore(source.score)}</span>
      <a
        className="source-row-link"
        href={gitHubSourceUrl(repository, source.file_path, source.start_line, source.end_line)}
        target="_blank"
        rel="noreferrer"
      >
        GitHub
        <ArrowUpRightIcon size={12} />
      </a>
    </li>
  )
}

export default function CodebaseQA({ repository }: CodebaseQAProps) {
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<RAGResponse | null>(null)

  const isLoading = status === 'loading'
  const canAsk = repository !== null && question.trim().length > 0 && !isLoading

  async function runQuestion(rawQuestion: string) {
    const target = rawQuestion.trim()
    if (!target || isLoading || repository === null) return

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const data = await askRag({
        query: target,
        repository: repository,
      })
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(getFriendlyError(err))
      setStatus('error')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void runQuestion(question)
  }

  return (
    <section className="section qa" id="qa">
      <Container>
        <FadeContent duration={600} threshold={0.1}>
          <div className="section-heading">
            <p className="eyebrow">Codebase Q&amp;A</p>
            <h2 className="section-title">Ask your codebase anything</h2>
            <p className="section-subtitle">
              Answers are generated from your indexed repository and cite the exact file and
              lines they come from.
            </p>
          </div>
        </FadeContent>

        <FadeContent duration={600} delay={120} threshold={0.1}>
          <div className="qa-panel">
          <div className="qa-toolbar" role="status">
            <span className={`qa-toolbar-dot${repository ? '' : ' idle'}`} aria-hidden="true" />
            {repository ? (
              <span className="qa-toolbar-repo" title={repository}>
                {repository}
              </span>
            ) : (
              <span className="qa-toolbar-text">No repository connected</span>
            )}
            {repository && (
              <span className="qa-badge">
                <span className="qa-badge-dot" aria-hidden="true" />
                Grounded
              </span>
            )}
            <span className="qa-toolbar-hint">
              {repository
                ? 'Answers cite the exact file and lines'
                : 'Analyze a repository to enable grounded Q&A'}
            </span>
          </div>

          {repository === null ? (
            <div className="state qa-empty">
              <div className="state-icon" aria-hidden="true">
                <LinkIcon size={20} />
              </div>
              <p className="state-title">No repository connected</p>
              <p className="state-text">
                Connect a GitHub repository to ask questions that are answered from its
                source code.
              </p>
              <div className="state-actions">
                <a className="btn btn-primary" href="#analyze">
                  Connect a repository
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="qa-suggest" aria-label="Suggested questions">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    type="button"
                    className="qa-suggest-chip"
                    key={suggestion}
                    onClick={() => {
                      setQuestion(suggestion)
                      void runQuestion(suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form className="qa-form" onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="qa-question">
                  Question
                </label>
                <textarea
                  id="qa-question"
                  className="qa-input"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="e.g. how is auth handled in this repo?"
                  rows={3}
                  disabled={isLoading}
                />

                <div className="qa-actions">
                  <span className="qa-meta">
                    Grounded in <span className="mono">{repository}</span>
                  </span>
                  <button type="submit" className="btn btn-primary" disabled={!canAsk}>
                    {isLoading ? (
                      <span className="spinner" aria-hidden="true" />
                    ) : (
                      <ArrowRightIcon size={15} />
                    )}
                    Ask
                  </button>
                </div>
              </form>

              {isLoading && (
                <FadeContent duration={240} threshold={0}>
                  <div className="thinking" role="status" aria-live="polite">
                    <span className="thinking-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="thinking-text">
                      Retrieving context from <span className="mono">{repository}</span>…
                    </span>
                  </div>
                </FadeContent>
              )}

              {status === 'error' && (
                <div className="qa-error" role="alert">
                  <AlertIcon size={16} />
                  <span>{error}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="qa-error-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => void runQuestion(question)}
                  >
                    <RefreshIcon size={13} />
                    Retry
                  </button>
                </div>
              )}

              {status === 'success' && result && (
                <SpotlightCard className="answer">
                  <div className="answer-head">
                    <span className="answer-status-dot" aria-hidden="true" />
                    <span className="answer-name">DevDocs</span>
                    <span className="answer-format">{result.format || 'markdown'}</span>
                    <span className="answer-count">
                      {result.sources.length}{' '}
                      {result.sources.length === 1 ? 'source' : 'sources'}
                    </span>
                  </div>

                  <AnswerContent
                    content={result.answer}
                    format={result.format}
                    sourceCount={result.sources.length}
                  />

                  <div className="sources">
                    <h3 className="sources-title">
                      Sources · {result.sources.length}
                    </h3>
                    {result.sources.length > 0 ? (
                      <ul className="sources-list">
                        {result.sources.map((source, index) => (
                          <SourceRow
                            key={`${source.file_path}-${source.start_line}-${source.end_line}-${index}`}
                            source={source}
                            repository={repository}
                            index={index}
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="sources-empty">
                        No matching sources were found in <span className="mono">{repository}</span>.
                      </p>
                    )}
                  </div>
                </SpotlightCard>
              )}
            </>
          )}
        </div>
        </FadeContent>
      </Container>
    </section>
  )
}
