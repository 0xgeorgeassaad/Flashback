import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

type LocalStorageOptions<T> = {
  validate?: (value: unknown) => value is T
  legacyKeys?: readonly string[]
}

type StoredState<T> = {
  value: T
  recovered: boolean
}

function parseStoredValue<T>(
  raw: string,
  validate?: (value: unknown) => value is T,
): T | undefined {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (validate) return validate(parsed) ? parsed : undefined
    return parsed as T
  } catch {
    return undefined
  }
}

function readStoredValue<T>(
  key: string,
  initialValue: T,
  options: LocalStorageOptions<T>,
): StoredState<T> {
  if (typeof window === 'undefined') return { value: initialValue, recovered: false }

  let recovered = false

  for (const candidateKey of [key, ...(options.legacyKeys ?? [])]) {
    const raw = window.localStorage.getItem(candidateKey)
    if (raw === null) continue

    const parsed = parseStoredValue(raw, options.validate)
    if (parsed !== undefined) return { value: parsed, recovered }

    recovered = true
  }

  return { value: initialValue, recovered }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: LocalStorageOptions<T> = {},
) {
  const [stored, setStored] = useState<StoredState<T>>(() =>
    readStoredValue(key, initialValue, options),
  )

  const setValue: Dispatch<SetStateAction<T>> = useCallback((nextValue) => {
    setStored((current) => {
      const value =
        typeof nextValue === 'function'
          ? (nextValue as (previous: T) => T)(current.value)
          : nextValue

      return Object.is(value, current.value)
        ? current
        : { value, recovered: current.recovered }
    })
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored.value))
      for (const legacyKey of options.legacyKeys ?? []) {
        window.localStorage.removeItem(legacyKey)
      }
    } catch {
      // The application remains usable when browser storage is unavailable.
    }
  }, [key, options.legacyKeys, stored.value])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return

      if (event.key === null) {
        setStored({ value: initialValue, recovered: false })
        return
      }

      if (event.key !== key) return

      if (event.newValue === null) {
        setStored({ value: initialValue, recovered: false })
        return
      }

      const parsed = parseStoredValue(event.newValue, options.validate)
      setStored(
        parsed === undefined
          ? { value: initialValue, recovered: true }
          : { value: parsed, recovered: false },
      )
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [initialValue, key, options.validate])

  const reset = useCallback(() => {
    setStored({ value: initialValue, recovered: false })
  }, [initialValue])

  const dismissRecovery = useCallback(() => {
    setStored((current) => ({ ...current, recovered: false }))
  }, [])

  return [
    stored.value,
    setValue,
    reset,
    { recovered: stored.recovered, dismissRecovery },
  ] as const
}
