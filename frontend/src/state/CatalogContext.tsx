/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMovies } from '../api/client'
import type { CatalogStatus, Movie } from '../types'

type CatalogContextValue = {
  movies: Movie[]
  status: CatalogStatus
  error: string | null
  reload: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [status, setStatus] = useState<CatalogStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    fetchMovies()
      .then((catalog) => {
        setMovies(catalog)
        setStatus('ready')
      })
      .catch(() => {
        setError("We couldn't load the movie catalog. Refresh or try again.")
        setStatus('error')
      })
  }, [requestVersion])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestVersion((value) => value + 1)
  }, [])

  const value = useMemo(
    () => ({ movies, status, error, reload }),
    [movies, status, error, reload],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider')
  return context
}
