/**
 * Ports Spiekbrief/Math/MathText.swift.
 *
 * Every string field in the content may mix inline math between `$…$` with Markdown, so this
 * component is used for *all* content text: summaries, captions, conditions, questions,
 * example steps, NumWorks steps, table cells, slider labels and graph info lines.
 *
 * Only three Markdown constructs occur in the content — `**bold**`, `*italic*` and `` `code` ``
 * (calculator syntax) — so a small renderer beats pulling in a Markdown library.
 */
import { Fragment, type ReactNode } from 'react'
import { renderToString } from './katex'
import { approximate } from './speech'

/** Renders one inline-math segment. KaTeX output is hidden from screen readers in favour of
 *  a Dutch approximation, matching how the iOS app reads inline math. */
function InlineMath({ latex }: { latex: string }) {
  const html = renderToString(latex, { displayMode: false })
  return (
    <span className="inline-math" role="math" aria-label={approximate(latex)}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  )
}

/** `**bold**`, `*italic*` and `` `code` ``. Returns React nodes, so nothing is injected as HTML. */
function markdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const key = `${keyPrefix}-md${i++}`
    if (match[1] !== undefined) nodes.push(<strong key={key}>{match[1]}</strong>)
    else if (match[2] !== undefined) nodes.push(<em key={key}>{match[2]}</em>)
    else nodes.push(<code key={key}>{match[3]}</code>)
    last = pattern.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export interface RichTextProps {
  text: string
  /** Element to render into; defaults to a span so it can sit inside a paragraph. */
  as?: 'span' | 'p' | 'div' | 'li' | 'h2' | 'h3' | 'td' | 'th'
  className?: string
}

/** Splits on `$`: odd segments are math, even segments are Markdown. */
export function RichText({ text, as: Tag = 'span', className }: RichTextProps) {
  const segments = text.split('$')
  return (
    <Tag className={className}>
      {segments.map((segment, index) =>
        index % 2 === 1 ? (
          <InlineMath key={index} latex={segment} />
        ) : (
          <Fragment key={index}>{markdown(segment, String(index))}</Fragment>
        ),
      )}
    </Tag>
  )
}

/** Plain-text version of a rich string, for aria-labels, titles and document titles. */
export function plainText(text: string): string {
  return text
    .split('$')
    .map((segment, index) => (index % 2 === 1 ? approximate(segment) : segment))
    .join('')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
}
