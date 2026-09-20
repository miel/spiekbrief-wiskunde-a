/** Shared page chrome: a large title like a SwiftUI navigation title, plus a content column. */
import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './Page.module.css'

export interface PageProps {
  title: string
  subtitle?: ReactNode
  /** Shows a back chevron, as a NavigationStack does on a pushed screen. */
  back?: boolean
  actions?: ReactNode
  children: ReactNode
}

export function Page({ title, subtitle, back, actions, children }: PageProps) {
  const navigate = useNavigate()
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {back && (
          <button type="button" className={styles.back} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} aria-hidden="true" />
            Terug
          </button>
        )}
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      {children}
    </div>
  )
}
