import type { Club } from '../../utils/ClubsStorage'
import { readJsonStorage, writeJsonStorage } from './browserStorage'

const CLUBS_STORAGE_KEY = 'clubs'

export function readClubsCache(): Club[] {
  return readJsonStorage(CLUBS_STORAGE_KEY, [] as Club[])
}

export function writeClubsCache(clubs: Club[]) {
  writeJsonStorage(CLUBS_STORAGE_KEY, clubs)
}

export function upsertClubInCache(clubs: Club[], club: Club) {
  const exists = clubs.some(item => item.id === club.id)
  const next = exists
    ? clubs.map(item => (item.id === club.id ? club : item))
    : [...clubs, club]

  writeClubsCache(next)
  return next
}

export function removeClubFromCache(clubs: Club[], clubId: string) {
  const next = clubs.filter(item => item.id !== clubId)
  writeClubsCache(next)
  return next
}
