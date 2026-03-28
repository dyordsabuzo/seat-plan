import { QueryClient, QueryKey } from '@tanstack/react-query'

export type OptimisticContext<TData> = {
  previous: TData
}

type OptimisticUpdateArgs<TData, TVariables> = {
  queryClient: QueryClient
  queryKey: QueryKey
  variables: TVariables
  fallbackData: TData
  updater: (current: TData, variables: TVariables) => TData
}

export async function optimisticallyUpdateQuery<TData, TVariables>({
  queryClient,
  queryKey,
  variables,
  fallbackData,
  updater,
}: OptimisticUpdateArgs<TData, TVariables>): Promise<OptimisticContext<TData>> {
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<TData>(queryKey) ?? fallbackData
  const next = updater(previous, variables)
  queryClient.setQueryData(queryKey, next)
  return { previous }
}

type RollbackArgs<TData> = {
  queryClient: QueryClient
  queryKey: QueryKey
  context?: OptimisticContext<TData>
}

export function rollbackOptimisticQuery<TData>({
  queryClient,
  queryKey,
  context,
}: RollbackArgs<TData>) {
  if (!context) return
  queryClient.setQueryData(queryKey, context.previous)
}

type InvalidateArgs = {
  queryClient: QueryClient
  queryKey: QueryKey
}

export async function invalidateCachedQuery({ queryClient, queryKey }: InvalidateArgs) {
  await queryClient.invalidateQueries({ queryKey, exact: true })
}
