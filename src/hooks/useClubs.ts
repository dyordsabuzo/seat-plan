import { useCallback, useEffect, useState } from 'react'
import { logger } from '../common/helpers/logger'
import { useAuth } from '../context/AuthContext'
import { Paddler } from '../types/RegattaType'
import * as ClubsStorage from '../utils/ClubsStorage'

export type Club = {
  id: string
  name: string
  paddlers: Paddler[]
}

/**
 * Hook that exposes clubs state with a Firestore-backed implementation
 * when the user is authenticated, and a localStorage fallback otherwise.
 *
 * Behavior notes:
 * - When authenticated the hook will subscribe to realtime updates via
 *   `subscribeClubs(uid, setClubs)` and perform per-operation upserts/deletes
 *   so we avoid overwriting the collection on every small change.
 * - When no user is present, clubs are read/written from `localStorage`.
 */
export default function useClubs() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)

  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (user && user.uid) {
      const unsub = ClubsStorage.subscribeClubs(user.uid, (remote) => {
        setClubs(remote)
        // keep selectedClubId if it still exists, otherwise reset
        setSelectedClubId(prev => {
          if (!prev && remote.length) return remote[0].id
          if (prev && remote.find(r => r.id === prev)) return prev
          return remote.length ? remote[0].id : null
        })
      })
      return () => unsub()
    }
    // when unauthenticated: clear clubs (do not persist locally)
    setClubs([])
    setSelectedClubId(null)
    return
  // eslint-disable-next-line 
  }, [user])


  const createClub = useCallback(async (name: string) => {
    const id = String(Date.now())
    const club: Club = { id, name: name.trim(), paddlers: [] }
    setClubs(prev => [...prev, club])
    setSelectedClubId(id)
    if (user && user.uid) {
      try {
        console.debug('[useClubs] createClub upsertClub', user.uid, club.id)
        await ClubsStorage.upsertClub(user.uid, club)
        console.debug('[useClubs] createClub upsertClub done', user.uid, club.id)
      } catch (e) {
        console.debug('Failed to upsert club to Firestore', e)
      }
    }
  }, [user])

  const removeClub = useCallback(async (id: string) => {
    setClubs(prev => prev.filter(c => c.id !== id))
    setSelectedClubId(prev => prev === id ? null : prev)
    if (user && user.uid) {
      try {
        console.debug('[useClubs] deleteClub', user.uid, id)
        await ClubsStorage.deleteClub(user.uid, id)
        console.debug('[useClubs] deleteClub done', user.uid, id)
      } catch (e) {
        console.debug('Failed to delete club in Firestore', e)
      }
    }
  }, [user])

  const saveClubLocallyOrRemote = useCallback(async (club: Club) => {
    logger.debug('[useClubs] saveClubLocallyOrRemote', club)
    setClubs(prev => prev.map(c => c.id === club.id ? club : c))
    if (user && user.uid) {
        logger.debug('[useClubs] saveClubLocallyOrRemote', user.uid, club.id)
      try {
        logger.debug('[useClubs] saveClubLocallyOrRemote upsertClub', user.uid, club.id)
        await ClubsStorage.upsertClub(user.uid, club)
        logger.debug('[useClubs] saveClubLocallyOrRemote upsertClub done', user.uid, club.id)
      } catch (e) {
        logger.error('Failed to upsert club to Firestore', e)
      }
    }
  }, [user])

  const addPaddler = useCallback(async (clubId: string, p: Omit<Paddler, 'id'>) => {
    const target = clubs.find(c => c.id === clubId)
    if (!target) return
    const nextId = (() => {
      try {
        const nums = target.paddlers.map(pp => {
          const m = String(pp.id).match(/(\d+)$/)
          return m ? parseInt(m[1], 10) : NaN
        }).filter(n => !Number.isNaN(n))
        const max = nums.length ? Math.max(...nums) : 0
        return String(max + 1)
      } catch (e) {
        return String(Date.now())
      }
    })()
    const created: Paddler = { id: nextId, ...p }
    const updated: Club = { ...target, paddlers: [...target.paddlers, created] }
    console.debug('[useClubs] addPaddler created', clubId, created)
    await saveClubLocallyOrRemote(updated)
  }, [clubs, saveClubLocallyOrRemote])

  const savePaddler = useCallback(async (clubId: string, p: Paddler) => {
    const target = clubs.find(c => c.id === clubId)
    if (!target) return
    const updated: Club = { ...target, paddlers: target.paddlers.map(pp => pp.id === p.id ? { ...pp, ...p } : pp) }
    console.debug('[useClubs] savePaddler', clubId, p.id)
    await saveClubLocallyOrRemote(updated)
  }, [clubs, saveClubLocallyOrRemote])

  const deletePaddler = useCallback(async (clubId: string, paddlerId: string) => {
    const target = clubs.find(c => c.id === clubId)
    if (!target) return
    const updated: Club = { ...target, paddlers: target.paddlers.filter(pp => pp.id !== paddlerId) }
    console.debug('[useClubs] deletePaddler', clubId, paddlerId)
    await saveClubLocallyOrRemote(updated)
  }, [clubs, saveClubLocallyOrRemote])

  return {
    clubs,
    selectedClubId,
    setSelectedClubId,
    createClub,
    removeClub,
    upsertClub: saveClubLocallyOrRemote,
    addPaddler,
    savePaddler,
    deletePaddler,
    isRemote: Boolean(user && user.uid),
  }
}
