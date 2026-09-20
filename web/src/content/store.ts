/**
 * Ports Spiekbrief/Content/ContentStore.swift.
 *
 * The five files are imported straight from the iOS app's resources, so both apps read the
 * same generated JSON. It is 82 KB in total, so everything is loaded eagerly and the lookup
 * tables are built once at module load — no lazy loading, no React context.
 */
import bAlgebraTellen from '@content/B_algebra_tellen.json'
import cVerbanden from '@content/C_verbanden.json'
import dVerandering from '@content/D_verandering.json'
import eStatistiek from '@content/E_statistiek.json'
import examentips from '@content/examentips.json'

import type { Domain, Flashcard, Formula, Topic } from './types'
import { topicFormulas } from './types'

/** File order is display order. */
export const domains: Domain[] = [
  bAlgebraTellen,
  cVerbanden,
  dVerandering,
  eStatistiek,
  examentips,
] as unknown as Domain[]

export const topicsById = new Map<string, Topic>()
export const formulasById = new Map<string, Formula>()
/** Which domain a topic belongs to, so a formula hit can show its domain. */
export const domainOfTopic = new Map<string, Domain>()
export const flashcards: Flashcard[] = []

for (const domain of domains) {
  for (const topic of domain.topics) {
    topicsById.set(topic.id, topic)
    domainOfTopic.set(topic.id, domain)
    for (const formula of topicFormulas(topic)) {
      formulasById.set(formula.id, formula)
      if (formula.question) {
        flashcards.push({
          id: formula.id,
          question: formula.question,
          formula,
          topicId: topic.id,
          domainId: domain.id,
        })
      }
    }
  }
}

export function topic(id: string): Topic | undefined {
  return topicsById.get(id)
}

export function formula(id: string): Formula | undefined {
  return formulasById.get(id)
}

export function domainById(id: string): Domain | undefined {
  return domains.find((d) => d.id === id)
}

/** The topic a formula lives in, used to deep-link a favorited formula back into context. */
export const topicOfFormula = new Map<string, string>()
for (const domain of domains) {
  for (const t of domain.topics) {
    for (const f of topicFormulas(t)) topicOfFormula.set(f.id, t.id)
  }
}
