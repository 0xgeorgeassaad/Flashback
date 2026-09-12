import { useCallback, useEffect, useState } from 'react'

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function hasStoredValue(key: string): boolean {
  const rawValue = readLocalStorage(key)

  return rawValue !== null && rawValue.trim().length > 0
}

export function useLocalStoragePresence(key: string): boolean {
  const [hasValue, setHasValue] = useState(() =>
    hasStoredValue(key),
  )

  const checkValue = useCallback(() => {
    setHasValue(hasStoredValue(key))
  }, [key])

  useEffect(() => {
    checkValue()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        checkValue()
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [checkValue])

  return hasValue
}