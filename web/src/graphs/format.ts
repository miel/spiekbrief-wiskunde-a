/** Ports GraphFormat in Spiekbrief/Graphs/GraphSpec.swift: Dutch decimal comma, no grouping. */

const formatters = new Map<number, Intl.NumberFormat>()

function formatter(digits: number): Intl.NumberFormat {
  let f = formatters.get(digits)
  if (!f) {
    f = new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
      useGrouping: false,
    })
    formatters.set(digits, f)
  }
  return f
}

export function number(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '–'
  const factor = Math.pow(10, digits)
  const rounded = Math.round(value * factor) / factor
  return formatter(digits).format(rounded)
}

/** A term with its sign for use after another term: "+ 3", "- 2,5". Returns "" for 0. */
export function signed(value: number, digits = 2, suffix = ''): string {
  const text = number(Math.abs(value), digits)
  if (text === '0') return ''
  return (value < 0 ? ' - ' : ' + ') + text + suffix
}

/** A coefficient in front of a variable: "" for 1, "-" for -1, else the number. */
export function coefficient(value: number, digits = 2): string {
  const text = number(value, digits)
  if (text === '1') return ''
  if (text === '-1') return '-'
  return text
}

export function percent(value: number, digits = 1): string {
  return number(value * 100, digits) + '\\pct'
}
