import { useMemo, useState, type ReactNode } from 'react'
import { copyText } from '../lib/clipboard'
import { splitPath } from '../lib/format'
import { CheckIcon, CopyIcon, FileIcon } from './icons'

interface Token {
  text: string
  className?: string
}

const KEYWORDS = new Set([
  // js / ts
  'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for',
  'from', 'function', 'get', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'of',
  'return', 'set', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'yield', 'null', 'undefined', 'interface',
  'type', 'enum', 'implements', 'namespace', 'readonly', 'declare', 'public',
  'private', 'protected', 'require', 'module', 'as', 'keyof', 'satisfies',
  // python
  'def', 'elif', 'except', 'finally', 'lambda', 'pass', 'raise', 'global', 'nonlocal',
  'and', 'or', 'not', 'is', 'assert', 'None', 'True', 'False', 'self',
  // go / rust / java / c / cpp / sql
  'package', 'func', 'struct', 'map', 'chan', 'select', 'goto', 'range', 'nil',
  'match', 'fn', 'mut', 'impl', 'trait', 'pub', 'use', 'mod', 'where', 'loop',
  'volatile', 'extern', 'register', 'signed', 'unsigned', 'typedef', 'union',
  'long', 'short', 'char', 'int', 'float', 'double', 'void', 'select',
  'INSERT', 'UPDATE', 'DELETE', 'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT',
  'INNER', 'OUTER', 'ON', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT', 'OFFSET',
  'VALUES', 'INTO', 'SET', 'CREATE', 'TABLE', 'INDEX', 'DROP', 'ALTER', 'AND', 'OR',
  'NOT', 'NULL', 'PRIMARY', 'FOREIGN', 'KEY', 'REFERENCES', 'DISTINCT', 'AS', 'CASE',
  'WHEN', 'THEN', 'ELSE', 'END', 'BETWEEN', 'LIKE', 'IN', 'EXISTS', 'UNION', 'ALL',
])

const CONSTANT_PATTERN = /^[A-Z][A-Z0-9_]{2,}$/

const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  json: 'JSON',
  jsonc: 'JSON',
  bash: 'Shell',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Shell',
  yaml: 'YAML',
  yml: 'YAML',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  md: 'Markdown',
  markdown: 'Markdown',
  text: 'Text',
  plaintext: 'Text',
  '': 'Code',
}

const IS_DIGIT = /[0-9]/
const IS_IDENTIFIER_START = /[A-Za-z_$]/
const IS_IDENTIFIER_PART = /[\w$]/
const IS_NUMBER_PART = /[0-9a-zA-Z._]/

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  const n = code.length
  let i = 0

  while (i < n) {
    const ch = code[i]
    const next = code[i + 1]

    if (ch === '/' && next === '/') {
      const end = code.indexOf('\n', i)
      tokens.push({ text: code.slice(i, end === -1 ? n : end), className: 'tok-comment' })
      i = end === -1 ? n : end
      continue
    }

    if (ch === '/' && next === '*') {
      const end = code.indexOf('*/', i + 2)
      tokens.push({ text: code.slice(i, end === -1 ? n : end + 2), className: 'tok-comment' })
      i = end === -1 ? n : end + 2
      continue
    }

    if (ch === '#' && next === '!') {
      const end = code.indexOf('\n', i)
      tokens.push({ text: code.slice(i, end === -1 ? n : end), className: 'tok-comment' })
      i = end === -1 ? n : end
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1
      while (j < n) {
        if (code[j] === '\\') {
          j += 2
          continue
        }
        if (code[j] === ch) {
          j += 1
          break
        }
        j += 1
      }
      tokens.push({ text: code.slice(i, j), className: 'tok-string' })
      i = j
      continue
    }

    if (IS_DIGIT.test(ch) || (ch === '-' && next !== undefined && IS_DIGIT.test(next))) {
      let j = i
      while (j < n && IS_NUMBER_PART.test(code[j])) j += 1
      tokens.push({ text: code.slice(i, j), className: 'tok-number' })
      i = j
      continue
    }

    if (IS_IDENTIFIER_START.test(ch)) {
      let j = i
      while (j < n && IS_IDENTIFIER_PART.test(code[j])) j += 1
      const word = code.slice(i, j)
      let className: string | undefined
      if (KEYWORDS.has(word)) {
        className = 'tok-keyword'
      } else if (code[j] === '(') {
        className = 'tok-fn'
      } else if (CONSTANT_PATTERN.test(word)) {
        className = 'tok-constant'
      } else if (/^[A-Z]/.test(word)) {
        className = 'tok-type'
      }
      tokens.push({ text: word, className })
      i = j
      continue
    }

    tokens.push({ text: ch })
    i += 1
  }

  return tokens
}

function languageLabel(language: string): string {
  const normalized = language.trim().toLowerCase()
  return LANGUAGE_LABELS[normalized] ?? (normalized ? normalized : 'Code')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildHighlightPattern(terms: string[]): RegExp | null {
  const cleaned = terms
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .sort((a, b) => b.length - a.length)
  if (cleaned.length === 0) return null
  return new RegExp(`(${cleaned.map(escapeRegExp).join('|')})`, 'gi')
}

interface CodeBlockProps {
  code: string
  language?: string
  fileName?: string
  startLine?: number
  highlightLines?: number[]
  highlightTerms?: string[]
  showHeader?: boolean
  compact?: boolean
}

export default function CodeBlock({
  code,
  language = '',
  fileName,
  startLine = 1,
  highlightLines,
  highlightTerms,
  showHeader = true,
  compact = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const tokens = useMemo(() => tokenize(code), [code])
  const label = useMemo(() => languageLabel(language), [language])
  const highlightPattern = useMemo(
    () => buildHighlightPattern(highlightTerms ?? []),
    [highlightTerms],
  )
  const path = useMemo(() => (fileName ? splitPath(fileName) : null), [fileName])

  const lines = useMemo(() => {
    const rows: ReactNode[][] = [[]]
    let key = 0

    for (const token of tokens) {
      const parts = token.text.split('\n')
      for (let p = 0; p < parts.length; p += 1) {
        if (p > 0) rows.push([])
        const part = parts[p]
        if (!part) continue

        if (highlightPattern) {
          const pieces = part.split(highlightPattern)
          for (let k = 0; k < pieces.length; k += 1) {
            const piece = pieces[k]
            if (!piece) continue
            const node =
              k % 2 === 1 ? (
                <mark className="tok-match" key={key}>
                  {piece}
                </mark>
              ) : token.className ? (
                <span className={token.className} key={key}>
                  {piece}
                </span>
              ) : (
                (piece as unknown as ReactNode)
              )
            rows[rows.length - 1].push(node)
            key += 1
          }
        } else {
          const node = token.className ? (
            <span className={token.className} key={key}>
              {part}
            </span>
          ) : (
            (part as unknown as ReactNode)
          )
          rows[rows.length - 1].push(node)
          key += 1
        }
      }
    }

    if (rows[rows.length - 1].length === 0) rows.pop()
    return rows
  }, [tokens, highlightPattern])

  const highlight = useMemo(() => new Set(highlightLines ?? []), [highlightLines])

  async function handleCopy() {
    const ok = await copyText(code)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  return (
    <div className={`code-block${compact ? ' is-compact' : ''}`}>
      {showHeader && (
        <div className="code-block-header">
          {fileName && (
            <span className="code-block-path" title={fileName}>
              <FileIcon size={12} />
              {path && path.directory && (
                <span className="code-block-path-dir">{path.directory}</span>
              )}
              {path ? path.basename : fileName}
            </span>
          )}
          <span className="code-block-lang">{label}</span>
          <button
            type="button"
            className={`code-block-copy${copied ? ' is-copied' : ''}`}
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <div className="code-block-body" role="region" aria-label={`${label} code`}>
        {lines.map((nodes, index) => {
          const lineNumber = startLine + index
          return (
            <div
              className={`code-line${highlight.has(lineNumber) ? ' is-highlighted' : ''}`}
              key={lineNumber}
            >
              <span className="code-gutter">{lineNumber}</span>
              <code>{nodes}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}
