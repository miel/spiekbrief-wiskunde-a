/** Ports SpiekbriefTests/UnitTests.swift. */
import { describe, expect, it } from 'vitest'
import { decimalCommas, preprocess, renderToString } from '../src/math/katex'
import { approximate, replaceMacro } from '../src/math/speech'
import { normalize, search, synonyms } from '../src/content/search'
import { answer, boxCounts, INTERVALS, isDue, MAX_BOX, newProgress } from '../src/persistence/progress'
import { coefficient, number, percent, signed } from '../src/graphs/format'
import { definition, tangentDF, tangentF } from '../src/graphs/library'
import { binomialPmf, lgamma, normalCdf } from '../src/graphs/special/mathfns'

describe('latex-voorbewerking', () => {
  it('\\glog wordt een linker-superscript', () => {
    const html = renderToString('\\glog{g}(a)', { throwOnError: true })
    expect(html).toContain('katex')
  })

  it('\\glog verwerkt geneste accolades', () => {
    expect(() =>
      renderToString('\\glog{\\frac{1}{2}}(x)', { throwOnError: true }),
    ).not.toThrow()
  })

  it('een komma tussen twee cijfers wordt een decimale komma', () => {
    expect(decimalCommas('3,5')).toBe('3,\\!5')
    expect(decimalCommas('0,25 + 1,5')).toBe('0,\\!25 + 1,\\!5')
  })

  it('een komma gevolgd door een spatie blijft staan, zoals in (2, 3)', () => {
    expect(decimalCommas('(2, 3)')).toBe('(2, 3)')
  })

  it('\\binom{n}{k} blijft ongemoeid', () => {
    expect(preprocess('\\binom{n}{k}')).toBe('\\binom{n}{k}')
  })

  it('\\pct wordt een procentteken', () => {
    expect(() => renderToString('12\\pct', { throwOnError: true })).not.toThrow()
  })

  it('macro-vervanging laat onbalans met rust zodat de lint-test hem ziet', () => {
    expect(replaceMacro('glog', '\\glog{g(a)', (g) => `[${g}]`)).toBe('\\glog{g(a)')
  })
})

describe('spraak', () => {
  it('breuken worden uitgesproken', () => {
    expect(approximate('\\frac{a}{b}')).toContain('gedeeld door')
  })

  it('machten worden uitgesproken', () => {
    expect(approximate('x^2')).toContain('kwadraat')
    expect(approximate('x^3')).toContain('tot de macht')
  })

  it('er blijven geen backslashes of accolades over', () => {
    for (const latex of ['\\frac{\\Delta y}{\\Delta x}', '\\glog{2}(8)', '\\sqrt{x} \\cdot 3']) {
      const spoken = approximate(latex)
      expect(spoken, latex).not.toContain('\\')
      expect(spoken, latex).not.toContain('{')
      expect(spoken, latex).not.toContain('}')
    }
  })
})

describe('zoeken', () => {
  it('negeert accenten', () => {
    expect(normalize('differentiëren')).toBe('differentieren')
    expect(search('differentieren').length).toBeGreaterThan(0)
  })

  it('kent het synoniem rc', () => {
    const results = search('rc')
    expect(results.length).toBeGreaterThan(0)
    expect(synonyms['rc']).toContain('richtingscoefficient')
  })

  it('kent het synoniem gr voor de rekenmachine', () => {
    expect(search('gr').length).toBeGreaterThan(0)
  })

  it('vindt bekende termen', () => {
    for (const term of [
      'afgeleide',
      'halveringstijd',
      'logaritme',
      'kettingregel',
      'combinaties',
      'somrij',
      'normale verdeling',
    ]) {
      expect(search(term).length, term).toBeGreaterThan(0)
    }
  })

  it('onzin en een lege vraag leveren niets op', () => {
    expect(search('qwertyuiop')).toHaveLength(0)
    expect(search('')).toHaveLength(0)
    expect(search('   ')).toHaveLength(0)
  })

  it('alle woorden moeten voorkomen (EN, niet OF)', () => {
    expect(search('logaritme qwertyuiop')).toHaveLength(0)
  })

  it('geeft nooit meer dan de limiet terug', () => {
    expect(search('e', 5).length).toBeLessThanOrEqual(5)
  })
})

describe('leitner-voortgang', () => {
  it('een nieuwe kaart is meteen aan de beurt', () => {
    expect(isDue(newProgress('x'))).toBe(true)
    expect(isDue(undefined)).toBe(true)
  })

  it('goed beantwoorden schuift een bak op', () => {
    let progress = newProgress('x')
    expect(progress.box).toBe(1)
    progress = answer(progress, true)
    expect(progress.box).toBe(2)
    expect(progress.timesKnown).toBe(1)
  })

  it('fout beantwoorden zet terug naar bak 1', () => {
    let progress = newProgress('x')
    for (let i = 0; i < 3; i++) progress = answer(progress, true)
    expect(progress.box).toBe(4)
    progress = answer(progress, false)
    expect(progress.box).toBe(1)
    expect(progress.timesMissed).toBe(1)
  })

  it('de bak loopt niet verder dan het maximum', () => {
    let progress = newProgress('x')
    for (let i = 0; i < 10; i++) progress = answer(progress, true)
    expect(progress.box).toBe(MAX_BOX)
  })

  it('de vervaldatum telt vanaf het begin van de dag', () => {
    // 23:00 lokale tijd: bak 2 is morgen om middernacht aan de beurt, niet over 24 uur.
    const late = new Date(2026, 8, 20, 23, 0, 0).getTime()
    const progress = answer(newProgress('x'), true, late)
    const due = new Date(progress.due)
    expect(due.getHours()).toBe(0)
    expect(due.getDate()).toBe(21)
  })

  it('de intervallen zijn 0, 1, 3, 7 en 14 dagen', () => {
    expect([...INTERVALS]).toEqual([0, 1, 3, 7, 14])
  })

  it('telt de kaarten per bak', () => {
    const progress = {
      a: { ...newProgress('a'), box: 1 },
      b: { ...newProgress('b'), box: 3 },
    }
    // c heeft nog geen voortgang en telt als bak 1.
    expect(boxCounts(['a', 'b', 'c'], progress)).toEqual([2, 0, 1, 0, 0])
  })
})

describe('grafieken', () => {
  it('de lineaire functie rekent goed', () => {
    const graph = definition('lineair')
    expect(graph?.kind).toBe('function')
    if (graph?.kind !== 'function') return
    expect(graph.graph.curves[0].f(3, [2, 1])).toBe(7)
  })

  it('de logaritme geeft NaN buiten het domein, niet oneindig', () => {
    const graph = definition('logaritme')
    if (graph?.kind !== 'function') throw new Error('geen functiegrafiek')
    expect(Number.isNaN(graph.graph.curves[0].f(0, [2]))).toBe(true)
    expect(Number.isNaN(graph.graph.curves[0].f(-1, [2]))).toBe(true)
    expect(graph.graph.curves[0].f(8, [2])).toBeCloseTo(3, 10)
  })

  it('de exponentiële functie legt groei en halvering uit', () => {
    const graph = definition('exponentieel')
    if (graph?.kind !== 'function') throw new Error('geen functiegrafiek')
    expect(graph.graph.info!([2, 1.5])).toContain('Groei')
    expect(graph.graph.info!([2, 0.5])).toContain('Halveringstijd')
    expect(graph.graph.info!([2, 1])).toContain('geen groei')
  })

  it('de raaklijnfunctie en haar afgeleide kloppen', () => {
    expect(tangentF(0)).toBeCloseTo(2, 10)
    expect(tangentDF(0)).toBeCloseTo(-1, 10)
    // numerieke afgeleide als controle
    const h = 1e-6
    expect((tangentF(1 + h) - tangentF(1 - h)) / (2 * h)).toBeCloseTo(tangentDF(1), 6)
  })

  it('de normale verdeling voldoet aan 68-95-99,7', () => {
    const within = (k: number) => normalCdf(k, 0, 1) - normalCdf(-k, 0, 1)
    expect(within(1)).toBeCloseTo(0.6827, 3)
    expect(within(2)).toBeCloseTo(0.9545, 3)
    expect(within(3)).toBeCloseTo(0.9973, 3)
  })

  it('lgamma komt overeen met bekende faculteiten', () => {
    expect(Math.exp(lgamma(5))).toBeCloseTo(24, 6)
    expect(Math.exp(lgamma(11))).toBeCloseTo(3628800, 2)
  })

  it('de binomiale kansfunctie geeft 10/32 en telt op tot 1', () => {
    expect(binomialPmf(2, 5, 0.5)).toBeCloseTo(10 / 32, 10)
    const total = Array.from({ length: 21 }, (_, k) => binomialPmf(k, 20, 0.3)).reduce(
      (a, b) => a + b,
      0,
    )
    expect(total).toBeCloseTo(1, 10)
  })

  it('getallen worden Nederlands opgemaakt', () => {
    expect(number(3.5)).toBe('3,5')
    expect(number(1000)).toBe('1000')
    expect(number(NaN)).toBe('–')
    expect(signed(3)).toBe(' + 3')
    expect(signed(-2.5)).toBe(' - 2,5')
    expect(signed(0)).toBe('')
    expect(coefficient(1)).toBe('')
    expect(coefficient(-1)).toBe('-')
    expect(coefficient(2.5)).toBe('2,5')
    expect(percent(0.125)).toBe('12,5\\pct')
  })
})
