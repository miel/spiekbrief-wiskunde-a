/** Ports Spiekbrief/Features/Flashcards/FlashcardsHomeView.swift. */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { domains, flashcards } from '../../content/store'
import { Page } from '../../app/Page'
import { boxCounts, isDue, MAX_BOX, useProgress } from '../../persistence/progress'
import { startSession } from './session'
import styles from './PracticeView.module.css'

export function PracticeView() {
  const navigate = useNavigate()
  const progress = useProgress((s) => s.progress)
  const [domainFilter, setDomainFilter] = useState<string | null>(null)

  const cards = useMemo(
    () => flashcards.filter((c) => domainFilter === null || c.domainId === domainFilter),
    [domainFilter],
  )
  const due = useMemo(
    () => cards.filter((c) => isDue(progress[c.id])),
    [cards, progress],
  )

  const counts = boxCounts(
    cards.map((c) => c.id),
    progress,
  )
  const total = Math.max(cards.length, 1)

  const domainsWithCards = domains.filter((d) => flashcards.some((c) => c.domainId === d.id))

  const start = (selection: typeof cards) => {
    startSession(selection.map((c) => c.id))
    navigate('/oefenen/sessie')
  }

  return (
    <Page title="Oefenen">
      <section className={`card ${styles.panel}`}>
        <h2 className={styles.count}>
          {due.length} van {cards.length} kaarten te oefenen
        </h2>

        <div
          className={styles.boxes}
          role="img"
          aria-label={`Voortgang per bak: ${counts
            .map((c, i) => `bak ${i + 1}: ${c}`)
            .join(', ')}`}
        >
          {counts.map((count, index) => (
            <div key={index} className={styles.box}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max(4, (40 * count) / total)}px`,
                  opacity: 0.3 + 0.15 * index,
                }}
              />
              <span className={styles.boxCount}>{count}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={styles.start}
          disabled={due.length === 0}
          onClick={() => start(shuffle(due))}
        >
          <Play size={18} fill="currentColor" aria-hidden="true" />
          Start oefenen
        </button>

        {due.length === 0 && cards.length > 0 && (
          <button type="button" className={styles.again} onClick={() => start(shuffle(cards))}>
            Toch alles oefenen
          </button>
        )}

        <p className={styles.footnote}>
          Kaarten die je weet, komen pas na 1, 3, 7 of 14 dagen terug. Wat op de formulelijst
          staat, hoef je niet te leren.
        </p>
      </section>

      <section className={styles.filter}>
        <h2 className="section-title">Onderwerp</h2>
        <div className={styles.filterList}>
          <FilterRow
            label="Alles"
            count={flashcards.length}
            selected={domainFilter === null}
            onSelect={() => setDomainFilter(null)}
          />
          {domainsWithCards.map((domain) => (
            <FilterRow
              key={domain.id}
              label={`${domain.code} ${domain.title}`}
              count={flashcards.filter((c) => c.domainId === domain.id).length}
              selected={domainFilter === domain.id}
              onSelect={() => setDomainFilter(domain.id)}
            />
          ))}
        </div>
      </section>
    </Page>
  )
}

function FilterRow({
  label,
  count,
  selected,
  onSelect,
}: {
  label: string
  count: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={selected ? `${styles.filterRow} ${styles.filterOn}` : styles.filterRow}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span>{label}</span>
      <span className={styles.filterCount}>{count}</span>
    </button>
  )
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export { MAX_BOX }
