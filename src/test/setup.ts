import '@testing-library/jest-dom/vitest'

function installMemoryLocalStorage() {
  const storage = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      get length() {
        return storage.size
      },
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  })
}

try {
  window.localStorage.setItem('__fm_test__', '1')
  window.localStorage.removeItem('__fm_test__')
} catch {
  installMemoryLocalStorage()
}
