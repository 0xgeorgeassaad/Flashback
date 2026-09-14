import { useMovieFilters } from '../hooks/useMovieFilters'
import { getHighlightSegments } from '../../../utils/highlightMatch'

/**
 * Controlled, case-insensitive title search input.
 * Self-contained: reads/writes its query via useMovieFilters, which is
 * backed by the URL search params — so it stays in sync with FilterPanel
 * and the results grid without any prop drilling.
 */
export function MovieSearch() {
  const { filters, setQuery } = useMovieFilters()

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <label htmlFor="movie-search-input" className="font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">
        Search
      </label>
      <input
        id="movie-search-input"
        type="text"
        value={filters.query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search titles…"
        autoComplete="off"
        className="min-h-11 rounded-full border border-line bg-reel/70 px-4 text-sm text-screen placeholder:text-haze focus:border-marquee focus:outline-none focus:ring-2 focus:ring-marquee/40"
      />
    </div>
  )
}

type HighlightedTitleProps = {
  title: string
  query: string
}

/**
 * Renders `title` with the current search term highlighted, without
 * ever building or injecting an HTML string. For use inside MovieCard
 * (Contributor 3's side).
 */
export function HighlightedTitle({ title, query }: HighlightedTitleProps) {
  const segments = getHighlightSegments(title, query)
  return (
    <span>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <mark key={index} className="rounded bg-marquee/30 px-0.5 text-screen">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  )
}