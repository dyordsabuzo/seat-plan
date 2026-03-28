import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React, { useMemo, useState } from 'react'

const QUERY_CACHE_KEY = 'seat-plan.query-cache'
const CACHE_BUSTER = 'v1'
const ONE_DAY = 1000 * 60 * 60 * 24

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: ONE_DAY,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}

function createPersister() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: QUERY_CACHE_KEY,
    throttleTime: 1000,
  })
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient())
  const persister = useMemo(() => createPersister(), [])

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: CACHE_BUSTER,
        maxAge: ONE_DAY,
        dehydrateOptions: {
          shouldDehydrateQuery: query =>
            query.state.status === 'success' && query.meta?.persist !== false,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
