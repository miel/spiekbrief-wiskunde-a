/**
 * Ports SpiekbriefTests/FormulaLintTests.swift.
 *
 * Typesets every display formula and every inline `$…$` segment in every text-bearing field,
 * with throwOnError, so a LaTeX typo fails the test run exactly as it does on iOS.
 */
import { describe, expect, it } from 'vitest'
import { renderToString } from '../src/math/katex'
import { allFormulas, allStepLatex, allTextFields, inlineMathSegments } from './helpers'

function typeset(latex: string, displayMode: boolean) {
  return renderToString(latex, { displayMode, throwOnError: true })
}

describe('LaTeX lint', () => {
  it('typeset elke formule op de spiekbrief', () => {
    const failures: string[] = []
    for (const { where, formula } of allFormulas()) {
      try {
        typeset(formula.latex, true)
      } catch (error) {
        failures.push(`${where}: ${(error as Error).message}`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('typeset elke latex-stap in een voorbeeld', () => {
    const failures: string[] = []
    for (const { where, text } of allStepLatex()) {
      try {
        typeset(text, true)
      } catch (error) {
        failures.push(`${where}: ${(error as Error).message}`)
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('typeset elk stuk inline wiskunde in elke tekst', () => {
    const failures: string[] = []
    for (const { where, text } of allTextFields()) {
      for (const segment of inlineMathSegments(text)) {
        try {
          typeset(segment, false)
        } catch (error) {
          failures.push(`${where}: $${segment}$ — ${(error as Error).message}`)
        }
      }
    }
    expect(failures, failures.join('\n')).toEqual([])
  })

  it('elke tekst heeft een even aantal dollartekens', () => {
    const unbalanced = allTextFields()
      .filter(({ text }) => (text.split('$').length - 1) % 2 !== 0)
      .map(({ where }) => where)
    expect(unbalanced, unbalanced.join('\n')).toEqual([])
  })
})
