/**
 * The set of graph ids is written out by hand in three places: GraphLibrary.allIDs (Swift),
 * GRAPH_IDS (tools/content/build.py) and allIds (src/graphs/library.ts). Nothing but this
 * test makes them agree, and a mismatch means one app renders a graph the other cannot.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allIds } from '../src/graphs/library'

// vitest runs with web/ as the working directory; the Swift app is its parent.
const repoRoot = resolve(process.cwd(), '..')

function idsInBlock(source: string, start: RegExp): string[] {
  const match = start.exec(source)
  if (!match) throw new Error('kon het blok met grafiek-ids niet vinden')
  const rest = source.slice(match.index + match[0].length)
  const end = rest.search(/[}\]]/)
  return [...rest.slice(0, end).matchAll(/"([a-z-]+)"/g)].map((m) => m[1])
}

describe('grafiek-ids blijven gelijk in alle drie de kopieën', () => {
  it('komt overeen met GRAPH_IDS in tools/content/build.py', () => {
    const source = readFileSync(resolve(repoRoot, 'tools/content/build.py'), 'utf8')
    const python = idsInBlock(source, /GRAPH_IDS = \{/)
    expect(new Set(python)).toEqual(new Set(allIds))
  })

  it('komt overeen met GraphLibrary.allIDs in Swift', () => {
    const source = readFileSync(resolve(repoRoot, 'Spiekbrief/Graphs/GraphLibrary.swift'), 'utf8')
    const swift = idsInBlock(source, /static let allIDs = \[/)
    expect(new Set(swift)).toEqual(new Set(allIds))
  })
})
