import { collection, deleteDoc, doc, DocumentData, getDocs, onSnapshot, query, QuerySnapshot, setDoc, where } from 'firebase/firestore'
import { logger } from '../common/helpers/logger'
import { db } from '../firebase'
import { Paddler } from '../types/RegattaType'

export type Club = {
  id: string
  name: string
  paddlers: Paddler[]
}

/**
 * Load clubs visible to a given user from Firestore.
 * Clubs are stored in a top-level `clubs` collection. Each club document
 * should include an `owners` array of user ids who have access. We query
 * `clubs` where `owners` array-contains the provided uid.
 */
export async function loadClubs(uid: string): Promise<Club[]> {
  if (!uid) throw new Error('uid is required to load clubs from Firestore')
  const col = collection(db, 'clubs')
  const q = query(col, where('owners', 'array-contains', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Club))
}

/**
 * Save/overwrite the provided clubs for the user. Each club is written as
 * a separate document under `users/{uid}/clubs/{clubId}`.
 */
export async function saveClubs(uid: string, clubs: Club[]): Promise<void> {
  if (!uid) throw new Error('uid is required to save clubs to Firestore')
  const promises: Promise<void>[] = []
  for (const c of clubs) {
    const ref = doc(db, 'clubs', c.id)
    // ensure owners includes the current uid
    const payload = { ...c, owners: Array.isArray((c as any).owners) ? Array.from(new Set([...(c as any).owners, uid])) : [uid] }
    // setDoc with the club object (overwrites/upserts)
    console.debug('[ClubsStorage] saveClubs setDoc', uid, c.id)
    promises.push(setDoc(ref, payload).then(() => {
      console.debug('[ClubsStorage] saveClubs setDoc done', uid, c.id)
    }))
  }
  await Promise.all(promises)
}

/**
 * Upsert a single club document.
 */
export async function upsertClub(uid: string, club: Club): Promise<void> {
  if (!uid) throw new Error('uid is required to upsert a club')
  try {
    logger.debug('[ClubsStorage] upsertClub', uid, club.id)
    // ensure owners metadata exists and includes the requesting uid
    const owners = Array.isArray((club as any).owners) ? Array.from(new Set([...(club as any).owners, uid])) : [uid]
    const payload = { ...club, owners }

    logger.debug('[ClubsStorage] upsertClub payload', payload)

    await setDoc(doc(db, 'clubs', club.id), payload)
    logger.debug('[ClubsStorage] upsertClub done', uid, club.id)
  } catch (e) {
    logger.error('[ClubsStorage] upsertClub error', uid, club.id, e)
    throw e
  }
}

/**
 * Delete a club document.
 */
export async function deleteClub(uid: string, clubId: string): Promise<void> {
  if (!uid) throw new Error('uid is required to delete a club')
  await deleteDoc(doc(db, 'clubs', clubId))
}

/**
 * Subscribe to realtime updates for clubs for a given user.
 * Returns an unsubscribe function.
 */
export function subscribeClubs(uid: string, onChange: (clubs: Club[]) => void) {
  if (!uid) throw new Error('uid is required to subscribe to clubs')
  const col = collection(db, 'clubs')
  const q = query(col, where('owners', 'array-contains', uid))
  const unsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const clubs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Club))
    onChange(clubs)
  })
  return unsub
}

// export default {
//   loadClubs,
//   saveClubs,
//   upsertClub,
//   deleteClub,
//   subscribeClubs,
// }
