/**
 * Ports Spiekbrief/Persistence/CardProgress.swift — a Leitner box system.
 *
 * A card answered correctly moves up one box and is due again after that box's interval;
 * a wrong answer sends it straight back to box 1.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Days until a card in box n is due again. Box 1 is due immediately. */
export const INTERVALS = [0, 1, 3, 7, 14] as const
export const MAX_BOX = INTERVALS.length

export interface CardProgress {
  cardId: string
  /** 1…5 */
  box: number
  /** Epoch milliseconds. */
  due: number
  timesKnown: number
  timesMissed: number
}

export function newProgress(cardId: string): CardProgress {
  // Swift uses .distantPast, i.e. a brand new card is due right away.
  return { cardId, box: 1, due: 0, timesKnown: 0, timesMissed: 0 }
}

/**
 * Due dates are counted from the start of the day, as `Calendar.startOfDay` does in Swift:
 * a card answered at 23:00 into box 2 becomes due at midnight, not 24 hours later.
 */
function startOfDay(now: number): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dueDate(box: number, now: number): number {
  const d = new Date(startOfDay(now))
  d.setDate(d.getDate() + INTERVALS[box - 1])
  return d.getTime()
}

/** The pure state transition, so it can be tested without a store. */
export function answer(progress: CardProgress, known: boolean, now = Date.now()): CardProgress {
  const box = known ? Math.min(MAX_BOX, progress.box + 1) : 1
  return {
    ...progress,
    box,
    due: dueDate(box, now),
    timesKnown: progress.timesKnown + (known ? 1 : 0),
    timesMissed: progress.timesMissed + (known ? 0 : 1),
  }
}

export function isDue(progress: CardProgress | undefined, now = Date.now()): boolean {
  return progress === undefined || progress.due <= now
}

interface ProgressState {
  progress: Record<string, CardProgress>
  get: (cardId: string) => CardProgress | undefined
  answer: (cardId: string, known: boolean) => void
  reset: () => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      get: (cardId) => get().progress[cardId],

      answer: (cardId, known) =>
        set((state) => {
          const current = state.progress[cardId] ?? newProgress(cardId)
          return { progress: { ...state.progress, [cardId]: answer(current, known) } }
        }),

      reset: () => set({ progress: {} }),
    }),
    { name: 'spiekbrief.progress.v1' },
  ),
)

/** How many cards sit in each box, for the 5-bar histogram on the practice screen. */
export function boxCounts(
  cardIds: string[],
  progress: Record<string, CardProgress>,
): number[] {
  const counts = new Array(MAX_BOX).fill(0)
  for (const id of cardIds) {
    const box = progress[id]?.box ?? 1
    counts[box - 1] += 1
  }
  return counts
}
