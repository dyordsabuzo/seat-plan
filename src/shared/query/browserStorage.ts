import { logger } from '../../common/helpers/logger'

export function readJsonStorage<T>(key: string, fallbackValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallbackValue
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallbackValue
  } catch (error) {
    logger.warn(`[queryStorage] Failed to read key "${key}"`, error)
    return fallbackValue
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}
