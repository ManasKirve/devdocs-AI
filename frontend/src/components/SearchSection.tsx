import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import CodeBlock from './CodeBlock'
import Container from './Container'
import FadeContent from './bits/FadeContent'
import { AlertIcon, ArrowRightIcon, FileIcon, RefreshIcon, SearchIcon } from './icons'
import { getFriendlyError } from '../services/http'
import { searchCodebase } from '../services/search'
import type { SearchResponse, SearchResultItem } from '../types/search'
import { formatScore, splitPath } from '../lib/format'

const SUGGESTIONS = [
  'how is authentication handled',
  'database schema and models',
  'error handling patterns',
  'where are API routes defined',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

interface SearchSectionProps {
  repository: string | null
}

function ResultRow({ item, terms }: { item: SearchResultItem; terms: string[] }) {
  const { directory, basename } = splitPath(item.file_path)

  return (
    <article className="search-result">
      <div className="search-result-head">
        <span className="search-result-file">
          <FileIcon size={14} />
          {directory && <span className="search-result-path-dir">{directory}</span>}
          {basename}
        </span>
        <span className="search-result-meta">
          <span className="lang">{item.language || 'code'}</span>
          <span>
            :{item.start_line}–{item.end_line}
          </span>
        </span>
        <span className="search-result-score">{formatScore(item.score)}</span>
      </div>
      <CodeBlock
        code={item.content}
        language={item.language}
        startLine={item.start_line}
        highlightTerms={terms}
        showHeader={false}
        compact
      />
    </article>
  )
}

export default function SearchSection({ repository }: SearchSectionProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<SearchResponse | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (document.activeElement !== inputRef.current) return
      setQuery('')
      setError('')
      setResult(null)
      setStatus('idle')
      inputRef.current?.blur()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const terms = useMemo(
    () =>
      query
        .trim()
        .split(/\s+/)
        .filter((term) => term.length > 1),
    [query],
  )

  const isLoading = status === 'loading'
  const canSearch = query.trim().length > 0 && !isLoading

  async function runSearch(rawQuery: string) {
    const target = rawQuery.trim()
    if (!target || isLoading) return

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const data = await searchCodebase({
        query: target,
        repository: repository ?? undefined,
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
    void runSearch(query)
  }

  return (
    <section className="section search" id="search">
      <Container>
        <FadeContent duration={700} threshold={0.1}>
          <div className="section-heading">
            <p className="eyebrow">Code search</p>
            <h2 className="section-title">Find code by intent</h2>
            <p className="section-subtitle">
              Describe what you are looking for. DevDocs AI matches semantically across
              your indexed repository and points you at the exact files and lines.
            </p>
          </div>
        </FadeContent>

        <FadeContent duration={800} delay={100} threshold={0.1}>
          <div className="search-panel">
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-input-wrap">
              <SearchIcon size={17} className="search-input-icon" />
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder="Try: how is authentication handled?"
                aria-label="Search your codebase"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="search-input-kbd">
                <span className="kbd">/</span>
              </span>
            </div>
            {repository && (
              <span className="search-repo-chip" title={repository}>
                <span className="search-repo-chip-dot" aria-hidden="true" />
                {repository}
              </span>
            )}
            <button type="submit" className="btn btn-primary" disabled={!canSearch}>
              {isLoading ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <ArrowRightIcon size={15} />
              )}
              Search
            </button>
          </form>

          {status === 'idle' && (
            <div className="state">
              <div className="state-icon" aria-hidden="true">
                <SearchIcon size={20} />
              </div>
              <p className="state-title">Search across your codebase</p>
              <p className="state-text">
                Start typing above, or pick one of these to get going.
              </p>
              <div className="qa-suggest">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    type="button"
                    className="qa-suggest-chip"
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion)
                      void runSearch(suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="skeleton-search" role="status" aria-live="polite">
              {[0, 1, 2].map((item) => (
                <div className="skeleton-search-row" key={item}>
                  <div className="skeleton-search-head">
                    <div className="skeleton skeleton-line-md" />
                    <div className="skeleton skeleton-line-xs" />
                    <div className="skeleton skeleton-line-xs skeleton-pull-right" />
                  </div>
                  <div className="skeleton skeleton-code" />
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="state state-error" role="alert">
              <div className="state-icon" aria-hidden="true">
                <AlertIcon size={20} />
              </div>
              <p className="state-title">Search failed</p>
              <p className="state-text">{error}</p>
              <div className="state-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => void runSearch(query)}
                >
                  <RefreshIcon size={14} />
                  Try again
                </button>
              </div>
            </div>
          )}

          {status === 'success' && result && (
            <div className="search-results">
              {result.results.length === 0 ? (
                <div className="state" role="status">
                  <div className="state-icon" aria-hidden="true">
                    <SearchIcon size={20} />
                  </div>
                  <p className="state-title">No results for &ldquo;{result.query}&rdquo;</p>
                  <p className="state-text">
                    Nothing matched in {repository ?? 'the index'}. Try a different term,
                    a symbol name, or a broader phrase.
                  </p>
                  <div className="state-actions">
                    <button
                      type="button"
                      className="btn btn-text btn-sm"
                      onClick={() => {
                        setQuery('')
                        setError('')
                        setResult(null)
                        setStatus('idle')
                      }}
                    >
                      <RefreshIcon size={13} />
                      Clear search
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="search-summary">
                    <strong>{result.results.length}</strong>
                    {result.results.length === 1 ? 'result' : 'results'} for{' '}
                    <code>&ldquo;{result.query}&rdquo;</code>
                  </div>
                  {result.results.map((item, index) => (
                    <ResultRow
                      key={`${item.file_path}-${item.start_line}-${index}`}
                      item={item}
                      terms={terms}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        </FadeContent>
      </Container>
    </section>
  )
}
