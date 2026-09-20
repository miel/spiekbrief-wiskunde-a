/** Ports Spiekbrief/Features/Browse/BrowseView.swift: domains, each with its topics. */
import { Link } from 'react-router-dom'
import { ChevronRight, Star } from 'lucide-react'
import { domains } from '../../content/store'
import { topicFormulas } from '../../content/types'
import { Page } from '../../app/Page'
import { domainTint, iconFor } from '../../app/theme'
import { RichText } from '../../math/RichText'
import { useFavorites } from '../../persistence/favorites'
import styles from './BrowseView.module.css'

export function BrowseView() {
  return (
    <Page title="Spiekbrief" subtitle="Wiskunde A · vwo · centraal examen 2027">
      <div className={styles.domains}>
        {domains.map((domain) => {
          const Icon = iconFor(domain.symbol)
          return (
            <section
              key={domain.id}
              className={styles.domain}
              style={{ '--tint': domainTint(domain) } as React.CSSProperties}
            >
              <header className={styles.domainHeader}>
                <span className={styles.domainIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h2 className={styles.domainTitle}>
                  {domain.code === domain.title ? domain.title : `${domain.code} · ${domain.title}`}
                </h2>
                {domain.schoolExamOnly && <span className={styles.seTag}>alleen SE</span>}
              </header>
              <ul className={styles.topics}>
                {domain.topics.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    id={topic.id}
                    title={topic.title}
                    summary={topic.summary}
                    syllabusRef={topic.syllabusRef}
                    formulaCount={topicFormulas(topic).length}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </Page>
  )
}

function TopicRow({
  id,
  title,
  summary,
  syllabusRef,
  formulaCount,
}: {
  id: string
  title: string
  summary: string
  syllabusRef: string
  formulaCount: number
}) {
  const isFavorite = useFavorites((s) => s.favorites.some((f) => f.itemId === id))
  const toggle = useFavorites((s) => s.toggle)

  return (
    <li className={styles.topicRow}>
      <Link to={`/onderwerp/${id}`} className={styles.topicLink}>
        <span className={styles.topicText}>
          <span className={styles.topicTitle}>{title}</span>
          <RichText as="span" className={styles.topicSummary} text={summary} />
          <span className={styles.topicMeta}>
            {syllabusRef} · {formulaCount} {formulaCount === 1 ? 'formule' : 'formules'}
          </span>
        </span>
        <ChevronRight size={18} aria-hidden="true" className={styles.chevron} />
      </Link>
      <button
        type="button"
        className={isFavorite ? `${styles.star} ${styles.starOn}` : styles.star}
        onClick={() => toggle(id, 'topic')}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `${title} uit favorieten` : `${title} bij favorieten`}
      >
        <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </li>
  )
}
