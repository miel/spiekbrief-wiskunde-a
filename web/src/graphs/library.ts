/**
 * Ports Spiekbrief/Graphs/GraphLibrary.swift.
 *
 * Functions are plain functions rather than parsed expressions: no parser to get wrong, and
 * evaluation is fast enough to resample every curve on each slider tick.
 */
import { coefficient, number, percent, signed } from './format'
import type { FunctionGraph, GraphDefinition } from './types'

const linear: FunctionGraph = {
  title: 'Lineaire functie',
  parameters: [
    { name: '$a$ (rc)', min: -4, max: 4, step: 0.5, initial: 2 },
    { name: '$b$', min: -5, max: 5, step: 0.5, initial: 1 },
  ],
  xDomain: [-5, 5],
  yDomain: [-10, 10],
  curves: [{ name: 'f', f: (x, p) => p[0] * x + p[1] }],
  latex: (p) => `y = ${coefficient(p[0])}x${signed(p[1])}`,
  points: (p) => [{ x: 0, y: p[1], label: '(0, b)' }],
  info: (p) => `Elke stap $+1$ naar rechts gaat de grafiek $${number(p[0])}$ omhoog.`,
}

const quadratic: FunctionGraph = {
  title: 'Tweedegraadsfunctie',
  parameters: [
    { name: '$a$', min: -3, max: 3, step: 0.25, initial: 1 },
    { name: '$b$', min: -6, max: 6, step: 0.5, initial: -2 },
    { name: '$c$', min: -6, max: 6, step: 0.5, initial: -3 },
  ],
  xDomain: [-6, 6],
  yDomain: [-10, 10],
  curves: [{ name: 'f', f: (x, p) => p[0] * x * x + p[1] * x + p[2] }],
  latex: (p) => {
    const a = p[0] === 0 ? '' : `${coefficient(p[0])}x^2`
    return `y = ${a}${signed(p[1], 2, 'x')}${signed(p[2])}`
  },
  points: (p) => {
    if (p[0] === 0) return []
    const xt = -p[1] / (2 * p[0])
    return [{ x: xt, y: p[0] * xt * xt + p[1] * xt + p[2], label: 'top' }]
  },
  info: (p) => {
    if (p[0] > 0) return '$a > 0$: dalparabool, de top is een minimum.'
    if (p[0] < 0) return '$a < 0$: bergparabool, de top is een maximum.'
    return '$a = 0$: geen parabool meer, maar een rechte lijn.'
  },
}

const power: FunctionGraph = {
  title: 'Machtsfunctie',
  parameters: [
    { name: '$a$', min: -3, max: 3, step: 0.5, initial: 1 },
    { name: '$n$', min: -2, max: 3, step: 0.5, initial: 0.5 },
  ],
  xDomain: [0, 6],
  yDomain: [-6, 6],
  curves: [{ name: 'f', f: (x, p) => (x <= 0 && p[1] <= 0 ? NaN : p[0] * Math.pow(x, p[1])) }],
  latex: (p) => `y = ${coefficient(p[0])}x^{${number(p[1])}}`,
  info: (p) => {
    const n = p[1]
    if (n > 1) return '$n > 1$: toenemend stijgend (bij $a > 0$).'
    if (n === 1) return '$n = 1$: een rechte lijn.'
    if (n > 0) return '$0 < n < 1$: afnemend stijgend (bij $a > 0$), zoals $\\sqrt{x} = x^{0,5}$.'
    if (n === 0) return '$n = 0$: constant, $y = a$.'
    return '$n < 0$: de $x$-as en $y$-as zijn asymptoten, bijv. $x^{-1} = \\frac{1}{x}$.'
  },
}

const exponential: FunctionGraph = {
  title: 'Exponentiële functie',
  parameters: [
    { name: 'beginwaarde $b$', min: 0.5, max: 8, step: 0.5, initial: 2 },
    { name: 'groeifactor $g$', min: 0.2, max: 2.5, step: 0.05, initial: 1.5 },
  ],
  xDomain: [-4, 8],
  yDomain: [0, 40],
  curves: [{ name: 'f', f: (x, p) => p[0] * Math.pow(p[1], x) }],
  latex: (p) => `y = ${number(p[0])} \\cdot ${number(p[1])}^x`,
  horizontalLine: () => ({ value: 0, label: 'asymptoot $y = 0$' }),
  points: (p) => [{ x: 0, y: p[0], label: 'beginwaarde' }],
  info: (p) => {
    const g = p[1]
    if (g > 1) {
      return `Groei van $${percent(g - 1)}$ per tijdseenheid. Verdubbelingstijd $= \\glog{${number(g)}}(2) \\approx ${number(Math.log(2) / Math.log(g))}$.`
    }
    if (g < 1) {
      return `Afname van $${percent(1 - g)}$ per tijdseenheid. Halveringstijd $= \\glog{${number(g)}}(0,5) \\approx ${number(Math.log(0.5) / Math.log(g))}$.`
    }
    return '$g = 1$: constant, geen groei.'
  },
}

const logarithm: FunctionGraph = {
  title: 'Logaritmische functie',
  parameters: [{ name: 'grondtal $g$', min: 0.2, max: 10, step: 0.1, initial: 2 }],
  xDomain: [0, 10],
  yDomain: [-5, 5],
  curves: [
    { name: 'f', f: (x, p) => (x <= 0 || p[0] === 1 ? NaN : Math.log(x) / Math.log(p[0])) },
  ],
  latex: (p) => `y = \\glog{${number(p[0])}}(x)`,
  verticalLine: () => ({ value: 0, label: 'asymptoot $x = 0$' }),
  points: () => [{ x: 1, y: 0, label: '(1, 0)' }],
  info: (p) => {
    if (p[0] > 1) return '$g > 1$: afnemend stijgend. Altijd door $(1, 0)$ en $(g, 1)$.'
    if (p[0] < 1) return '$0 < g < 1$: dalend. Altijd door $(1, 0)$ en $(g, 1)$.'
    return '$g = 1$ is geen geldig grondtal.'
  },
}

const sine: FunctionGraph = {
  title: 'Sinusoïde',
  parameters: [
    { name: 'evenwichtsstand $a$', min: -3, max: 3, step: 0.5, initial: 1 },
    { name: 'amplitude $b$', min: 0.5, max: 4, step: 0.5, initial: 2 },
    { name: '$c$', min: 0.25, max: 3, step: 0.25, initial: 1 },
    { name: 'horizontale verschuiving $d$', min: -3, max: 3, step: 0.25, initial: 0 },
  ],
  xDomain: [-1, 13],
  yDomain: [-7, 7],
  curves: [{ name: 'f', f: (x, p) => p[0] + p[1] * Math.sin(p[2] * (x - p[3])) }],
  latex: (p) => {
    const inner = p[3] === 0 ? 'x' : `(x${signed(-p[3])})`
    return `y = ${number(p[0])}${signed(p[1])} \\sin(${coefficient(p[2])}${inner})`
  },
  horizontalLine: (p) => ({ value: p[0], label: 'evenwichtsstand' }),
  points: (p) => [{ x: p[3], y: p[0], label: 'start omhoog' }],
  info: (p) =>
    `Periode $= \\frac{2\\pi}{c} \\approx ${number((2 * Math.PI) / p[2])}$. Max $= a + b = ${number(p[0] + p[1])}$, min $= a - b = ${number(p[0] - p[1])}$.`,
}

const transformations: FunctionGraph = {
  title: 'Verschuiven en herschalen',
  parameters: [
    { name: 'herschalen verticaal $a$', min: -3, max: 3, step: 0.25, initial: 1 },
    { name: 'herschalen horizontaal $c$', min: 0.25, max: 3, step: 0.25, initial: 1 },
    { name: 'naar rechts $p$', min: -4, max: 4, step: 0.5, initial: 2 },
    { name: 'omhoog $q$', min: -4, max: 4, step: 0.5, initial: -1 },
  ],
  xDomain: [-6, 6],
  yDomain: [-6, 8],
  curves: [
    { name: 'origineel', f: (x) => x * x, isReference: true },
    { name: 'nieuw', f: (x, p) => p[0] * Math.pow((x - p[2]) / p[1], 2) + p[3] },
  ],
  latex: (p) => {
    const shifted = p[2] === 0 ? 'x' : `x${signed(-p[2])}`
    const inner = p[1] === 1 ? shifted : `\\frac{${shifted}}{${number(p[1])}}`
    const square = p[1] === 1 && p[2] === 0 ? 'x^2' : `\\left(${inner}\\right)^2`
    return `y = ${coefficient(p[0])}${square}${signed(p[3])}`
  },
  info: () =>
    'Origineel (grijs): $y = x^2$. Vermenigvuldig met $a$ ↕, vervang $x$ door $\\frac{x}{c}$ ↔, $x$ door $x - p$ (naar rechts) en tel $q$ op (omhoog).',
}

const inverseProportional: FunctionGraph = {
  title: 'Omgekeerd evenredig',
  parameters: [{ name: '$a$', min: 0.5, max: 10, step: 0.5, initial: 4 }],
  xDomain: [0, 10],
  yDomain: [0, 10],
  curves: [{ name: 'f', f: (x, p) => (x <= 0 ? NaN : p[0] / x) }],
  latex: (p) => `y = \\frac{${number(p[0])}}{x}`,
  info: (p) =>
    `$x \\cdot y = ${number(p[0])}$ is constant: wordt $x$ twee keer zo groot, dan wordt $y$ twee keer zo klein.`,
}

export function tangentF(x: number): number {
  return 0.1 * x * x * x - x + 2
}

export function tangentDF(x: number): number {
  return 0.3 * x * x - 1
}

/** f(x) = 0,1x³ − x + 2, with a secant through x₀ and x₀ + h and the tangent at x₀. */
const tangent: FunctionGraph = {
  title: 'Differentiequotiënt en raaklijn',
  parameters: [
    { name: '$x_0$', min: -4, max: 4, step: 0.1, initial: 1 },
    { name: '$\\Delta x$', min: 0.1, max: 4, step: 0.1, initial: 2 },
  ],
  xDomain: [-5, 5],
  yDomain: [-6, 10],
  curves: [{ name: 'f', f: (x) => tangentF(x) }],
  latex: () => 'f(x) = 0,1x^3 - x + 2',
  points: (p) => [
    { x: p[0], y: tangentF(p[0]), label: 'A' },
    { x: p[0] + p[1], y: tangentF(p[0] + p[1]), label: 'B' },
  ],
  segments: (p) => {
    const x0 = p[0]
    const x1 = p[0] + p[1]
    const slope = tangentDF(x0)
    const secantSlope = (tangentF(x1) - tangentF(x0)) / (x1 - x0)
    return [
      {
        x1: x0 - 3,
        y1: tangentF(x0) - 3 * slope,
        x2: x0 + 3,
        y2: tangentF(x0) + 3 * slope,
        label: 'raaklijn',
      },
      {
        x1: x0 - 1,
        y1: tangentF(x0) - secantSlope,
        x2: x1 + 1,
        y2: tangentF(x1) + secantSlope,
        label: 'lijn AB',
      },
    ]
  },
  info: (p) => {
    const x0 = p[0]
    const x1 = p[0] + p[1]
    const dq = (tangentF(x1) - tangentF(x0)) / (x1 - x0)
    return `$\\frac{\\Delta y}{\\Delta x} \\approx ${number(dq)}$, helling raaklijn $f'(${number(x0, 1)}) \\approx ${number(tangentDF(x0))}$. Maak $\\Delta x$ klein: het differentiequotiënt nadert de helling.`
  },
}

const slopeGraph: FunctionGraph = {
  title: 'Grafiek en hellinggrafiek',
  parameters: [{ name: '$x$', min: -4, max: 4, step: 0.1, initial: -1 }],
  xDomain: [-5, 5],
  yDomain: [-6, 10],
  curves: [
    { name: 'f', f: (x) => tangentF(x) },
    { name: 'f′ (helling)', f: (x) => tangentDF(x) },
  ],
  latex: () => "f(x) = 0,1x^3 - x + 2 \\qquad f'(x) = 0,3x^2 - 1",
  points: (p) => [
    { x: p[0], y: tangentF(p[0]), label: 'f' },
    { x: p[0], y: tangentDF(p[0]), label: 'f′' },
  ],
  info: (p) => {
    const d = tangentDF(p[0])
    const behaviour =
      Math.abs(d) < 0.05 ? 'horizontaal: mogelijk een top' : d > 0 ? 'stijgend' : 'dalend'
    return `Bij $x = ${number(p[0], 1)}$ is de helling $${number(d)}$: de grafiek is ${behaviour}. Top van $f$ ↔ nulpunt van $f'$.`
  },
}

const logScale: FunctionGraph = {
  title: 'Logaritmische schaalverdeling',
  parameters: [
    { name: 'beginwaarde $b$', min: 1, max: 20, step: 1, initial: 5 },
    { name: 'groeifactor $g$', min: 1.1, max: 3, step: 0.1, initial: 2 },
  ],
  xDomain: [0, 10],
  yDomain: [1, 100000],
  curves: [{ name: 'f', f: (x, p) => p[0] * Math.pow(p[1], x) }],
  latex: (p) => `y = ${number(p[0])} \\cdot ${number(p[1])}^x`,
  info: () =>
    'Op een logaritmische $y$-as wordt exponentiële groei een rechte lijn. Elke streep is een factor $10$ groter.',
  logarithmicY: true,
}

const functionGraphs: Record<string, FunctionGraph> = {
  lineair: linear,
  kwadratisch: quadratic,
  macht: power,
  exponentieel: exponential,
  logaritme: logarithm,
  sinus: sine,
  transformaties: transformations,
  'omgekeerd-evenredig': inverseProportional,
  raaklijn: tangent,
  hellinggrafiek: slopeGraph,
  logschaal: logScale,
}

const specialGraphs: Record<string, GraphDefinition> = {
  toenamediagram: { kind: 'increaseDiagram' },
  'rij-recursief': { kind: 'recursiveSequence' },
  normaal: { kind: 'normal' },
  binomiaal: { kind: 'binomial' },
}

export function definition(id: string): GraphDefinition | null {
  const graph = functionGraphs[id]
  if (graph) return { kind: 'function', graph }
  return specialGraphs[id] ?? null
}

/** Must stay in sync with GraphLibrary.allIDs in Swift and GRAPH_IDS in tools/content/build.py. */
export const allIds = [
  'lineair',
  'kwadratisch',
  'macht',
  'exponentieel',
  'logaritme',
  'sinus',
  'transformaties',
  'omgekeerd-evenredig',
  'raaklijn',
  'hellinggrafiek',
  'logschaal',
  'toenamediagram',
  'rij-recursief',
  'normaal',
  'binomiaal',
]
