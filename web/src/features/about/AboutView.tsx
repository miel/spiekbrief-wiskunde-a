/** Ports Spiekbrief/Features/About/AboutView.swift. */
import { Page } from '../../app/Page'
import { domains, flashcards, formulasById, topicsById } from '../../content/store'
import styles from './AboutView.module.css'

export function AboutView() {
  return (
    <Page title="Over deze app" back>
      <div className={styles.stack}>
        <section className={`card ${styles.section}`}>
          <p>
            Een spiekbrief voor het centraal examen <strong>wiskunde A vwo</strong> (2027,
            domeinen B, C en D), plus statistiek en kansrekening (domein E, schoolexamen).
          </p>
          <p className={styles.counts}>
            {domains.length} domeinen · {topicsById.size} onderwerpen · {formulasById.size}{' '}
            formules · {flashcards.length} flashcards
          </p>
        </section>

        <section className={`card ${styles.section}`}>
          <h2 className={styles.heading}>Bronnen</h2>
          <p>
            Alle inhoud komt uit het{' '}
            <a
              href="https://www.examenblad.nl/system/files/2014/examenprogramma_wiskunde_a_vwo.pdf"
              target="_blank"
              rel="noreferrer"
            >
              examenprogramma wiskunde A vwo
            </a>{' '}
            en de{' '}
            <a
              href="https://www.examenblad.nl/system/files/exam-document/2025-07/syllabus-wiskunde-a_vwo-2027_versie-2.pdf"
              target="_blank"
              rel="noreferrer"
            >
              syllabus centraal examen 2027 (versie 2)
            </a>{' '}
            van het CvTE, inclusief bijlage 2 (examenwerkwoorden), bijlage 4 (algebraïsche
            vaardigheden) en bijlage 5 (de formulelijst).
          </p>
        </section>

        <section className={`card ${styles.section}`}>
          <h2 className={styles.heading}>Rekenmachine</h2>
          <p>
            De tips zijn geschreven voor de <strong>NumWorks</strong> in de Nederlandse
            examenstand, waar Python en Elementen niet beschikbaar zijn en exacte resultaten
            uitstaan.
          </p>
        </section>

        <section className={`card ${styles.section}`}>
          <h2 className={styles.heading}>Privacy</h2>
          <p>
            Geen account, geen tracking, geen server. Je favorieten en je voortgang met de
            flashcards staan alleen in deze browser. De app werkt volledig offline zodra je
            hem één keer hebt geopend.
          </p>
        </section>

        <p className={styles.disclaimer}>
          Controleer belangrijke formules altijd in de officiële syllabus. Aan deze spiekbrief
          kun je geen rechten ontlenen.
        </p>
      </div>
    </Page>
  )
}
