export const clubsQueryKey = (uid?: string | null) => ['clubs', uid ?? 'guest'] as const

export const regattasQueryKey = (clubId?: string | null, uid?: string | null) =>
  ['regattas', clubId ?? 'unscoped', uid ?? 'guest'] as const
