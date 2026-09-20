/**
 * Ports Spiekbrief/App/RootTabView.swift.
 *
 * The iPhone app is portrait-locked with a bottom tab bar. On the web the same four
 * destinations become a bottom tab bar on phones and a persistent sidebar from 900 px up,
 * since the browser cannot be told to stay narrow.
 */
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Info, Layers, LayoutList, Search, Star } from 'lucide-react'
import styles from './Shell.module.css'

const tabs = [
  { to: '/', label: 'Spiekbrief', icon: LayoutList, end: true },
  { to: '/zoeken', label: 'Zoeken', icon: Search, end: false },
  { to: '/favorieten', label: 'Favorieten', icon: Star, end: false },
  { to: '/oefenen', label: 'Oefenen', icon: Layers, end: false },
]

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.sidebar} aria-label="Hoofdnavigatie">
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Spiekbrief</span>
          <span className={styles.brandSub}>Wiskunde A · vwo</span>
        </div>
        <ul className={styles.sidebarList}>
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  isActive ? `${styles.sidebarLink} ${styles.active}` : styles.sidebarLink
                }
              >
                <tab.icon size={20} aria-hidden="true" />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink to="/over" className={styles.aboutLink}>
          <Info size={16} aria-hidden="true" />
          Over deze app
        </NavLink>
      </nav>

      <main className={styles.main} id="main">
        {children}
      </main>

      <nav className={styles.tabbar} aria-label="Hoofdnavigatie">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              isActive ? `${styles.tab} ${styles.active}` : styles.tab
            }
          >
            <tab.icon size={22} aria-hidden="true" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
