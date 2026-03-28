import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { logger } from '../common/helpers/logger'
import { useAuth } from '../context/AuthContext'
import {
    fetchRegattasForClub,
    invalidateCachedQuery,
    optimisticallyUpdateQuery,
    persistRegatta,
    readRegattasCache,
    regattasQueryKey,
    removeRegatta,
    removeRegattaFromCache,
    rollbackOptimisticQuery,
    upsertRegattaInCache,
    writeRegattasCache,
} from '../shared/query'
import { Regatta } from '../types/RegattaType'

export type PersistRegattaResult = {
  persistedRemotely: boolean
}

export default function useRegattas(clubId?: string | null) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = regattasQueryKey(clubId, user?.uid)

  const query = useQuery<Record<string, Regatta>>({
    queryKey,
    queryFn: async () => {
      const local = readRegattasCache()
      if (!clubId) return local

      try {
        const remote = await fetchRegattasForClub(clubId)
        const merged = { ...local, ...remote }
        writeRegattasCache(merged)
        return merged
      } catch (error) {
        return local
      }
    },
    initialData: readRegattasCache(),
    meta: { persist: true },
  })

  const upsertMutation = useMutation<PersistRegattaResult, Error, Regatta, { previous: Record<string, Regatta> }>({
    mutationFn: async regatta => {
      upsertRegattaInCache(readRegattasCache(), regatta)

      if (!user?.uid) {
        return { persistedRemotely: false }
      }

      try {
        await persistRegatta(user.uid, clubId ?? undefined, regatta)
        return { persistedRemotely: true }
      } catch (error) {
        logger.warn('[useRegattas] Remote regatta upsert failed; local cache retained', error)
        return { persistedRemotely: false }
      }
    },
    onMutate: async regatta => {
      return optimisticallyUpdateQuery({
        queryClient,
        queryKey,
        variables: regatta,
        fallbackData: readRegattasCache(),
        updater: upsertRegattaInCache,
      })
    },
    onError: (_error, _regatta, context) => {
      rollbackOptimisticQuery({ queryClient, queryKey, context })
      if (context?.previous) writeRegattasCache(context.previous)
    },
    onSettled: async () => {
      if (user?.uid && clubId) {
        await invalidateCachedQuery({ queryClient, queryKey })
      }
    },
  })

  const deleteMutation = useMutation<PersistRegattaResult, Error, string, { previous: Record<string, Regatta> }>({
    mutationFn: async regattaName => {
      removeRegattaFromCache(readRegattasCache(), regattaName)

      if (!user?.uid) {
        return { persistedRemotely: false }
      }

      try {
        await removeRegatta(clubId ?? undefined, regattaName)
        return { persistedRemotely: true }
      } catch (error) {
        logger.warn('[useRegattas] Remote regatta delete failed; local cache retained', error)
        return { persistedRemotely: false }
      }
    },
    onMutate: async regattaName => {
      return optimisticallyUpdateQuery({
        queryClient,
        queryKey,
        variables: regattaName,
        fallbackData: readRegattasCache(),
        updater: removeRegattaFromCache,
      })
    },
    onError: (_error, _regattaName, context) => {
      rollbackOptimisticQuery({ queryClient, queryKey, context })
      if (context?.previous) writeRegattasCache(context.previous)
    },
    onSettled: async () => {
      if (user?.uid && clubId) {
        await invalidateCachedQuery({ queryClient, queryKey })
      }
    },
  })

  const setCachedRegatta = useCallback(
    (regatta: Regatta) => {
      queryClient.setQueryData<Record<string, Regatta>>(queryKey, previous => {
        const current = previous ?? readRegattasCache()
        const next = upsertRegattaInCache(current, regatta)
        return next
      })
    },
    [queryClient, queryKey],
  )

  return {
    regattas: query.data ?? {},
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    upsertRegatta: (regatta: Regatta) => upsertMutation.mutateAsync(regatta),
    deleteRegatta: (regattaName: string) => deleteMutation.mutateAsync(regattaName),
    setCachedRegatta,
  }
}
