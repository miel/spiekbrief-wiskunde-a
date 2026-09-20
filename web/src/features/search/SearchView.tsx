/** Ports Spiekbrief/Features/Search/SearchView.swift: results grouped by domain. */
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import { search, suggestions, type SearchEntry } from '../../content/search'
import { domainById, topicOfFormula } from '../../content/store'
import { Page } from '../../app/Page'
import { domainTint } from '../../app/theme'
import { RichText } from '../../math/RichText'
import styles from './SearchView.module.css'

export function SearchView() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''

  const results = useMemo(() => search(query), [query])
  const grouped = useMemo(() => groupByDomain(results), [results])

  const setQuery = (next: string) => {
    if (next) setParams({ q: next }, { replace: true })
    else setParams({}, { replace: true })
  }

  return (
    <Page title="Zoeken">
      <div className={styles.field}>
        <SearchIcon size={18} aria-hidden="true" className={styles.fieldIcon} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Formule of onderwerp"
          aria-label="Zoek een formule of onderwerp"
          autoComplete="off"
          autoFocus
          className={styles.input}
        />
        {query && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setQuery('')}
            aria-label="Wis zoekopdracht"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {!query && (
        <div className={styles.suggestions}>
          <p className="section-title">Probeer eens</p>
          <div className={styles.chips}>
            {suggestions.map((s) => (
              <button key={s} type="button" className={styles.chip} onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <p className={styles.empty}>Niets gevonden voor “{query}”.</p>
      )}

      <div aria-live="polite" className="visually-hidden">
        {query && `${results.length} resultaten`}
      </div>

      {grouped.map(([domainId, entries]) => {
        const domain = domainById(domainId)
        return (
          <section
            key={domainId}
            className={styles.group}
            style={{ '--tint': domain ? domainTint(domain) : 'var(--accent)' } as React.CSSProperties}
          >
            <h2 className="section-title">
              {domain ? `${domain.code} · ${domain.title}` : domainId}
            </h2>
            <ul className={styles.results}>
              {entries.map((entry) => (
                <li key={`${entry.kind}-${entry.id}`}>
                  <Link to={linkFor(entry)} className={styles.result}>
                    <RichText as="span" className={styles.resultTitle} text={entry.title} />
                    <span className={styles.resultSubtitle}>{entry.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </Page>
  )
}

function linkFor(entry: SearchEntry): string {
  if (entry.kind === 'topic') return `/onderwerp/${entry.topicId}`
  const topicId = topicOfFormula.get(entry.id) ?? entry.topicId
  return `/onderwerp/${topicId}#${entry.id}`
}

function groupByDomain(entries: SearchEntry[]): [string, SearchEntry[]][] {
  const groups = new Map<string, SearchEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.domainId)
    if (list) list.push(entry)
    else groups.set(entry.domainId, [entry])
  }
  return [...groups.entries()]
}
