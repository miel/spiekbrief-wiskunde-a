/**
 * Ports Spiekbrief/Math/LatexSpeech.swift.
 *
 * Display formulas in the content carry a hand-written `spoken` text; this is only the
 * fallback for inline math, where a rough reading ("x tot de macht 2") beats silence.
 */

const words: [string, string][] = [
  ['\\cdot', ' keer '],
  ['\\times', ' keer '],
  ['\\Leftrightarrow', ' is gelijkwaardig aan '],
  ['\\Rightarrow', ' dus '],
  ['\\approx', ' is ongeveer '],
  ['\\neq', ' is niet gelijk aan '],
  ['\\leq', ' kleiner dan of gelijk aan '],
  ['\\geq', ' groter dan of gelijk aan '],
  ['\\pm', ' plus of min '],
  ['\\Delta', ' delta '],
  ['\\sum', ' som '],
  ['\\sigma', ' sigma '],
  ['\\mu', ' mu '],
  ['\\pi', ' pi '],
  ['\\infty', ' oneindig '],
  ['\\ln', ' ln '],
  ['\\log', ' log '],
  ['\\sin', ' sinus '],
  ['\\pct', ' procent '],
  ['\\%', ' procent '],
  ['\\bar', ' gemiddelde '],
  ['\\hat', ' dakje '],
  ["'", ' accent '],
  ['<', ' kleiner dan '],
  ['>', ' groter dan '],
  ['=', ' is '],
  ['+', ' plus '],
  ['-', ' min '],
  ['/', ' gedeeld door '],
]

/** Replaces `\name{arg}` with `transform(arg)`. Handles nested braces in the argument. */
export function replaceMacro(
  name: string,
  source: string,
  transform: (arg: string) => string,
): string {
  const token = '\\' + name + '{'
  let result = ''
  let rest = source
  for (;;) {
    const start = rest.indexOf(token)
    if (start < 0) break
    result += rest.slice(0, start)
    const group = readGroup(rest, start + token.length)
    if (!group) {
      // Unbalanced braces: leave the rest untouched so the parse error surfaces in the lint test.
      return result + rest
    }
    result += transform(group.content)
    rest = rest.slice(group.end)
  }
  return result + rest
}

/** Reads a brace group whose opening brace is just before `start`. */
function readGroup(s: string, start: number): { content: string; end: number } | null {
  let depth = 1
  for (let i = start; i < s.length; i++) {
    if (s[i] === '{') depth += 1
    else if (s[i] === '}') {
      depth -= 1
      if (depth === 0) return { content: s.slice(start, i), end: i + 1 }
    }
  }
  return null
}

/** `\frac{a}{b}` → "(a) gedeeld door (b)". */
function replaceFractions(latex: string): string {
  let s = latex
  for (const command of ['\\dfrac{', '\\frac{']) {
    for (;;) {
      const start = s.indexOf(command)
      if (start < 0) break
      const numerator = readGroup(s, start + command.length)
      if (!numerator || s[numerator.end] !== '{') return s
      const denominator = readGroup(s, numerator.end + 1)
      if (!denominator) return s
      s =
        s.slice(0, start) +
        ` (${numerator.content}) gedeeld door (${denominator.content}) ` +
        s.slice(denominator.end)
    }
  }
  return s
}

export function approximate(latex: string): string {
  let s = replaceMacro('glog', latex, (g) => ` ${g} log `)
  s = replaceMacro('sqrt', s, (a) => ` wortel ${a} `)
  s = replaceFractions(s)
  s = replaceMacro('text', s, (a) => a)
  s = s.split('^{-1}').join(' tot de macht min 1 ')
  s = s.split('^2').join(' kwadraat ')
  s = s.split('^').join(' tot de macht ')
  s = s.split('_').join(' ')
  for (const [command, word] of words) s = s.split(command).join(word)
  s = s.split('\\').join(' ')
  s = s.replace(/[{}]/g, '')
  return s.split(/\s+/).filter(Boolean).join(' ')
}
