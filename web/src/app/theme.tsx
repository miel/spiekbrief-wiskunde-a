/**
 * SF Symbols have no web equivalent, so the symbol names in the content JSON are mapped to
 * Lucide icons here. Domain tints mirror `Domain.tint` in BrowseView.swift and badge colours
 * mirror BadgeLabel.swift.
 */
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Divide,
  FileText,
  FunctionSquare,
  GraduationCap,
  Landmark,
  Lightbulb,
  Sigma,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { Badge, Domain } from '../content/types'

const symbols: Record<string, LucideIcon> = {
  'plus.forwardslash.minus': Divide,
  function: FunctionSquare,
  'chart.line.uptrend.xyaxis': TrendingUp,
  'chart.bar': BarChart3,
  graduationcap: GraduationCap,
  'doc.text': FileText,
  'brain.head.profile': Brain,
  'building.columns': Landmark,
  lightbulb: Lightbulb,
  'exclamationmark.triangle.fill': AlertTriangle,
}

export function iconFor(symbol: string): LucideIcon {
  return symbols[symbol] ?? Sigma
}

/** Domain.tint in BrowseView.swift: a system colour name from the JSON. */
export function domainTint(domain: Pick<Domain, 'color'>): string {
  const known = ['blue', 'green', 'orange', 'purple', 'teal', 'pink', 'indigo']
  return known.includes(domain.color) ? `var(--${domain.color})` : 'var(--accent)'
}

export const badgeIcon: Record<Badge, LucideIcon> = {
  formulelijst: FileText,
  paraat: Brain,
  se: Landmark,
  extra: Lightbulb,
}

export const badgeTint: Record<Badge, string> = {
  formulelijst: 'var(--green)',
  paraat: 'var(--orange)',
  se: 'var(--blue)',
  extra: 'var(--gray)',
}
