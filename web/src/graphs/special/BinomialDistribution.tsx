/** Bars of P(X = k), with the selected tail or point highlighted. */
import { useState } from 'react'
import { FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { approximate } from '../../math/speech'
import { number } from '../format'
import { ParameterSlider } from '../ParameterSlider'
import { Plot } from '../Plot'
import { binomialPmf } from './mathfns'
import styles from '../FunctionGraphView.module.css'

type Mode = 'equal' | 'atMost' | 'atLeast'

const MODES: { mode: Mode; label: string; symbol: string }[] = [
  { mode: 'equal', label: 'P(X = k)', symbol: '=' },
  { mode: 'atMost', label: 'P(X ≤ k)', symbol: '\\leq' },
  { mode: 'atLeast', label: 'P(X ≥ k)', symbol: '\\geq' },
]

export function BinomialDistribution({ height = 220 }: { height?: number }) {
  const [n, setN] = useState(20)
  const [p, setP] = useState(0.3)
  const [k, setK] = useState(6)
  const [mode, setMode] = useState<Mode>('atMost')

  // k can never exceed n, as the Swift onChange(of: n) guarantees.
  const kClamped = Math.min(k, n)

  const probabilities = Array.from({ length: n + 1 }, (_, value) => binomialPmf(value, n, p))
  const included = (value: number) =>
    mode === 'equal' ? value === kClamped : mode === 'atMost' ? value <= kClamped : value >= kClamped

  const total = probabilities.reduce((sum, value, index) => (included(index) ? sum + value : sum), 0)
  const symbol = MODES.find((m) => m.mode === mode)!.symbol
  const latex = `P(X ${symbol} ${kClamped}) \\approx ${number(total, 4)}`
  const maxProbability = Math.max(...probabilities)

  return (
    <div className={styles.graph}>
      <h3 className={styles.title}>Binomiale verdeling</h3>
      <FormulaMath latex={latex} spoken={approximate(latex)} className={styles.formula} />

      <Plot
        xDomain={[-0.5, n + 0.5]}
        yDomain={[0, maxProbability * 1.15]}
        series={[]}
        bars={probabilities.map((probability, value) => ({
          x: value,
          y: probability,
          width: 0.82,
          color: included(value)
            ? 'var(--blue)'
            : 'color-mix(in srgb, var(--gray) 35%, transparent)',
        }))}
        height={height}
        ariaLabel={`Kansen van de binomiale verdeling met n is ${n} en p is ${number(p)}. ${
          MODES.find((m) => m.mode === mode)!.label
        } met k is ${kClamped}: ${number(total, 4)}.`}
      />

      <div className={styles.segmented} role="group" aria-label="Soort kans">
        {MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={option.mode === mode ? styles.segmentOn : styles.segment}
            onClick={() => setMode(option.mode)}
            aria-pressed={option.mode === mode}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className={styles.sliders}>
        <ParameterSlider
          parameter={{ name: 'aantal $n$', min: 1, max: 50, step: 1, initial: 20 }}
          value={n}
          onChange={(value) => {
            setN(value)
            setK((current) => Math.min(current, value))
          }}
          digits={0}
        />
        <ParameterSlider
          parameter={{ name: 'kans op succes $p$', min: 0.01, max: 0.99, step: 0.01, initial: 0.3 }}
          value={p}
          onChange={setP}
        />
        <ParameterSlider
          parameter={{ name: '$k$', min: 0, max: n, step: 1, initial: 6 }}
          value={kClamped}
          onChange={setK}
          digits={0}
        />
      </div>

      <RichText
        as="p"
        className={styles.info}
        text={`$E(X) = n \\cdot p = ${number(n * p)}$ en $\\sigma(X) = \\sqrt{n \\cdot p \\cdot (1 - p)} \\approx ${number(
          Math.sqrt(n * p * (1 - p)),
        )}$.`}
      />
    </div>
  )
}
