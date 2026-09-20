/** Logistic growth with its increase diagram: bars of Δy per interval of width Δx. */
import { useState } from 'react'
import { FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { number } from '../format'
import { Plot, sampleCurve } from '../Plot'
import { logistic } from './mathfns'
import styles from '../FunctionGraphView.module.css'

const STEPS = [0.5, 1, 2]
const DOMAIN: [number, number] = [0, 8]

export function IncreaseDiagram({ height = 220 }: { height?: number }) {
  const [stepIndex, setStepIndex] = useState(1)
  const step = STEPS[stepIndex]

  const bars: { start: number; end: number; increase: number }[] = []
  for (let x = DOMAIN[0]; x < DOMAIN[1] - 1e-9; x += step) {
    bars.push({ start: x, end: x + step, increase: logistic(x + step) - logistic(x) })
  }

  const maxIncrease = Math.max(...bars.map((b) => b.increase), 0.1)

  return (
    <div className={styles.graph}>
      <h3 className={styles.title}>Toenamediagram</h3>
      <FormulaMath
        latex="f(x) = \frac{20}{1 + 9 \cdot e^{-x}}"
        spoken="f van x is 20 gedeeld door 1 plus 9 keer e tot de macht min x"
        className={styles.formula}
      />

      <Plot
        xDomain={DOMAIN}
        yDomain={[0, 21]}
        series={[
          {
            points: sampleCurve((x) => logistic(x), [], DOMAIN, [0, 21], false),
            color: 'var(--blue)',
          },
        ]}
        points={bars.map((bar) => ({ x: bar.start, y: logistic(bar.start), label: '' }))}
        height={height * 0.6}
        ariaLabel="Grafiek van f: S-vormige groei van 2 naar 20"
      />

      <Plot
        xDomain={DOMAIN}
        yDomain={[0, maxIncrease * 1.15]}
        series={[]}
        bars={bars.map((bar) => ({
          x: (bar.start + bar.end) / 2,
          y: bar.increase,
          width: step * 0.84,
          color: 'var(--orange)',
        }))}
        height={height * 0.5}
        ariaLabel={`Toenamediagram met stapgrootte ${number(step)}: ${bars
          .map((b) => `van ${number(b.start)} tot ${number(b.end)}: toename ${number(b.increase)}`)
          .join(', ')}`}
      />

      <div className={styles.segmented} role="group" aria-label="Stapgrootte Δx">
        {STEPS.map((value, index) => (
          <button
            key={value}
            type="button"
            className={index === stepIndex ? styles.segmentOn : styles.segment}
            onClick={() => setStepIndex(index)}
            aria-pressed={index === stepIndex}
          >
            Δx = {number(value)}
          </button>
        ))}
      </div>

      <RichText
        as="p"
        className={styles.info}
        text="De staven worden eerst **hoger** (toenemend stijgend) en na $x \approx 2,2$ **lager** (afnemend stijgend). Waar de staven het hoogst zijn, stijgt $f$ het snelst."
      />
    </div>
  )
}
