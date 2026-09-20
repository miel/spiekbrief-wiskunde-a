/**
 * Ports Spiekbrief/Features/Favorites/FavoritesView.swift.
 *
 * The iOS EditButton + drag-to-reorder idiom does not translate, so ordering is done with
 * up/down buttons, which also work by touch and by keyboard.
 */
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Star, Trash2 } from 'lucide-react'
import {
  domainOfTopic,
  formula as findFormula,
  topic as findTopic,
  topicOfFormula,
} from '../../content/store'
import { Page } from '../../app/Page'
import { domainTint } from '../../app/theme'
import { RichText } from '../../math/RichText'
import { sortFavorites, useFavorites, type Favorite } from '../../persistence/favorites'
import styles from './FavoritesView.module.css'

interface Row {
  favorite: Favorite
  title: string
  subtitle: string
  to: string
  tint: string
}

function buildRow(favorite: Favorite): Row | null {
  if (favorite.kind === 'topic') {
    const topic = findTopic(favorite.itemId)
    if (!topic) return null
    const domain = domainOfTopic.get(topic.id)
    return {
      favorite,
      title: topic.title,
      subtitle: domain ? `${domain.code} · ${domain.title}` : 'Onderwerp',
      to: `/onderwerp/${topic.id}`,
      tint: domain ? domainTint(domain) : 'var(--accent)',
    }
  }
  const formula = findFormula(favorite.itemId)
  const topicId = topicOfFormula.get(favorite.itemId)
  if (!formula || !topicId) return null
  const topic = findTopic(topicId)
  const domain = domainOfTopic.get(topicId)
  return {
    favorite,
    title: formula.caption ?? formula.question ?? formula.spoken,
    subtitle: topic ? topic.title : 'Formule',
    to: `/onderwerp/${topicId}#${formula.id}`,
    tint: domain ? domainTint(domain) : 'var(--accent)',
  }
}

export function FavoritesView() {
  const favorites = useFavorites((s) => s.favorites)
  const move = useFavorites((s) => s.move)
  const remove = useFavorites((s) => s.remove)

  // Favorites whose content id no longer exists are skipped rather than shown broken.
  const rows = sortFavorites(favorites)
    .map(buildRow)
    .filter((row): row is Row => row !== null)

  return (
    <Page
      title="Favorieten"
      subtitle={rows.length > 0 ? `${rows.length} bewaard` : undefined}
    >
      {rows.length === 0 ? (
        <div className={styles.empty}>
          <Star size={32} aria-hidden="true" />
          <p>
            Nog geen favorieten. Tik op de ster bij een onderwerp of formule om die hier te
            bewaren.
          </p>
          <Link to="/" className={styles.emptyLink}>
            Naar de spiekbrief
          </Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {rows.map((row, index) => (
            <li
              key={row.favorite.itemId}
              className={styles.row}
              style={{ '--tint': row.tint } as React.CSSProperties}
            >
              <Link to={row.to} className={styles.link}>
                <RichText as="span" className={styles.title} text={row.title} />
                <span className={styles.subtitle}>{row.subtitle}</span>
              </Link>
              <div className={styles.controls}>
                <button
                  type="button"
                  onClick={() => move(row.favorite.itemId, -1)}
                  disabled={index === 0}
                  aria-label="Naar boven"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(row.favorite.itemId, 1)}
                  disabled={index === rows.length - 1}
                  aria-label="Naar beneden"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.favorite.itemId)}
                  aria-label="Verwijder uit favorieten"
                  className={styles.remove}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
