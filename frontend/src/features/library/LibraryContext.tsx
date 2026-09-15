/* oxlint-disable react/only-export-components */
import { createContext, useContext, type ReactNode } from 'react'
import { useLibraryState, type LibraryState } from './useLibrary'

const LibraryContext = createContext<LibraryState | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const library = useLibraryState()
  return <LibraryContext.Provider value={library}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const library = useContext(LibraryContext)
  if (!library) throw new Error('useLibrary must be used within a LibraryProvider')
  return library
}
