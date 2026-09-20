/**
 * Ports Spiekbrief/Features/Topic/BadgeLabel.swift.
 *
 * Only the icon and the 16 %-opacity background carry the colour — the label text stays at
 * full foreground contrast, because system green and orange text on a light background falls
 * under 3:1. The Swift file records the same reasoning.
 */
import { badgeIcon, badgeTint } from './theme'
import { badgeLabel, type Badge as BadgeKind } from '../content/types'
import styles from './Badge.module.css'

export function Badge({ badge, compact = false }: { badge: BadgeKind; compact?: boolean }) {
  const Icon = badgeIcon[badge]
  return (
    <span
      className={compact ? `${styles.badge} ${styles.compact}` : styles.badge}
      style={{ '--tint': badgeTint[badge] } as React.CSSProperties}
    >
      <Icon size={compact ? 11 : 13} aria-hidden="true" className={styles.icon} />
      {badgeLabel[badge]}
    </span>
  )
}
