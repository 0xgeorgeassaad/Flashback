export const MIN_SELECTED_MOVIES = 5
export const MAX_SELECTED_GENRES = 3
export const CATALOG_PAGE_SIZE = 20

export const STORAGE_KEYS = {
  tasteDraft: 'flashback:taste-draft',
  savedMovies: 'flashback:saved-movies',
  recommendationHistory: 'flashback:recommendation-history',
} as const

export const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

export const MOVIE_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  "Children's",
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Film-Noir',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
] as const
