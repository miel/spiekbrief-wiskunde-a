/**
 * Replaces Swift Charts with inline SVG.
 *
 * A chart library fights everything this needs at once: parametric resampling per slider
 * tick, gaps where a function is undefined, asymptote rules, marked points, free line
 * segments and a log y-axis. Drawing straight to SVG mirrors FunctionGraphView.swift.
 */
import type { ReactNode } from 'react'
import { number } from './format'
import styles from './Plot.module.css'

/** Samples per curve, as in FunctionGraphView.sampleCount. */
export const SAMPLE_COUNT = 160

export interface PlotSeries {
  points: { x: number; y: number }[][]
  color: string
  isReference?: boolean
}

export interface PlotProps {
  xDomain: [number, number]
  yDomain: [number, number]
  logarithmicY?: boolean
  series: PlotSeries[]
  horizontalLine?: { value: number; label: ReactNode } | null
  verticalLine?: { value: number; label: ReactNode } | null
  points?: { x: number; y: number; label: string }[]
  segments?: { x1: number; y1: number; x2: number; y2: number; label: string }[]
  /** Vertical bars, used by the toenamediagram and the distributions. */
  bars?: { x: number; y: number; width: number; color: string; label?: string }[]
  height?: number
  /** Hides the y ticks and gridlines, as .chartYAxis(.hidden) does for the normal curve. */
  hideYAxis?: boolean
  /** Replaces the plotted description for screen readers. */
  ariaLabel: string
  children?: ReactNode
}

const PAD = { top: 10, right: 14, bottom: 26, left: 40 }
const WIDTH = 340

export interface Scales {
  sx: (x: number) => number
  sy: (y: number) => number
  innerWidth: number
  innerHeight: number
}

export function makeScales(
  xDomain: [number, number],
  yDomain: [number, number],
  height: number,
  logarithmicY: boolean,
): Scales {
  const innerWidth = WIDTH - PAD.left - PAD.right
  const innerHeight = height - PAD.top - PAD.bottom
  const [x0, x1] = xDomain
  const [y0, y1] = yDomain

  const sx = (x: number) => PAD.left + ((x - x0) / (x1 - x0)) * innerWidth

  const sy = logarithmicY
    ? (y: number) => {
        const l0 = Math.log10(Math.max(y0, Number.MIN_VALUE))
        const l1 = Math.log10(y1)
        const l = Math.log10(Math.max(y, Number.MIN_VALUE))
        return PAD.top + innerHeight - ((l - l0) / (l1 - l0)) * innerHeight
      }
    : (y: number) => PAD.top + innerHeight - ((y - y0) / (y1 - y0)) * innerHeight

  return { sx, sy, innerWidth, innerHeight }
}

/** Ticks that land on round numbers, roughly `count` of them. */
function linearTicks(min: number, max: number, count: number): number[] {
  const raw = (max - min) / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? magnitude * 10
  const ticks: number[] = []
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) {
    ticks.push(Math.abs(t) < step * 1e-9 ? 0 : t)
  }
  return ticks
}

function logTicks(min: number, max: number): number[] {
  const ticks: number[] = []
  for (let e = Math.ceil(Math.log10(min)); Math.pow(10, e) <= max; e++) ticks.push(Math.pow(10, e))
  return ticks
}

function path(points: { x: number; y: number }[], s: Scales): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${s.sx(p.x).toFixed(2)},${s.sy(p.y).toFixed(2)}`).join(' ')
}

export function Plot({
  xDomain,
  yDomain,
  logarithmicY = false,
  series,
  horizontalLine,
  verticalLine,
  points = [],
  segments = [],
  bars = [],
  height = 220,
  hideYAxis = false,
  ariaLabel,
  children,
}: PlotProps) {
  const s = makeScales(xDomain, yDomain, height, logarithmicY)
  const xTicks = linearTicks(xDomain[0], xDomain[1], 6)
  const yTicks = hideYAxis
    ? []
    : logarithmicY
      ? logTicks(yDomain[0], yDomain[1])
      : linearTicks(yDomain[0], yDomain[1], 5)

  const clipId = `clip-${Math.abs(hash(ariaLabel))}`
  const inside = (p: { x: number; y: number }) =>
    p.x >= xDomain[0] && p.x <= xDomain[1] && p.y >= yDomain[0] && p.y <= yDomain[1]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className={styles.plot}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.left} y={PAD.top} width={s.innerWidth} height={s.innerHeight} />
        </clipPath>
      </defs>

      {/* grid */}
      <g className={styles.grid}>
        {xTicks.map((t) => (
          <line key={`gx${t}`} x1={s.sx(t)} y1={PAD.top} x2={s.sx(t)} y2={PAD.top + s.innerHeight} />
        ))}
        {yTicks.map((t) => (
          <line key={`gy${t}`} x1={PAD.left} y1={s.sy(t)} x2={PAD.left + s.innerWidth} y2={s.sy(t)} />
        ))}
      </g>

      {/* axes at zero when they fall inside the domain, else at the edge */}
      <g className={styles.axis}>
        <line
          x1={PAD.left}
          y1={s.sy(clamp(0, yDomain))}
          x2={PAD.left + s.innerWidth}
          y2={s.sy(clamp(0, yDomain))}
        />
        <line
          x1={s.sx(clamp(0, xDomain))}
          y1={PAD.top}
          x2={s.sx(clamp(0, xDomain))}
          y2={PAD.top + s.innerHeight}
        />
      </g>

      {/* tick labels */}
      <g className={styles.tickLabel}>
        {xTicks.map((t) => (
          <text key={`tx${t}`} x={s.sx(t)} y={height - 10} textAnchor="middle">
            {number(t, 2)}
          </text>
        ))}
        {yTicks.map((t) => (
          <text key={`ty${t}`} x={PAD.left - 6} y={s.sy(t) + 3} textAnchor="end">
            {logarithmicY ? logLabel(t) : number(t, 2)}
          </text>
        ))}
      </g>

      <g clipPath={`url(#${clipId})`}>
        {bars.map((bar, i) => {
          const zero = clamp(0, yDomain)
          const top = Math.min(s.sy(bar.y), s.sy(zero))
          const barHeight = Math.abs(s.sy(bar.y) - s.sy(zero))
          return (
            <rect
              key={`bar${i}`}
              x={s.sx(bar.x - bar.width / 2)}
              y={top}
              width={Math.max(1, s.sx(bar.width) - s.sx(0))}
              height={Math.max(1, barHeight)}
              fill={bar.color}
              className={styles.bar}
            />
          )
        })}

        {series.map((serie, i) =>
          serie.points.map((segment, j) =>
            segment.length < 2 ? null : (
              <path
                key={`c${i}-${j}`}
                d={path(segment, s)}
                fill="none"
                stroke={serie.color}
                strokeWidth={serie.isReference ? 1.5 : 2.5}
                strokeDasharray={serie.isReference ? '5 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ),
          ),
        )}

        {segments.map((seg, i) => (
          <line
            key={`s${i}`}
            x1={s.sx(seg.x1)}
            y1={s.sy(seg.y1)}
            x2={s.sx(seg.x2)}
            y2={s.sy(seg.y2)}
            stroke="var(--red)"
            strokeWidth={1.5}
          />
        ))}

        {horizontalLine && (
          <line
            x1={PAD.left}
            y1={s.sy(horizontalLine.value)}
            x2={PAD.left + s.innerWidth}
            y2={s.sy(horizontalLine.value)}
            className={styles.rule}
          />
        )}
        {verticalLine && (
          <line
            x1={s.sx(verticalLine.value)}
            y1={PAD.top}
            x2={s.sx(verticalLine.value)}
            y2={PAD.top + s.innerHeight}
            className={styles.rule}
          />
        )}

        {points.filter(inside).map((point, i) => (
          <g key={`p${i}`}>
            <circle cx={s.sx(point.x)} cy={s.sy(point.y)} r={4} className={styles.point} />
            <text
              x={s.sx(point.x) + 6}
              y={s.sy(point.y) - 6}
              className={styles.pointLabel}
            >
              {point.label}
            </text>
          </g>
        ))}

        {children}
      </g>

      {/* Axis names sit on the axes themselves, as in a textbook, so they can never
          collide with a tick label however the domain is scaled. */}
      <text
        x={PAD.left + s.innerWidth - 2}
        y={s.sy(clamp(0, yDomain)) - 5}
        className={styles.axisLabel}
        textAnchor="end"
      >
        x
      </text>
      <text
        x={s.sx(clamp(0, xDomain)) + 5}
        y={PAD.top + 8}
        className={styles.axisLabel}
        textAnchor="start"
      >
        y
      </text>
    </svg>
  )
}

function clamp(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max)
}

function logLabel(value: number): string {
  const exponent = Math.round(Math.log10(value))
  if (exponent <= 3) return number(value, 0)
  return `10^${exponent}`
}

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return h
}

/**
 * Samples a curve across the x domain, splitting into separate paths where the function is
 * undefined so the line is not drawn across a gap.
 */
export function sampleCurve(
  f: (x: number, p: number[]) => number,
  values: number[],
  xDomain: [number, number],
  yDomain: [number, number],
  logarithmicY: boolean,
  sampleCount = SAMPLE_COUNT,
): { x: number; y: number }[][] {
  const [x0, x1] = xDomain
  const yLimit = 50 * Math.max(Math.abs(yDomain[0]), Math.abs(yDomain[1]))
  const segments: { x: number; y: number }[][] = []
  let current: { x: number; y: number }[] = []

  for (let i = 0; i <= sampleCount; i++) {
    const x = x0 + ((x1 - x0) * i) / sampleCount
    const y = f(x, values)
    const valid = Number.isFinite(y) && Math.abs(y) < yLimit && (!logarithmicY || y > 0)
    if (valid) {
      current.push({ x, y })
    } else if (current.length > 0) {
      segments.push(current)
      current = []
    }
  }
  if (current.length > 0) segments.push(current)
  return segments
}
