/** Ports Spiekbrief/Persistence/Favorite.swift. SwiftData becomes localStorage. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteKind = 'topic' | 'formula'

export interface Favorite {
  itemId: string
  kind: FavoriteKind
  createdAt: number
  /** User-reorderable; lower comes first. */
  order: number
}

interface FavoritesState {
  favorites: Favorite[]
  isFavorite: (itemId: string) => boolean
  toggle: (itemId: string, kind: FavoriteKind) => void
  remove: (itemId: string) => void
  move: (itemId: string, direction: -1 | 1) => void
  reorder: (itemIds: string[]) => void
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (itemId) => get().favorites.some((f) => f.itemId === itemId),

      toggle: (itemId, kind) =>
        set((state) => {
          const existing = state.favorites.find((f) => f.itemId === itemId)
          if (existing) {
            return { favorites: state.favorites.filter((f) => f.itemId !== itemId) }
          }
          const order = state.favorites.reduce((max, f) => Math.max(max, f.order), -1) + 1
          return {
            favorites: [...state.favorites, { itemId, kind, createdAt: Date.now(), order }],
          }
        }),

      remove: (itemId) =>
        set((state) => ({ favorites: state.favorites.filter((f) => f.itemId !== itemId) })),

      move: (itemId, direction) =>
        set((state) => {
          const sorted = sortFavorites(state.favorites)
          const index = sorted.findIndex((f) => f.itemId === itemId)
          const target = index + direction
          if (index < 0 || target < 0 || target >= sorted.length) return state
          const next = [...sorted]
          ;[next[index], next[target]] = [next[target], next[index]]
          return { favorites: next.map((f, i) => ({ ...f, order: i })) }
        }),

      reorder: (itemIds) =>
        set((state) => ({
          favorites: state.favorites.map((f) => {
            const order = itemIds.indexOf(f.itemId)
            return order < 0 ? f : { ...f, order }
          }),
        })),
    }),
    { name: 'spiekbrief.favorites.v1' },
  ),
)

export function sortFavorites(favorites: Favorite[]): Favorite[] {
  return [...favorites].sort((a, b) => (a.order !== b.order ? a.order - b.order : a.createdAt - b.createdAt))
}
