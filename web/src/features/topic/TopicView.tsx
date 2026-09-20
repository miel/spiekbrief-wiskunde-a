/** Ports Spiekbrief/Features/Topic/TopicView.swift. */
import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { domainOfTopic, topic as findTopic } from '../../content/store'
import { Page } from '../../app/Page'
import { domainTint } from '../../app/theme'
import { RichText } from '../../math/RichText'
import { useFavorites } from '../../persistence/favorites'
import { BlockView } from './blocks'
import styles from './TopicView.module.css'

export function TopicView() {
  const { topicId } = useParams<{ topicId: string }>()
  const { hash } = useLocation()
  const topic = topicId ? findTopic(topicId) : undefined
  const domain = topicId ? domainOfTopic.get(topicId) : undefined

  const isFavorite = useFavorites((s) => s.favorites.some((f) => f.itemId === topicId))
  const toggle = useFavorites((s) => s.toggle)

  // A favorited formula deep-links back into its topic, scrolled to that formula.
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) {
      target.scrollIntoView({ block: 'center' })
      target.classList.add(styles.highlight)
      const timer = setTimeout(() => target.classList.remove(styles.highlight), 2000)
      return () => clearTimeout(timer)
    }
  }, [hash, topicId])

  useEffect(() => {
    if (topic) document.title = `${topic.title} · Spiekbrief`
    return () => {
      document.title = 'Spiekbrief Wiskunde A'
    }
  }, [topic])

  if (!topic || !topicId) return <Navigate to="/" replace />

  return (
    <div style={{ '--tint': domain ? domainTint(domain) : 'var(--accent)' } as React.CSSProperties}>
      <Page
        title={topic.title}
        back
        subtitle={<RichText as="span" text={topic.summary} />}
        actions={
          <button
            type="button"
            className={isFavorite ? `${styles.star} ${styles.starOn}` : styles.star}
            onClick={() => toggle(topicId, 'topic')}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Onderwerp uit favorieten' : 'Onderwerp bij favorieten'}
          >
            <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        }
      >
        <p className={styles.meta}>
          {domain && <span className={styles.domainTag}>{domain.code} · {domain.title}</span>}
          <span>Syllabus {topic.syllabusRef}</span>
        </p>

        <div className={styles.blocks}>
          {topic.blocks.map((block, index) => (
            <BlockView key={index} block={block} index={index} />
          ))}
        </div>
      </Page>
    </div>
  )
}
