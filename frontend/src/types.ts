export type Movie = {
  movieId: number
  title: string
  genres: string[]
  tmdbId?: number
  posterPath: string | null
}

export type Recommendation = Movie & {
  score: number
}

export type SelectedMoviePayload = {
  movieId: number
  rating: number
}

export type MoviesResponse = {
  movies: Movie[]
}

export type RecommendRequest = {
  movies: SelectedMoviePayload[]
}

export type RecommendResponse = {
  recommendations: Recommendation[]
}

export type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error'

export type CatalogSort = 'title-asc' | 'title-desc' | 'year-newest' | 'year-oldest'

export type ViewMode = 'grid' | 'list'

export type MovieFilters = {
  query: string
  genres: string[]
  decades: number[]
  sort: CatalogSort
  view: ViewMode
}

export type SavedMovie = Movie & {
  savedAt: string
  watched: boolean
}

export type RecommendationSession = {
  id: string
  createdAt: string
  selectedMovieIds: number[]
  recommendations: Recommendation[]
}
