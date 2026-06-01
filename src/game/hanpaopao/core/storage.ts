export interface KeyValueStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const getDefaultStorage = (): KeyValueStorage | undefined => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const readStoredNumber = (
  key: string,
  fallback = 0,
  storage = getDefaultStorage(),
): number => {
  try {
    const raw = storage?.getItem(key)
    if (raw == null || raw.trim() === '') return fallback
    const value = Number(raw)
    return Number.isFinite(value) ? value : fallback
  } catch {
    return fallback
  }
}

export const writeStoredNumber = (
  key: string,
  value: number,
  storage = getDefaultStorage(),
): boolean => {
  try {
    if (!storage || !Number.isFinite(value)) return false
    storage.setItem(key, String(Math.floor(value)))
    return true
  } catch {
    return false
  }
}

export const readStoredBoolean = (
  key: string,
  fallback = false,
  storage = getDefaultStorage(),
): boolean => {
  try {
    const raw = storage?.getItem(key)
    if (raw === 'true') return true
    if (raw === 'false') return false
    return fallback
  } catch {
    return fallback
  }
}

export const writeStoredBoolean = (
  key: string,
  value: boolean,
  storage = getDefaultStorage(),
): boolean => {
  try {
    if (!storage) return false
    storage.setItem(key, value ? 'true' : 'false')
    return true
  } catch {
    return false
  }
}

export const removeStoredKeys = (
  keys: readonly string[],
  storage = getDefaultStorage(),
): boolean => {
  try {
    if (!storage) return false
    keys.forEach((key) => storage.removeItem(key))
    return true
  } catch {
    return false
  }
}
