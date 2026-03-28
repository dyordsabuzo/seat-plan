import type { Regatta } from '../../types/RegattaType'
import { readJsonStorage, writeJsonStorage } from './browserStorage'

const REGATTAS_STORAGE_KEY = 'regattaConfigs'

export function readRegattasCache(): Record<string, Regatta> {
  return readJsonStorage(REGATTAS_STORAGE_KEY, {} as Record<string, Regatta>)
}

export function writeRegattasCache(regattas: Record<string, Regatta>) {
  writeJsonStorage(REGATTAS_STORAGE_KEY, regattas)
}

export function upsertRegattaInCache(regattas: Record<string, Regatta>, regatta: Regatta) {
  const next = {
    ...regattas,
    [regatta.name]: regatta,
  }

  writeRegattasCache(next)
  return next
}

export function removeRegattaFromCache(regattas: Record<string, Regatta>, regattaName: string) {
  const next = { ...regattas }
  delete next[regattaName]
  writeRegattasCache(next)
  return next
}
