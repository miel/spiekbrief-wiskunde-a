/** uₙ = r · uₙ₋₁ + b, with its limit when |r| < 1. */
import { useState } from 'react'
import { FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { approximate } from '../../math/speech'
import { number, signed } from '../format'
import { ParameterSlider } from '../ParameterSlider'
import { Plot } from '../Plot'
import styles from '../FunctionGraphView.module.css'

const LAST_N = 20

export function RecursiveSequence({ height = 220 }: { height?: number }) {
  const [u0, setU0] = useState(100)
  const [r, setR] = useState(0.8)
  const [b, setB] = useState(50)

  const terms = [u0]
  for (let i = 1; i <= LAST_N; i++) terms.push(r * terms[terms.length - 1] + b)

  const limit = Math.abs(r) < 1 ? b / (1 - r) : null
  const latex = `u_n = ${number(r)} \\cdot u_{n-1}${signed(b)} \\qquad u_0 = ${number(u0)}`

  const yMax = Math.max(...terms, limit ?? 0) * 1.1 + 1
  const yMin = Math.min(...terms, 0, limit ?? 0)

  const explanation = limit
    ? `Omdat $0 \\leq r < 1$ nadert de rij de grenswaarde $\\frac{b}{1 - r} = ${number(limit, 1)}$. Die volgt uit $u = r \\cdot u + b$. $u_{20} \\approx ${number(terms[LAST_N], 1)}$.`
    : `Bij $r \\geq 1$ is er geen grenswaarde. $u_{20} \\approx ${number(terms[LAST_N], 1)}$.`

  return (
    <div className={styles.graph}>
      <h3 className={styles.title}>Recursieve formule</h3>
      <FormulaMath latex={latex} spoken={approximate(latex)} className={styles.formula} />

      <Plot
        xDomain={[0, LAST_N]}
        yDomain={[yMin, yMax]}
        series={[{ points: [terms.map((u, n) => ({ x: n, y: u }))], color: 'var(--blue)' }]}
        points={terms.map((u, n) => ({ x: n, y: u, label: '' }))}
        horizontalLine={limit === null ? null : { value: limit, label: '' }}
        height={height}
        ariaLabel={`Rij met u nul is ${number(u0)}, factor ${number(r)} en constante ${number(b)}. ${
          limit === null ? 'Geen grenswaarde.' : `Grenswaarde ${number(limit, 1)}.`
        }`}
      />

      {limit !== null && (
        <p className={styles.ruleLabels}>
          <span>grenswaarde {number(limit)}</span>
        </p>
      )}

      <div className={styles.sliders}>
        <ParameterSlider
          parameter={{ name: 'startwaarde $u_0$', min: 0, max: 400, step: 10, initial: 100 }}
          value={u0}
          onChange={setU0}
        />
        <ParameterSlider
          parameter={{ name: 'factor $r$', min: 0, max: 1.3, step: 0.05, initial: 0.8 }}
          value={r}
          onChange={setR}
        />
        <ParameterSlider
          parameter={{ name: 'constante $b$', min: -50, max: 100, step: 5, initial: 50 }}
          value={b}
          onChange={setB}
        />
      </div>

      <RichText as="p" className={styles.info} text={explanation} />
    </div>
  )
}
