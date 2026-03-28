import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '../common/helpers/logger'
import { useAuth } from '../context/AuthContext'
import {
    clubsQueryKey,
    fetchClubsForUser,
    invalidateCachedQuery,
    optimisticallyUpdateQuery,
    persistClub,
    readClubsCache,
    removeClubFromCache,
    removeClub as removeClubRemote,
    rollbackOptimisticQuery,
    upsertClubInCache,
    watchClubsForUser,
    writeClubsCache,
} from '../shared/query'
import { Paddler } from '../types/RegattaType'
import type { Club } from '../utils/ClubsStorage'

export type { Club } from '../utils/ClubsStorage'

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
  const queryClient = useQueryClient()
  const queryKey = clubsQueryKey(user?.uid)
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)

  const clubsQuery = useQuery<Club[]>({
    queryKey,
    queryFn: async () => {
      const local = readClubsCache()
      if (!user?.uid) return local

      try {
        const remote = await fetchClubsForUser(user.uid)
        const merged = remote.length ? remote : local
        writeClubsCache(merged)
        return merged
      } catch (error) {
        return local
      }
    },
    initialData: readClubsCache(),
    meta: { persist: true },
  })

  const clubs = useMemo(() => clubsQuery.data ?? [], [clubsQuery.data])

  useEffect(() => {
    if (user?.uid) {
      const unsub = watchClubsForUser(user.uid, (remote) => {
        queryClient.setQueryData(queryKey, remote)
        writeClubsCache(remote)
        setSelectedClubId(prev => {
          if (!prev && remote.length) return remote[0].id
          if (prev && remote.find(r => r.id === prev)) return prev
          return remote.length ? remote[0].id : null
        })
      })
      return () => unsub()
    }

    setSelectedClubId(prev => {
      const local = readClubsCache()
      if (prev && local.find(club => club.id === prev)) return prev
      return local[0]?.id ?? null
    })
    return undefined
  }, [queryClient, queryKey, user])

  useEffect(() => {
    setSelectedClubId(prev => {
      if (prev && clubs.find(club => club.id === prev)) return prev
      return clubs[0]?.id ?? null
    })
  }, [clubs])

  const upsertClubMutation = useMutation<void, Error, Club, { previous: Club[] }>({
    mutationFn: async club => {
      const next = upsertClubInCache(readClubsCache(), club)

      if (!user?.uid) {
        queryClient.setQueryData(queryKey, next)
        return
      }

      await persistClub(user.uid, club)
    },
    onMutate: async club => {
      return optimisticallyUpdateQuery({
        queryClient,
        queryKey,
        variables: club,
        fallbackData: readClubsCache(),
        updater: upsertClubInCache,
      })
    },
    onError: (_error, _club, context) => {
      rollbackOptimisticQuery({ queryClient, queryKey, context })
      if (context?.previous) writeClubsCache(context.previous)
    },
    onSettled: async () => {
      if (user?.uid) {
        await invalidateCachedQuery({ queryClient, queryKey })
      }
    },
  })

  const deleteClubMutation = useMutation<void, Error, string, { previous: Club[] }>({
    mutationFn: async clubId => {
      const next = removeClubFromCache(readClubsCache(), clubId)

      if (!user?.uid) {
        queryClient.setQueryData(queryKey, next)
        return
      }

      await removeClubRemote(user.uid, clubId)
    },
    onMutate: async clubId => {
      return optimisticallyUpdateQuery({
        queryClient,
        queryKey,
        variables: clubId,
        fallbackData: readClubsCache(),
        updater: removeClubFromCache,
      })
    },
    onError: (_error, _clubId, context) => {
      rollbackOptimisticQuery({ queryClient, queryKey, context })
      if (context?.previous) writeClubsCache(context.previous)
    },
    onSettled: async () => {
      if (user?.uid) {
        await invalidateCachedQuery({ queryClient, queryKey })
      }
    },
  })


  const createClub = useCallback(async (name: string) => {
    const id = String(Date.now())
    const club: Club = { id, name: name.trim(), paddlers: [] }
    setSelectedClubId(id)
    await upsertClubMutation.mutateAsync(club)
  }, [upsertClubMutation])

  const removeClub = useCallback(async (id: string) => {
    setSelectedClubId(prev => prev === id ? null : prev)
    await deleteClubMutation.mutateAsync(id)
  }, [deleteClubMutation])

  const saveClubLocallyOrRemote = useCallback(async (club: Club) => {
    logger.debug('[useClubs] saveClubLocallyOrRemote', club)
    await upsertClubMutation.mutateAsync(club)
  }, [upsertClubMutation])

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
    isLoading: clubsQuery.isLoading,
    isFetching: clubsQuery.isFetching,
  }
}
