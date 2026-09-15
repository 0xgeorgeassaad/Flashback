import { useCallback, useEffect, useState } from 'react'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    return safeParse<T>(
      window.localStorage.getItem(key),
      initialValue,
    )
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore localStorage write failures.
    }
  }, [key, value])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== key) return

      setValue(safeParse<T>(event.newValue, initialValue))
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reset = useCallback(
    () => setValue(initialValue),
    [initialValue],
  )

  return [value, setValue, reset] as const
} 