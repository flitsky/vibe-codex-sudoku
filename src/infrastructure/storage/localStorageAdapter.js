const hasGlobalStorage = () => {
  try {
    return typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage
  } catch {
    return null
  }
}

const createMemoryFallback = () => {
  const store = new Map()

  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, value)
    },
    removeItem: (key) => {
      store.delete(key)
    },
  }
}

export const createLocalStorageAdapter = ({ namespace = 'vibe-codex-sudoku' } = {}) => {
  const persistentStorage = hasGlobalStorage()
  const storage = persistentStorage || createMemoryFallback()
  const prefix = `${namespace}:`

  const withPrefix = (key) => `${prefix}${key}`

  const readRaw = (key) => storage.getItem(withPrefix(key))

  const writeRaw = (key, value) => {
    try {
      storage.setItem(withPrefix(key), value)
    } catch {
      // Swallow quota errors silently to keep gameplay uninterrupted
    }
  }

  const removeRaw = (key) => {
    try {
      storage.removeItem(withPrefix(key))
    } catch {
      // ignore
    }
  }

  const safeParse = (value, fallback) => {
    if (value === null || value === undefined) return fallback

    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }

  const safeStringify = (value) => {
    try {
      return JSON.stringify(value)
    } catch {
      return null
    }
  }

  return {
    get(key, fallback = null) {
      const raw = readRaw(key)
      return safeParse(raw, fallback)
    },
    set(key, value) {
      const serialised = safeStringify(value)
      if (serialised === null) return
      writeRaw(key, serialised)
    },
    remove(key) {
      removeRaw(key)
    },
    isPersistent: Boolean(persistentStorage),
  }
}
