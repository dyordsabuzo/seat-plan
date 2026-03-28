import { Regatta } from '../../types/RegattaType'
import type { Club } from '../../utils/ClubsStorage'
import * as ClubsStorage from '../../utils/ClubsStorage'
import * as RegattasStorage from '../../utils/RegattasStorage'

export function fetchClubsForUser(uid: string) {
  return ClubsStorage.loadClubs(uid)
}

export function persistClub(uid: string, club: Club) {
  return ClubsStorage.upsertClub(uid, club)
}

export function removeClub(uid: string, clubId: string) {
  return ClubsStorage.deleteClub(uid, clubId)
}

export function watchClubsForUser(uid: string, onChange: (clubs: Club[]) => void) {
  return ClubsStorage.subscribeClubs(uid, onChange)
}

export function fetchRegattasForClub(clubId: string) {
  return RegattasStorage.loadRegattasForClub(clubId)
}

export function persistRegatta(uid: string | null, clubId: string | undefined, regatta: Regatta) {
  return RegattasStorage.upsertRegatta(uid, clubId, regatta)
}

export function removeRegatta(clubId: string | undefined, regattaName: string) {
  return RegattasStorage.deleteRegatta(clubId, regattaName)
}
