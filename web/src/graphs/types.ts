/** Ports Spiekbrief/Graphs/GraphSpec.swift. Swift closures become plain functions. */

/** A slider on an interactive graph. */
export interface GraphParameter {
  /** Display name, may contain inline math, e.g. "$g$". */
  name: string
  min: number
  max: number
  step: number
  initial: number
}

export interface Curve {
  name: string
  f: (x: number, p: number[]) => number
  /** Drawn dashed and grey, e.g. the original graph before a transformation. */
  isReference?: boolean
}

export interface MarkedPoint {
  x: number
  y: number
  label: string
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

/** A graph of one or more functions of x, with sliders for its parameters. */
export interface FunctionGraph {
  title: string
  parameters: GraphParameter[]
  xDomain: [number, number]
  yDomain: [number, number]
  curves: Curve[]
  /** The formula with the current parameter values filled in, as LaTeX. */
  latex: (p: number[]) => string
  /** Horizontal line, e.g. an asymptote or the evenwichtsstand. */
  horizontalLine?: (p: number[]) => { value: number; label: string } | null
  /** Vertical line, e.g. an asymptote. */
  verticalLine?: (p: number[]) => { value: number; label: string } | null
  /** Points to mark, e.g. the top of a parabola. */
  points?: (p: number[]) => MarkedPoint[]
  /** Straight line segments, e.g. a tangent or secant. */
  segments?: (p: number[]) => Segment[]
  /** One line of explanation under the graph, may contain inline math. */
  info?: (p: number[]) => string
  /** Show the y-axis on a logarithmic scale. */
  logarithmicY?: boolean
}

export type GraphDefinition =
  | { kind: 'function'; graph: FunctionGraph }
  | { kind: 'increaseDiagram' }
  | { kind: 'recursiveSequence' }
  | { kind: 'normal' }
  | { kind: 'binomial' }

/** Curve colours, in order. Mirrors GraphPalette in GraphComponents.swift. */
export const palette = ['var(--blue)', 'var(--orange)', 'var(--green)', 'var(--purple)']

export function curveColor(index: number, isReference?: boolean): string {
  return isReference ? 'var(--gray)' : palette[index % palette.length]
}
