/** Ports ParameterSlider in Spiekbrief/Graphs/GraphComponents.swift. */
import { RichText, plainText } from '../math/RichText'
import { number } from './format'
import type { GraphParameter } from './types'
import styles from './FunctionGraphView.module.css'

export function ParameterSlider({
  parameter,
  value,
  onChange,
  digits = 2,
}: {
  parameter: GraphParameter
  value: number
  onChange: (value: number) => void
  digits?: number
}) {
  return (
    <label className={styles.slider}>
      <span className={styles.sliderTop}>
        <RichText as="span" text={parameter.name} />
        <span className={styles.sliderValue}>{number(value, digits)}</span>
      </span>
      <input
        type="range"
        min={parameter.min}
        max={parameter.max}
        step={parameter.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={plainText(parameter.name)}
        aria-valuetext={number(value, digits)}
      />
    </label>
  )
}
