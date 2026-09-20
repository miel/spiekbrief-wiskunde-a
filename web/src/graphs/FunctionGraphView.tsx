/** Ports Spiekbrief/Graphs/FunctionGraphView.swift: formula, plot, legend, sliders, info. */
import { useMemo, useState } from 'react'
import { FormulaMath } from '../math/Formula'
import { RichText, plainText } from '../math/RichText'
import { approximate } from '../math/speech'
import { ParameterSlider } from './ParameterSlider'
import { Plot, sampleCurve } from './Plot'
import { curveColor, type FunctionGraph } from './types'
import styles from './FunctionGraphView.module.css'

export function FunctionGraphView({
  graph,
  height = 220,
}: {
  graph: FunctionGraph
  height?: number
}) {
  const [values, setValues] = useState(() => graph.parameters.map((p) => p.initial))

  const latex = graph.latex(values)
  const series = useMemo(
    () =>
      graph.curves.map((curve, index) => ({
        points: sampleCurve(
          curve.f,
          values,
          graph.xDomain,
          graph.yDomain,
          graph.logarithmicY ?? false,
        ),
        color: curveColor(index, curve.isReference),
        isReference: curve.isReference,
      })),
    [graph, values],
  )

  const horizontal = graph.horizontalLine?.(values) ?? null
  const vertical = graph.verticalLine?.(values) ?? null
  const info = graph.info?.(values)

  const setValue = (index: number, value: number) =>
    setValues((current) => current.map((v, i) => (i === index ? value : v)))

  return (
    <div className={styles.graph}>
      <h3 className={styles.title}>{graph.title}</h3>

      <FormulaMath latex={latex} spoken={approximate(latex)} className={styles.formula} />

      <Plot
        xDomain={graph.xDomain}
        yDomain={graph.yDomain}
        logarithmicY={graph.logarithmicY}
        series={series}
        horizontalLine={horizontal}
        verticalLine={vertical}
        points={graph.points?.(values)}
        segments={graph.segments?.(values)}
        height={height}
        ariaLabel={`${graph.title}. ${approximate(latex)}.${info ? ` ${plainText(info)}` : ''}`}
      />

      {/* A legend is always present for two or more curves, so identity is never colour alone. */}
      {graph.curves.length > 1 && (
        <ul className={styles.legend}>
          {graph.curves.map((curve, index) => (
            <li key={curve.name}>
              <span
                className={curve.isReference ? `${styles.swatch} ${styles.dashed}` : styles.swatch}
                style={{ background: curveColor(index, curve.isReference) }}
                aria-hidden="true"
              />
              {curve.name}
            </li>
          ))}
        </ul>
      )}

      {(horizontal?.label || vertical?.label) && (
        <p className={styles.ruleLabels}>
          {horizontal?.label && <RichText as="span" text={horizontal.label} />}
          {vertical?.label && <RichText as="span" text={vertical.label} />}
        </p>
      )}

      <div className={styles.sliders}>
        {graph.parameters.map((parameter, index) => (
          <ParameterSlider
            key={parameter.name}
            parameter={parameter}
            value={values[index]}
            onChange={(value) => setValue(index, value)}
          />
        ))}
      </div>

      {info && <RichText as="p" className={styles.info} text={info} />}
    </div>
  )
}
