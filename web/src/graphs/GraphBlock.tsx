/** Ports GraphBlockView in Spiekbrief/Graphs/GraphComponents.swift: a card with an expand button. */
import { useEffect, useState } from 'react'
import { AlertTriangle, Maximize2, X } from 'lucide-react'
import { definition } from './library'
import { FunctionGraphView } from './FunctionGraphView'
import { BinomialDistribution } from './special/BinomialDistribution'
import { IncreaseDiagram } from './special/IncreaseDiagram'
import { NormalDistribution } from './special/NormalDistribution'
import { RecursiveSequence } from './special/RecursiveSequence'
import type { GraphDefinition } from './types'
import styles from './GraphBlock.module.css'

function GraphContent({ graph, height }: { graph: GraphDefinition; height: number }) {
  switch (graph.kind) {
    case 'function':
      return <FunctionGraphView graph={graph.graph} height={height} />
    case 'increaseDiagram':
      return <IncreaseDiagram height={height} />
    case 'recursiveSequence':
      return <RecursiveSequence height={height} />
    case 'normal':
      return <NormalDistribution height={height} />
    case 'binomial':
      return <BinomialDistribution height={height} />
  }
}

export function GraphBlock({ id }: { id: string }) {
  const [expanded, setExpanded] = useState(false)
  const graph = definition(id)

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded])

  if (!graph) {
    return (
      <aside className={styles.missing}>
        <AlertTriangle size={18} aria-hidden="true" />
        Grafiek „{id}” ontbreekt.
      </aside>
    )
  }

  return (
    <>
      <div className={`card ${styles.block}`} style={{ '--tint': 'var(--separator)' } as React.CSSProperties}>
        <header className={styles.header}>
          <span className={styles.label}>Interactieve grafiek</span>
          <button
            type="button"
            className={styles.expand}
            onClick={() => setExpanded(true)}
            aria-label="Vergroot grafiek"
          >
            <Maximize2 size={16} aria-hidden="true" />
          </button>
        </header>
        {/* Remounted when closing the overlay so both copies do not fight over slider state. */}
        <GraphContent graph={graph} height={220} />
      </div>

      {expanded && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Grafiek">
          <div className={styles.overlayBar}>
            <button type="button" onClick={() => setExpanded(false)}>
              Klaar
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className={styles.overlayBody}>
            <GraphContent graph={graph} height={320} />
          </div>
        </div>
      )}
    </>
  )
}
