/**
 * The pieces of Foundation's C math that JavaScript does not have.
 *
 * Swift's NormalDistributionView uses `erfc` and BinomialDistributionView uses `lgamma`;
 * both are reimplemented here so the distributions match the native app.
 */

/** Lanczos approximation (g = 7), accurate to about 1e-15 for x > 0. */
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
]

export function lgamma(x: number): number {
  if (x < 0.5) {
    // Reflection formula, so the approximation is only ever used for x >= 0.5.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
  }
  const z = x - 1
  let a = LANCZOS[0]
  const t = z + 7.5
  for (let i = 1; i < LANCZOS.length; i++) a += LANCZOS[i] / (z + i)
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a)
}

/**
 * Complementary error function, Numerical Recipes' Chebyshev fit.
 * Fractional error below 1.2e-7 everywhere, far more than three decimals of probability need.
 */
export function erfc(x: number): number {
  const z = Math.abs(x)
  const t = 2 / (2 + z)
  const ty = 4 * t - 2
  const coefficients = [
    -1.3026537197817094, 0.6419697923564902, 0.019476473204185836, -0.00956151478680863,
    -0.000946595344482036, 0.000366839497852761, 4.2523324806907e-5, -2.0278578112534e-5,
    -1.624290004647e-6, 1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9,
    5.059343495e-9, -9.91364156e-10, -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
    -6.886027e-12, 8.94487e-13, 3.13092e-13, -1.12708e-13, 3.81e-16, 7.106e-15,
  ]
  let d = 0
  let dd = 0
  for (let j = coefficients.length - 1; j > 0; j--) {
    const tmp = d
    d = ty * d - dd + coefficients[j]
    dd = tmp
  }
  const result = t * Math.exp(-z * z + 0.5 * (coefficients[0] + ty * d) - dd)
  return x >= 0 ? result : 2 - result
}

/** Density of the normal distribution. */
export function normalDensity(x: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI))
}

/** Cumulative distribution of the normal distribution. */
export function normalCdf(x: number, mu: number, sigma: number): number {
  return 0.5 * erfc(-(x - mu) / (sigma * Math.SQRT2))
}

/** Binomial probability mass function, computed in logs so large n does not overflow. */
export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0
  if (p === 0) return k === 0 ? 1 : 0
  if (p === 1) return k === n ? 1 : 0
  const logChoose = lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1)
  return Math.exp(logChoose + k * Math.log(p) + (n - k) * Math.log(1 - p))
}

/** The logistic curve behind the toenamediagram. */
export function logistic(x: number): number {
  return 20 / (1 + 9 * Math.exp(-x))
}
