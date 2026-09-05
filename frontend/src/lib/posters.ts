import { TMDB_POSTER_BASE } from '../constants'

/**
 * Build a TMDB image CDN URL from a posterPath.
 * No TMDB API key is required; the image host is public.
 *
 * Example: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
 *       -> "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
 */
export function posterUrl(posterPath: string | null | undefined): string | null {
  if (!posterPath) return null
  return `${TMDB_POSTER_BASE}${posterPath}`
}
