/** The normal curve with a shaded probability between two bounds. */
import { useState } from 'react'
import { FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { approximate } from '../../math/speech'
import { number } from '../format'
import { ParameterSlider } from '../ParameterSlider'
import { makeScales, Plot } from '../Plot'
import { normalCdf, normalDensity } from './mathfns'
import styles from '../FunctionGraphView.module.css'

const DOMAIN: [number, number] = [130, 220]

export function NormalDistribution({ height = 220 }: { height?: number }) {
  const [mu, setMu] = useState(175)
  const [sigma, setSigma] = useState(7)
  const [low, setLow] = useState(168)
  const [high, setHigh] = useState(182)

  const a = Math.min(low, high)
  const b = Math.max(low, high)
  const probability = normalCdf(b, mu, sigma) - normalCdf(a, mu, sigma)

  const xs: number[] = []
  for (let x = DOMAIN[0]; x <= DOMAIN[1] + 1e-9; x += 0.5) xs.push(x)

  const peak = normalDensity(mu, mu, sigma)
  const yDomain: [number, number] = [0, peak * 1.15]
  const latex = `P(${number(a, 1)} < X < ${number(b, 1)}) \\approx ${number(probability, 3)}`

  // The shaded area is drawn as a polygon in plot coordinates, so it needs the same scales.
  const s = makeScales(DOMAIN, yDomain, height, false)
  const areaPoints = xs.filter((x) => x >= a && x <= b)
  const areaPath =
    areaPoints.length > 1
      ? `M${s.sx(areaPoints[0])},${s.sy(0)} ` +
        areaPoints.map((x) => `L${s.sx(x)},${s.sy(normalDensity(x, mu, sigma))}`).join(' ') +
        ` L${s.sx(areaPoints[areaPoints.length - 1])},${s.sy(0)} Z`
      : ''

  return (
    <div className={styles.graph}>
      <h3 className={styles.title}>Normale verdeling</h3>
      <FormulaMath latex={latex} spoken={approximate(latex)} className={styles.formula} />

      <Plot
        xDomain={DOMAIN}
        yDomain={yDomain}
        series={[
          {
            points: [xs.map((x) => ({ x, y: normalDensity(x, mu, sigma) }))],
            color: 'var(--blue)',
          },
        ]}
        verticalLine={{ value: mu, label: 'μ' }}
        height={height}
        hideYAxis
        ariaLabel={`Normale kromme met gemiddelde ${number(mu)} en standaardafwijking ${number(
          sigma,
        )}. Gearceerde kans ${number(probability, 3)}.`}
      >
        {areaPath && <path d={areaPath} fill="var(--blue)" opacity={0.3} />}
        <text x={s.sx(mu) + 4} y={s.sy(peak) - 4} className={styles.ruleName}>
          μ
        </text>
      </Plot>

      <div className={styles.sliders}>
        <ParameterSlider
          parameter={{ name: 'gemiddelde $\\mu$', min: 150, max: 200, step: 1, initial: 175 }}
          value={mu}
          onChange={setMu}
          digits={0}
        />
        <ParameterSlider
          parameter={{
            name: 'standaardafwijking $\\sigma$',
            min: 2,
            max: 15,
            step: 0.5,
            initial: 7,
          }}
          value={sigma}
          onChange={setSigma}
          digits={1}
        />
        <ParameterSlider
          parameter={{ name: 'linkergrens', min: DOMAIN[0], max: DOMAIN[1], step: 0.5, initial: 168 }}
          value={low}
          onChange={setLow}
          digits={1}
        />
        <ParameterSlider
          parameter={{ name: 'rechtergrens', min: DOMAIN[0], max: DOMAIN[1], step: 0.5, initial: 182 }}
          value={high}
          onChange={setHigh}
          digits={1}
        />
      </div>

      <RichText
        as="p"
        className={styles.info}
        text={`Vuistregels: tussen $\\mu \\pm \\sigma$ ligt $68\\pct$, tussen $\\mu \\pm 2\\sigma$ ligt $95\\pct$. Hier: $z$-waarden $${number(
          (a - mu) / sigma,
        )}$ en $${number((b - mu) / sigma)}$.`}
      />

      <div className={styles.segmented} role="group" aria-label="Snelkeuze grenzen">
        {[1, 2, 3].map((k) => (
          <button
            key={k}
            type="button"
            className={styles.segment}
            onClick={() => {
              setLow(mu - k * sigma)
              setHigh(mu + k * sigma)
            }}
          >
            μ ± {k === 1 ? '' : k}σ
          </button>
        ))}
      </div>
    </div>
  )
}
