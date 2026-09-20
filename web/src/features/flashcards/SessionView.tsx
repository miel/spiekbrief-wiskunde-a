/** Ports Spiekbrief/Features/Flashcards/FlashcardSessionView.swift: a flip card per formula. */
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Check, RotateCcw, X } from 'lucide-react'
import { flashcards, topicOfFormula } from '../../content/store'
import { FormulaMath } from '../../math/Formula'
import { RichText } from '../../math/RichText'
import { useProgress } from '../../persistence/progress'
import { clearSession, sessionCardIds } from './session'
import styles from './SessionView.module.css'

export function SessionView() {
  const navigate = useNavigate()
  const record = useProgress((s) => s.answer)

  const cards = useMemo(() => {
    const ids = sessionCardIds()
    const byId = new Map(flashcards.map((c) => [c.id, c]))
    return ids.map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c))
  }, [])

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)

  if (cards.length === 0) return <Navigate to="/oefenen" replace />

  const finished = index >= cards.length

  const answer = (wasKnown: boolean) => {
    record(cards[index].id, wasKnown)
    if (wasKnown) setKnown((k) => k + 1)
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  const close = () => {
    clearSession()
    navigate('/oefenen')
  }

  if (finished) {
    return (
      <div className={styles.session}>
        <div className={styles.done}>
          <h1 className={styles.doneTitle}>Klaar</h1>
          <p className={styles.doneCount}>
            {known} van {cards.length} gewist
          </p>
          <button type="button" className={styles.primary} onClick={close}>
            Terug naar oefenen
          </button>
        </div>
      </div>
    )
  }

  const card = cards[index]
  const topicId = topicOfFormula.get(card.id)

  return (
    <div className={styles.session}>
      <header className={styles.header}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${(index / cards.length) * 100}%` }}
          />
        </div>
        <span className={styles.counter}>
          {index + 1} / {cards.length}
        </span>
        <button type="button" onClick={close} aria-label="Stop met oefenen" className={styles.close}>
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.cardArea}>
        <button
          type="button"
          className={flipped ? `${styles.card} ${styles.flipped}` : styles.card}
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Toon de vraag' : 'Draai de kaart om'}
        >
          <span className={styles.face}>
            <RichText as="span" className={styles.question} text={card.question} />
            <span className={styles.hint}>Tik om te draaien</span>
          </span>
          <span className={`${styles.face} ${styles.back}`}>
            <FormulaMath latex={card.formula.latex} spoken={card.formula.spoken} />
            {card.formula.caption && (
              <RichText as="span" className={styles.caption} text={card.formula.caption} />
            )}
            {card.formula.condition && (
              <RichText as="span" className={styles.condition} text={card.formula.condition} />
            )}
          </span>
        </button>
      </div>

      <footer className={styles.footer}>
        <div className={styles.answers}>
          <button
            type="button"
            className={`${styles.answer} ${styles.no}`}
            disabled={!flipped}
            onClick={() => answer(false)}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Nog niet
          </button>
          <button
            type="button"
            className={`${styles.answer} ${styles.yes}`}
            disabled={!flipped}
            onClick={() => answer(true)}
          >
            <Check size={18} aria-hidden="true" />
            Wist ik
          </button>
        </div>
        {topicId && (
          <Link to={`/onderwerp/${topicId}#${card.id}`} className={styles.context}>
            Bekijk in de spiekbrief
          </Link>
        )}
      </footer>
    </div>
  )
}
