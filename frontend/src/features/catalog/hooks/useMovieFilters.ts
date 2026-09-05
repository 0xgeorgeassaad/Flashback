import type { Movie, MovieFilters } from '../../../types'

export function useMovieFilters(movies: Movie[], filters: MovieFilters) {
  // TODO [Contributor 2]: parse years, filter by query/genre/decade, sort without mutating, and paginate.
  void filters
  return {
    visibleMovies: movies,
    totalMatches: movies.length,
    hasMore: false,
    loadMore: () => undefined,
  }
}
