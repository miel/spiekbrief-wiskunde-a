/**
 * Ports Spiekbrief/Features/Topic/Blocks/*.swift — one component per block type, dispatched
 * by BlockView below.
 */
import { useState } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  Copy,
  FunctionSquare,
  Lightbulb,
  Star,
} from 'lucide-react'
import type { Block, Example, Formula as FormulaModel, NumWorksTip, TableData } from '../../content/types'
import { Badge } from '../../app/Badge'
import { Formula, FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { approximate } from '../../math/speech'
import { useFavorites } from '../../persistence/favorites'
import { GraphBlock } from '../../graphs/GraphBlock'
import styles from './blocks.module.css'

export function BlockView({ block, index }: { block: Block; index: number }) {
  switch (block.type) {
    case 'heading':
      return <h2 className={styles.heading}>{block.text}</h2>
    case 'text':
      return <RichText as="p" className={styles.text} text={block.text} />
    case 'tip':
      return <Callout kind="tip" text={block.text} />
    case 'warning':
      return <Callout kind="warning" text={block.text} />
    case 'formula':
      return <FormulaCard formula={block} />
    case 'example':
      return <ExampleCard example={block} index={index} />
    case 'numworks':
      return <NumWorksCard tip={block} />
    case 'table':
      return <TableCard table={block} />
    case 'graph':
      return <GraphBlock id={block.graph} />
  }
}

/** Ports FormulaCard.swift: the formula, its caption and condition, a star and a copy action. */
export function FormulaCard({ formula }: { formula: FormulaModel }) {
  const isFavorite = useFavorites((s) => s.favorites.some((f) => f.itemId === formula.id))
  const toggle = useFavorites((s) => s.toggle)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formula.latex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked (insecure context or denied); the formula is still on screen.
    }
  }

  return (
    <article
      id={formula.id}
      className={`card ${styles.formulaCard}`}
      style={{ '--tint': formula.badge === 'formulelijst' ? 'var(--green)' : 'var(--separator)' } as React.CSSProperties}
    >
      <div className={styles.formulaTop}>
        <Badge badge={formula.badge} compact />
        <div className={styles.formulaActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={copy}
            aria-label={copied ? 'LaTeX gekopieerd' : 'Kopieer LaTeX'}
            title={copied ? 'Gekopieerd' : 'Kopieer LaTeX'}
          >
            <Copy size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={isFavorite ? `${styles.iconButton} ${styles.starOn}` : styles.iconButton}
            onClick={() => toggle(formula.id, 'formula')}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Uit favorieten' : 'Bij favorieten'}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Formula latex={formula.latex} spoken={formula.spoken} />

      {formula.caption && <RichText as="p" className={styles.caption} text={formula.caption} />}
      {formula.condition && (
        <RichText as="p" className={styles.condition} text={formula.condition} />
      )}
    </article>
  )
}

/** Ports ExampleView.swift: the problem first, then the steps one at a time. */
function ExampleCard({ example, index }: { example: Example; index: number }) {
  const [revealed, setRevealed] = useState(0)
  const done = revealed >= example.steps.length

  return (
    <article className={`card ${styles.example}`} style={{ '--tint': 'var(--accent)' } as React.CSSProperties}>
      <h3 className={styles.exampleTitle}>
        <ClipboardList size={16} aria-hidden="true" />
        {example.title}
      </h3>
      <RichText as="p" className={styles.text} text={example.problem} />

      <ol className={styles.steps}>
        {example.steps.slice(0, revealed).map((step, i) => (
          <li key={i} className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">
              {i + 1}
            </span>
            <div className={styles.stepBody}>
              <RichText as="div" text={step.text} />
              {step.latex && (
                <FormulaMath
                  latex={step.latex}
                  spoken={approximate(step.latex)}
                  className={styles.stepFormula}
                />
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.exampleButtons}>
        {!done ? (
          <>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setRevealed((r) => r + 1)}
            >
              {revealed === 0 ? 'Toon eerste stap' : 'Volgende stap'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setRevealed(example.steps.length)}
            >
              Alles
            </button>
          </>
        ) : (
          <button type="button" className={styles.secondaryButton} onClick={() => setRevealed(0)}>
            Verberg uitwerking
          </button>
        )}
      </div>
      <span className="visually-hidden" aria-live="polite">
        {revealed > 0 && `Stap ${revealed} van ${example.steps.length} van voorbeeld ${index + 1}`}
      </span>
    </article>
  )
}

/** Ports NumWorksTipView.swift: key presses in the NL examenstand. */
function NumWorksCard({ tip }: { tip: NumWorksTip }) {
  return (
    <article className={`card ${styles.numworks}`} style={{ '--tint': 'var(--yellow)' } as React.CSSProperties}>
      <header className={styles.numworksHeader}>
        <span className={styles.numworksIcon}>
          <FunctionSquare size={16} aria-hidden="true" />
        </span>
        <span>
          <strong className={styles.numworksTitle}>Op de NumWorks</strong>
          <span className={styles.numworksApp}>App: {tip.app}</span>
        </span>
      </header>
      <ol className={styles.numworksSteps}>
        {tip.steps.map((step, i) => (
          <li key={i}>
            <RichText as="span" text={step} />
          </li>
        ))}
      </ol>
      {tip.note && <RichText as="p" className={styles.note} text={tip.note} />}
    </article>
  )
}

function TableCard({ table }: { table: TableData }) {
  return (
    <figure className={styles.tableWrap}>
      <div className={`card ${styles.tableCard}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              {table.headers.map((header, i) => (
                <RichText key={i} as="th" text={header} />
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <RichText key={j} as="td" text={cell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.caption && (
        <RichText as="div" className={styles.tableCaption} text={table.caption} />
      )}
    </figure>
  )
}

function Callout({ kind, text }: { kind: 'tip' | 'warning'; text: string }) {
  const Icon = kind === 'tip' ? Lightbulb : AlertTriangle
  const tint = kind === 'tip' ? 'var(--yellow)' : 'var(--orange)'
  return (
    <aside className={styles.callout} style={{ '--tint': tint } as React.CSSProperties}>
      <Icon size={18} aria-hidden="true" className={styles.calloutIcon} />
      <RichText as="div" text={text} />
      <span className="visually-hidden">{kind === 'tip' ? 'Tip' : 'Let op'}</span>
    </aside>
  )
}
