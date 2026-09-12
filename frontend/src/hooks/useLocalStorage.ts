export function useLocalStorage<T>(_key: string, initialValue: T) {
  // TODO [Contributors 4 & 6]: implement JSON hydration, updates, and malformed-data recovery.
  return [initialValue, (_value: T) => undefined] as const
}
