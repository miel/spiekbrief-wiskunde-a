/**
 * Ports Spiekbrief/Math/FormulaView.swift and FormulaDetailView.swift.
 *
 * Rendering happens during render, never in an effect. The iOS app shipped a bug (d97fcba,
 * "Formules bleven leeg na het openen van een onderwerp") where a cached render that was not
 * a reactive dependency left every row on its placeholder; a cache outside React's render
 * path would reproduce it exactly.
 */
import { useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { renderToString } from './katex'
import styles from './Formula.module.css'

export interface FormulaMathProps {
  latex: string
  /** Hand-written Dutch reading from the content; this is why the `spoken` field exists. */
  spoken: string
  className?: string
  /** Font size in em relative to the container. */
  scale?: number
}

/** The typeset formula itself, with the Dutch reading exposed to screen readers. */
export function FormulaMath({ latex, spoken, className, scale }: FormulaMathProps) {
  const html = renderToString(latex, { displayMode: true })
  return (
    <span
      className={className}
      role="math"
      aria-label={spoken}
      style={scale ? { fontSize: `${scale}em` } : undefined}
      data-testid="formula-rendered"
    >
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
    </span>
  )
}

/**
 * A display formula in a card. Wide formulas scroll sideways behind a gradient fade, the CSS
 * analogue of the iOS `ViewThatFits` → `ScrollView` fallback. Clicking opens the zoom view.
 */
export function Formula({ latex, spoken }: { latex: string; spoken: string }) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <>
      <button
        type="button"
        className={styles.formula}
        onClick={() => setZoomed(true)}
        aria-label={`${spoken}. Vergroot`}
      >
        <span className={styles.scroller}>
          <FormulaMath latex={latex} spoken={spoken} />
        </span>
      </button>
      {zoomed && <FormulaZoom latex={latex} spoken={spoken} onClose={() => setZoomed(false)} />}
    </>
  )
}

const MIN_ZOOM = 0.6
const MAX_ZOOM = 3

/** Full-screen zoom, 0.6×–3× as on iOS. */
function FormulaZoom({
  latex,
  spoken,
  onClose,
}: {
  latex: string
  spoken: string
  onClose: () => void
}) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(MAX_ZOOM, z + 0.2))
      if (e.key === '-') setZoom((z) => Math.max(MIN_ZOOM, z - 0.2))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Formule vergroot">
      <div className={styles.overlayBar}>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.2))}
          aria-label="Kleiner"
          disabled={zoom <= MIN_ZOOM}
        >
          <Minus size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.2))}
          aria-label="Groter"
          disabled={zoom >= MAX_ZOOM}
        >
          <Plus size={20} aria-hidden="true" />
        </button>
        <button type="button" onClick={onClose} aria-label="Sluiten">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.overlayBody} onClick={onClose}>
        <FormulaMath latex={latex} spoken={spoken} scale={1.6 * zoom} />
      </div>
    </div>
  )
}
