import { getHighlightSegments } from '../../utils/highlightMatch'

type MovieSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Controlled, case-insensitive title search input.
 * Value/onChange are owned by the caller (useMovieFilters) — this
 * component holds no search state of its own.
 */
export function MovieSearch({ value, onChange, placeholder = 'Search titles…' }: MovieSearchProps) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <label htmlFor="movie-search-input" className="font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">
        Search
      </label>
      <input
        id="movie-search-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
 * ever building or injecting an HTML string. For use inside result
 * cards (Contributor 3's side).
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
