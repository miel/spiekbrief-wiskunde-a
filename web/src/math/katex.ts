/**
 * Ports Spiekbrief/Math/LatexPreprocessor.swift.
 *
 * Content authors use:
 * - `\glog{g}(a)` for the Dutch notation ᵍlog(a) with a left superscript, as in the syllabus.
 * - `3,5` for decimal numbers. A comma **directly between two digits** is a decimal comma and
 *   becomes `3,\!5`: TeX puts a thin space after punctuation, and `\!` cancels it.
 *   A comma followed by a space, as in the point (2, 3), is left alone.
 * - `\pct` for a percent sign (`%` starts a comment in TeX).
 *
 * `\glog` and `\pct` are KaTeX macros; the decimal comma still needs a string pass.
 */
import katex from 'katex'

export const macros: Record<string, string> = {
  '\\glog': '{}^{#1}\\!\\log',
  '\\pct': '\\%',
}

/** A comma directly between two ASCII digits is a decimal comma. */
export function decimalCommas(source: string): string {
  let out = ''
  for (let i = 0; i < source.length; i++) {
    const c = source[i]
    if (c === ',' && i > 0 && isAsciiDigit(source[i - 1]) && isAsciiDigit(source[i + 1] ?? '')) {
      out += ',\\!'
    } else {
      out += c
    }
  }
  return out
}

function isAsciiDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

export function preprocess(source: string): string {
  return decimalCommas(source)
}

export interface RenderOptions {
  displayMode?: boolean
  /** Tests render with throwOnError so a LaTeX typo fails the run, as the Swift lint does. */
  throwOnError?: boolean
}

/**
 * Typesets LaTeX to an HTML string. Synchronous by design: the iOS app shipped a bug
 * (commit d97fcba) where an asynchronous render left rows stuck on their placeholder, and
 * rendering during render is the structural fix on the web too.
 */
export function renderToString(latex: string, options: RenderOptions = {}): string {
  return katex.renderToString(preprocess(latex), {
    displayMode: options.displayMode ?? false,
    throwOnError: options.throwOnError ?? false,
    errorColor: '#cc0000',
    macros,
    strict: false,
    trust: false,
    output: 'html',
  })
}
