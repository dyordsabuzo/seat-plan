import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { logger } from '../common/helpers/logger'
import { db } from '../firebase'
import { Regatta } from '../types/RegattaType'

function sanitizeId(name: string) {
  try {
    return name.toString().trim().replace(/\s+/g, '_')
  } catch (e) {
    return String(Date.now())
  }
}

/**
 * Sanitize an object for Firestore by ensuring there are no nested arrays
 * (Firestore rejects arrays that contain arrays). Any nested array encountered
 * is converted to a JSON string to preserve the data.
 */
function sanitizeForFirestore(value: any): any {
  if (Array.isArray(value)) {
    return value.map(item => {
      if (Array.isArray(item)) {
        return JSON.stringify(item)
      }
      if (item && typeof item === 'object') return sanitizeForFirestore(item)
      return item
    })
  }
  if (value && typeof value === 'object') {
    const out: any = {}
    for (const k of Object.keys(value)) {
      out[k] = sanitizeForFirestore(value[k])
    }
    return out
  }
  return value
}

/**
 * Load regattas linked to a given club id from Firestore.
 * Prefer nested collection `clubs/{clubId}/regattas`, fall back to top-level `regattas`.
 */
export async function loadRegattasForClub(clubId: string): Promise<Record<string, Regatta>> {
  if (!clubId) return {}
  try {
    // Try nested collection first
    const nestedCol = collection(db, 'clubs', clubId, 'regattas')
    const snap = await getDocs(nestedCol)
    // If nested collection has documents, return them.
    if (!snap.empty) {
      const out: Record<string, Regatta> = {}
      snap.docs.forEach(d => {
        const data = d.data() as any
        if (data && data.name) out[data.name] = { ...(data as Regatta) }
      })
      return out
    }
    // If nested collection is empty, fall through to query top-level collection
  } catch (e) {
    logger.error('[RegattasStorage] loadRegattasForClub error (nested attempt)', clubId, e)
    // Fallback to top-level collection
    try {
      const col = collection(db, 'regattas')
      const q = query(col, where('clubId', '==', clubId))
      const snap2 = await getDocs(q)
      const out2: Record<string, Regatta> = {}
      snap2.docs.forEach(d => {
        const data = d.data() as any
        if (data && data.name) out2[data.name] = { ...(data as Regatta) }
      })
      return out2
    } catch (e2) {
      logger.error('[RegattasStorage] loadRegattasForClub error (fallback)', clubId, e2)
      return {}
    }
  }

  // If we reached here it means the nested collection existed but was empty.
  // Query top-level collection for regattas with matching clubId.
  try {
    const col = collection(db, 'regattas')
    const q = query(col, where('clubId', '==', clubId))
    const snap2 = await getDocs(q)
    const out2: Record<string, Regatta> = {}
    snap2.docs.forEach(d => {
      const data = d.data() as any
      if (data && data.name) out2[data.name] = { ...(data as Regatta) }
    })
    return out2
  } catch (e2) {
    logger.error('[RegattasStorage] loadRegattasForClub error (fallback after empty nested)', clubId, e2)
    return {}
  }
}

/**
 * Upsert a regatta into Firestore and associate it with a club.
 * Prefer nested `clubs/{clubId}/regattas/{id}` and fall back to top-level `regattas`.
 */
export async function upsertRegatta(uid: string | null, clubId: string | undefined, regatta: Regatta): Promise<void> {
  if (!regatta || !regatta.name) throw new Error('regatta.name is required to persist')
  const id = sanitizeId(regatta.name)
  const owners = uid ? [uid] : []
  const payload = { ...regatta, clubId: clubId || null, owners }

  // sanitize payload to avoid nested arrays which Firestore rejects
  const safePayload = sanitizeForFirestore(payload)

  // If clubId provided, prefer nested collection under the club
  if (clubId) {
    try {
      const nestedRef = doc(db, 'clubs', clubId, 'regattas', id)
      await setDoc(nestedRef, safePayload)
      logger.debug('[RegattasStorage] upsertRegatta done (nested)', id)
      return
    } catch (e) {
      logger.error('[RegattasStorage] upsertRegatta error (nested attempt)', id, e)
      // fallthrough to top-level
    }
  }

  // write to top-level collection as fallback or when no clubId provided
  try {
    await setDoc(doc(db, 'regattas', id), safePayload)
    logger.debug('[RegattasStorage] upsertRegatta done (top-level)', id)
  } catch (e2) {
    logger.error('[RegattasStorage] upsertRegatta error (top-level)', id, e2)
    throw e2
  }
}

/**
 * Delete a regatta from Firestore.
 * Tries the nested club collection first when `clubId` is present, then also
 * removes any top-level fallback document with the same id.
 */
export async function deleteRegatta(clubId: string | undefined, regattaName: string): Promise<void> {
  if (!regattaName) throw new Error('regattaName is required to delete a regatta')

  const id = sanitizeId(regattaName)
  const errors: unknown[] = []

  if (clubId) {
    try {
      await deleteDoc(doc(db, 'clubs', clubId, 'regattas', id))
      logger.debug('[RegattasStorage] deleteRegatta done (nested)', id)
    } catch (error) {
      logger.error('[RegattasStorage] deleteRegatta error (nested attempt)', id, error)
      errors.push(error)
    }
  }

  try {
    await deleteDoc(doc(db, 'regattas', id))
    logger.debug('[RegattasStorage] deleteRegatta done (top-level)', id)
  } catch (error) {
    logger.error('[RegattasStorage] deleteRegatta error (top-level)', id, error)
    errors.push(error)
  }

  if (errors.length > 1 || (!clubId && errors.length === 1)) {
    throw errors[errors.length - 1]
  }
}
