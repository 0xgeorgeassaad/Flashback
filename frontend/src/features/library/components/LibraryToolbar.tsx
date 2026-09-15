import { Button } from '../../../components/ui/Button'
import type { LibraryFilter, LibrarySort } from '../useLibrary'

type LibraryToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  filter: LibraryFilter
  onFilterChange: (value: LibraryFilter) => void
  sort: LibrarySort
  onSortChange: (value: LibrarySort) => void
  visibleCount: number
  totalSaved: number
  hasLocalData: boolean
  onClearData: () => void
}

const FILTERS: { value: LibraryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'watched', label: 'Watched' },
  { value: 'unwatched', label: 'Unwatched' },
]

const SORTS: { value: LibrarySort; label: string }[] = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'title', label: 'Title A to Z' },
]

export function LibraryToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  visibleCount,
  totalSaved,
  hasLocalData,
  onClearData,
}: LibraryToolbarProps) {
  return (
    <div className="rounded-panel border border-line bg-reel/65 p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_auto] lg:items-center">
        <div>
          <label className="sr-only" htmlFor="library-search">
            Search saved movies
          </label>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search saved movies..."
            className="min-h-11 w-full rounded-control border border-line bg-booth px-4 text-sm text-screen placeholder:text-haze focus:border-marquee focus:outline-none lg:max-w-md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter saved movies" className="flex flex-wrap gap-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                aria-pressed={filter === item.value}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
                  filter === item.value
                    ? 'border-marquee bg-marquee text-booth'
                    : 'border-line bg-booth text-haze hover:border-haze hover:text-screen'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="library-sort">
            Sort saved movies
          </label>
          <select
            id="library-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as LibrarySort)}
            className="min-h-9 rounded-full border border-line bg-booth px-3 text-xs font-semibold text-screen focus:border-marquee focus:outline-none"
          >
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="font-utility text-xs uppercase tracking-[0.12em] text-haze">
          Showing {visibleCount} of {totalSaved} saved {totalSaved === 1 ? 'movie' : 'movies'}
        </p>
        <Button type="button" variant="danger" size="sm" onClick={onClearData} disabled={!hasLocalData}>
          Clear local data
        </Button>
      </div>
    </div>
  )
}
