/**
 * Ports Spiekbrief/Content/SearchIndex.swift.
 *
 * A few hundred entries, so a linear scan over pre-normalized strings is fast enough and
 * needs no index structure.
 */
import { domains } from './store'
import { topicFormulas } from './types'

export interface SearchEntry {
  kind: 'topic' | 'formula'
  id: string
  topicId: string
  domainId: string
  title: string
  subtitle: string
  /** Normalized text that queries are matched against. */
  haystack: string
  /** Normalized title, so title hits rank first. */
  normalizedTitle: string
}

/** Dutch synonyms and common abbreviations, keyed by normalized term. */
export const synonyms: Record<string, string[]> = {
  afgeleide: ['differentieren', 'hellingfunctie'],
  differentieren: ['afgeleide'],
  rc: ['richtingscoefficient', 'helling'],
  richtingscoefficient: ['rc', 'helling'],
  log: ['logaritme'],
  logaritme: ['log', 'ln'],
  ln: ['natuurlijke logaritme'],
  exponentieel: ['groeifactor', 'groei'],
  groei: ['exponentieel', 'groeifactor'],
  kans: ['kansrekenen', 'verdeling'],
  binomiaal: ['binomiale verdeling'],
  normaal: ['normale verdeling'],
  som: ['somrij', 'sigma'],
  sigma: ['som', 'somrij', 'standaardafwijking'],
  gr: ['numworks', 'rekenmachine'],
  rekenmachine: ['numworks'],
  top: ['maximum', 'minimum', 'extreme waarde'],
  max: ['maximum'],
  min: ['minimum'],
  sinus: ['sin', 'periode', 'amplitude'],
  procent: ['percentage', 'groeipercentage'],
  faculteit: ['permutaties'],
  combinatie: ['combinaties', 'n boven k'],
  betrouwbaarheidsinterval: ['bi'],
  bi: ['betrouwbaarheidsinterval'],
}

/** Lowercases and strips diacritics, so "differentieren" matches "differentiëren". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function buildEntries(): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const domain of domains) {
    for (const topic of domain.topics) {
      const keywords = (topic.keywords ?? []).join(' ')
      const topicText = [topic.title, topic.summary, keywords, domain.title].join(' ')
      entries.push({
        kind: 'topic',
        id: topic.id,
        topicId: topic.id,
        domainId: domain.id,
        title: topic.title,
        subtitle: `${domain.code} · ${domain.title}`,
        haystack: normalize(topicText),
        normalizedTitle: normalize(topic.title),
      })
      for (const formula of topicFormulas(topic)) {
        const title = formula.caption ?? formula.question ?? topic.title
        const text = [title, formula.spoken, formula.question ?? '', topic.title, keywords].join(' ')
        entries.push({
          kind: 'formula',
          id: formula.id,
          topicId: topic.id,
          domainId: domain.id,
          title,
          subtitle: topic.title,
          haystack: normalize(text),
          normalizedTitle: normalize(title),
        })
      }
    }
  }
  return entries
}

export const entries: SearchEntry[] = buildEntries()

/** Entries where every query word (or one of its synonyms) occurs. Title matches rank first. */
export function search(query: string, limit = 60): SearchEntry[] {
  const words = normalize(query)
    .split(/[\s,]+/)
    .filter(Boolean)
  if (words.length === 0) return []
  const alternatives = words.map((w) => [w, ...(synonyms[w] ?? [])])

  const scored: { entry: SearchEntry; score: number }[] = []
  for (const entry of entries) {
    const matchesAll = alternatives.every((alts) => alts.some((a) => entry.haystack.includes(a)))
    if (!matchesAll) continue
    let score = 0
    for (const word of words) if (entry.normalizedTitle.includes(word)) score += 10
    if (entry.normalizedTitle.startsWith(words[0])) score += 5
    if (entry.kind === 'topic') score += 2
    scored.push({ entry, score })
  }

  scored.sort((a, b) =>
    a.score !== b.score ? b.score - a.score : a.entry.title.localeCompare(b.entry.title, 'nl'),
  )
  return scored.slice(0, limit).map((s) => s.entry)
}

/** Shown when the search field is empty. */
export const suggestions = [
  'afgeleide',
  'halveringstijd',
  'logaritme',
  'kettingregel',
  'combinaties',
  'somrij',
  'normale verdeling',
  'raaklijn',
]
