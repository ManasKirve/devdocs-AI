import type { ReactNode } from 'react'
import CodeBlock from './CodeBlock'

type Block =
  | { type: 'code'; language: string; code: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'quote'; text: string }

const FENCE_PATTERN = /^```([\w+#.-]*)\s*$/
const CLOSE_FENCE_PATTERN = /^```\s*$/
const LIST_ITEM_PATTERN = /^\s*([-*+]|\d+[.)])\s+(.*)$/
const ORDERED_PATTERN = /\d+[.)]/
const HEADING_PATTERN = /^(#{1,3})\s+(.*)$/
const QUOTE_PATTERN = /^>\s?(.*)$/
const BLANK_LINE_PATTERN = /^\s*$/
const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\d+\])/g
const SOURCE_MARKER_PATTERN = /^\[(\d+)\]$/

function renderInline(text: string, keyPrefix: string, sourceCount: number): ReactNode[] {
  return text.split(INLINE_PATTERN).map((part, index) => {
    const key = `${keyPrefix}-${index}`

    const marker = SOURCE_MARKER_PATTERN.exec(part)
    if (marker && sourceCount > 0 && Number(marker[1]) <= sourceCount) {
      const num = marker[1]
      return (
        <sup className="answer-ref" key={key}>
          <a href={`#qa-source-${num}`} aria-label={`Jump to source ${num}`}>
            {num}
          </a>
        </sup>
      )
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return <code key={key}>{part.slice(1, -1)}</code>
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }

    if (!part) {
      return null
    }

    return <span key={key}>{part}</span>
  })
}

function renderBlock(block: Block, index: number, sourceCount: number): ReactNode {
  switch (block.type) {
    case 'code':
      return <CodeBlock key={index} code={block.code} language={block.language} />
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              {renderInline(item, `qa-li-${index}-${itemIndex}`, sourceCount)}
            </li>
          ))}
        </ListTag>
      )
    }
    case 'heading': {
      const HeadingTag = `h${Math.min(block.level, 3)}` as 'h1' | 'h2' | 'h3'
      return (
        <HeadingTag key={index}>
          {renderInline(block.text, `qa-h-${index}`, sourceCount)}
        </HeadingTag>
      )
    }
    case 'quote':
      return (
        <blockquote key={index}>
          {renderInline(block.text, `qa-q-${index}`, sourceCount)}
        </blockquote>
      )
    case 'paragraph':
      return <p key={index}>{renderInline(block.text, `qa-p-${index}`, sourceCount)}</p>
  }
}

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const fence = FENCE_PATTERN.exec(line)

    if (fence) {
      const language = fence[1]
      const codeLines: string[] = []
      index += 1
      while (index < lines.length && !CLOSE_FENCE_PATTERN.test(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      index += 1
      blocks.push({ type: 'code', language, code: codeLines.join('\n') })
      continue
    }

    if (BLANK_LINE_PATTERN.test(line)) {
      index += 1
      continue
    }

    const heading = HEADING_PATTERN.exec(line)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      index += 1
      continue
    }

    const quote = QUOTE_PATTERN.exec(line)
    if (quote) {
      const quoteLines = [quote[1]]
      index += 1
      while (index < lines.length) {
        const nextQuote = QUOTE_PATTERN.exec(lines[index])
        if (nextQuote) {
          quoteLines.push(nextQuote[1])
          index += 1
          continue
        }
        break
      }
      blocks.push({ type: 'quote', text: quoteLines.join('\n') })
      continue
    }

    const listMatch = LIST_ITEM_PATTERN.exec(line)
    if (listMatch) {
      const ordered = ORDERED_PATTERN.test(listMatch[1])
      const items = [listMatch[2]]
      index += 1
      while (index < lines.length) {
        const next = LIST_ITEM_PATTERN.exec(lines[index])
        if (next && ORDERED_PATTERN.test(next[1]) === ordered) {
          items.push(next[2])
          index += 1
          continue
        }
        break
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (
      index < lines.length &&
      !BLANK_LINE_PATTERN.test(lines[index]) &&
      !FENCE_PATTERN.test(lines[index]) &&
      !HEADING_PATTERN.test(lines[index]) &&
      !QUOTE_PATTERN.test(lines[index]) &&
      !LIST_ITEM_PATTERN.test(lines[index])
    ) {
      paragraphLines.push(lines[index])
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') })
  }

  return blocks
}

interface AnswerContentProps {
  content: string
  format?: string
  sourceCount?: number
}

export default function AnswerContent({
  content,
  format = 'text',
  sourceCount = 0,
}: AnswerContentProps) {
  const parseInline = format === 'text' || format === 'markdown'

  if (!parseInline) {
    return (
      <div className="answer-markdown">
        <CodeBlock code={content} language="text" />
      </div>
    )
  }

  return (
    <div className="answer-markdown">{parseBlocks(content).map((block, index) => renderBlock(block, index, sourceCount))}</div>
  )
}
