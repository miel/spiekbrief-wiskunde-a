/** Ports SpiekbriefTests/ContentTests.swift. */
import { describe, expect, it } from 'vitest'
import {
  domains,
  flashcards,
  formulasById,
  topicsById,
  topicOfFormula,
} from '../src/content/store'
import { topicFormulas } from '../src/content/types'
import { allIds, definition } from '../src/graphs/library'
import { allBlocks, allTopics } from './helpers'

describe('inhoud', () => {
  it('alle vijf de bestanden laden en zijn niet leeg', () => {
    expect(domains).toHaveLength(5)
    for (const domain of domains) {
      expect(domain.topics.length, domain.id).toBeGreaterThan(0)
      for (const topic of domain.topics) {
        expect(topic.blocks.length, topic.id).toBeGreaterThan(0)
      }
    }
  })

  it('onderwerp-ids zijn uniek', () => {
    const ids = allTopics().map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('formule-ids zijn uniek', () => {
    const ids = allTopics().flatMap((t) => topicFormulas(t).map((f) => f.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('elke formule heeft een uitgesproken tekst', () => {
    for (const [id, formula] of formulasById) {
      expect(formula.spoken.trim(), id).not.toBe('')
    }
  })

  it('elk id is op te zoeken — daar leunen de favorieten op', () => {
    for (const topic of allTopics()) {
      expect(topicsById.get(topic.id), topic.id).toBeDefined()
      for (const formula of topicFormulas(topic)) {
        expect(formulasById.get(formula.id), formula.id).toBeDefined()
        expect(topicOfFormula.get(formula.id), formula.id).toBe(topic.id)
      }
    }
  })

  it('elke grafiek in de inhoud bestaat in de grafiekenbibliotheek', () => {
    const referenced = allBlocks()
      .filter((b) => b.type === 'graph')
      .map((b) => (b as { graph: string }).graph)
    expect(referenced.length).toBeGreaterThan(0)
    for (const id of referenced) {
      expect(definition(id), `grafiek ${id} ontbreekt`).not.toBeNull()
    }
  })

  it('allIds komt overeen met wat definition kent', () => {
    for (const id of allIds) expect(definition(id), id).not.toBeNull()
    expect(definition('bestaat-niet')).toBeNull()
  })

  it('domein E is alleen schoolexamen en heeft alleen se-badges', () => {
    const e = domains.find((d) => d.id === 'E')!
    expect(e.schoolExamOnly).toBe(true)
    for (const topic of e.topics) {
      for (const formula of topicFormulas(topic)) {
        expect(formula.badge, formula.id).toBe('se')
      }
    }
  })

  it('tips-formulelijst heeft precies negen formules', () => {
    // 5 differentieerregels + 4 logaritmeregels uit bijlage 5.
    const topic = topicsById.get('tips-formulelijst')!
    expect(topic).toBeDefined()
    expect(topicFormulas(topic)).toHaveLength(9)
  })

  it('flashcards komen nooit van formules die op de formulelijst staan', () => {
    for (const card of flashcards) {
      expect(card.formula.badge, card.id).not.toBe('formulelijst')
    }
  })

  it('elke flashcard heeft een vraag en verwijst naar een bestaand onderwerp', () => {
    expect(flashcards.length).toBeGreaterThan(0)
    for (const card of flashcards) {
      expect(card.question.trim(), card.id).not.toBe('')
      expect(topicsById.get(card.topicId), card.id).toBeDefined()
    }
  })
})
