/**
 * The card ids of the session in progress. Kept in a module rather than in the URL so a
 * reload does not silently restart a half-finished session with a different shuffle.
 */
let cardIds: string[] = []

export function startSession(ids: string[]) {
  cardIds = ids
}

export function sessionCardIds(): string[] {
  return cardIds
}

export function clearSession() {
  cardIds = []
}
