import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCatalog } from '../../../state/CatalogContext'
import { CATALOG_PAGE_SIZE, MOVIE_GENRES } from '../../../constants'
import type { CatalogSort, Movie, MovieFilters, ViewMode } from '../../../types'
import { parseYearFromTitle, getDecade } from '../../../utils/parseYear'

const DEFAULT_SORT: CatalogSort = 'title-asc'
const DEFAULT_VIEW: ViewMode = 'grid'
const VALID_SORTS: CatalogSort[] = ['title-asc', 'title-desc', 'year-newest', 'year-oldest']

export type EnrichedMovie = Movie & { year: number | null; decade: number | null }

export type ActiveFilterChip = {
  key: string
  label: string
  onClear: () => void
}

function parseFiltersFromParams(params: URLSearchParams): MovieFilters {
  const sortParam = params.get('sort') as CatalogSort | null
  return {
    query: params.get('q') ?? '',
    genres: params.get('genres') ? params.get('genres')!.split(',').filter(Boolean) : [],
    decades: params.get('decades')
      ? params.get('decades')!.split(',').filter(Boolean).map(Number)
      : [],
    sort: sortParam && VALID_SORTS.includes(sortParam) ? sortParam : DEFAULT_SORT,
    view: params.get('view') === 'list' ? 'list' : DEFAULT_VIEW,
  }
}

function filtersToParams(filters: MovieFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.genres.length) params.set('genres', filters.genres.join(','))
  if (filters.decades.length) params.set('decades', filters.decades.join(','))
  if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort)
  if (filters.view !== DEFAULT_VIEW) params.set('view', filters.view)
  return params
}

/**
 * Filtered result contract handed to MovieGrid (Contributor 3) via
 * `results` / `totalCount` / `filters.view`:
 *
 *   results: EnrichedMovie[]   // current page only — Movie & { year, decade },
 *                              // keyed by movieId. Fresh array; the catalog
 *                              // from CatalogContext is never mutated.
 */
export function useMovieFilters(pageSize: number = CATALOG_PAGE_SIZE) {
  const { movies, status, error, reload } = useCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams])
  const [visibleCount, setVisibleCount] = useState(pageSize)

  const updateFilters = useCallback(
    (updates: Partial<MovieFilters>) => {
      setSearchParams(filtersToParams({ ...filters, ...updates }), { replace: true })
    },
    [filters, setSearchParams],
  )

  const setQuery = useCallback((query: string) => updateFilters({ query }), [updateFilters])
  const setSort = useCallback((sort: CatalogSort) => updateFilters({ sort }), [updateFilters])
  const setView = useCallback((view: ViewMode) => updateFilters({ view }), [updateFilters])

  const toggleGenre = useCallback(
    (genre: string) => {
      const genres = filters.genres.includes(genre)
        ? filters.genres.filter((g) => g !== genre)
        : [...filters.genres, genre]
      updateFilters({ genres })
    },
    [filters.genres, updateFilters],
  )

  const toggleDecade = useCallback(
    (decade: number) => {
      const decades = filters.decades.includes(decade)
        ? filters.decades.filter((d) => d !== decade)
        : [...filters.decades, decade]
      updateFilters({ decades })
    },
    [filters.decades, updateFilters],
  )

  const clearGenre = useCallback(
    (genre: string) => updateFilters({ genres: filters.genres.filter((g) => g !== genre) }),
    [filters.genres, updateFilters],
  )

  const clearDecade = useCallback(
    (decade: number) => updateFilters({ decades: filters.decades.filter((d) => d !== decade) }),
    [filters.decades, updateFilters],
  )

  const clearAllFilters = useCallback(() => {
    updateFilters({ query: '', genres: [], decades: [] })
  }, [updateFilters])

  const enrichedCatalog = useMemo<EnrichedMovie[]>(() => {
    return movies.map((movie) => {
      const year = parseYearFromTitle(movie.title)
      return { ...movie, year, decade: getDecade(year) }
    })
  }, [movies])

  const availableDecades = useMemo(() => {
    const set = new Set<number>()
    enrichedCatalog.forEach((movie) => {
      if (movie.decade !== null) set.add(movie.decade)
    })
    return Array.from(set).sort((a, b) => a - b)
  }, [enrichedCatalog])

  const filteredResults = useMemo(() => {
    const term = filters.query.trim().toLowerCase()

    const filtered = enrichedCatalog.filter((movie) => {
      const matchesSearch = !term || movie.title.toLowerCase().includes(term)
      const matchesGenre =
        filters.genres.length === 0 || filters.genres.every((g) => movie.genres.includes(g))
      const matchesDecade =
        filters.decades.length === 0 ||
        (movie.decade !== null && filters.decades.includes(movie.decade))
      return matchesSearch && matchesGenre && matchesDecade
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sort) {
        case 'title-asc':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
        case 'title-desc':
          return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' })
        case 'year-oldest':
          return (a.year ?? Infinity) - (b.year ?? Infinity)
        case 'year-newest':
          return (b.year ?? -Infinity) - (a.year ?? -Infinity)
        default:
          return 0
      }
    })

    return sorted
  }, [enrichedCatalog, filters.query, filters.genres, filters.decades, filters.sort])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [filters.query, filters.genres, filters.decades, filters.sort, pageSize])

  const totalCount = filteredResults.length
  const paginatedResults = filteredResults.slice(0, visibleCount)
  const hasMore = visibleCount < totalCount

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, totalCount))
  }, [pageSize, totalCount])

  const activeFilterChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    const trimmedQuery = filters.query.trim()
    if (trimmedQuery) {
      chips.push({ key: 'query', label: `Search: "${trimmedQuery}"`, onClear: () => setQuery('') })
    }
    filters.genres.forEach((genre) => {
      chips.push({ key: `genre:${genre}`, label: genre, onClear: () => clearGenre(genre) })
    })
    filters.decades.forEach((decade) => {
      chips.push({ key: `decade:${decade}`, label: `${decade}s`, onClear: () => clearDecade(decade) })
    })
    return chips
  }, [filters.query, filters.genres, filters.decades, setQuery, clearGenre, clearDecade])

  return {
    filters,
    setQuery,
    setSort,
    setView,
    toggleGenre,
    toggleDecade,
    clearAllFilters,
    activeFilterChips,

    availableGenres: MOVIE_GENRES,
    availableDecades,

    results: paginatedResults,
    totalCount,
    hasMore,
    loadMore,

    status,
    error,
    reload,
    isEmpty: status === 'ready' && totalCount === 0,
  }
}