import type {
  LibraryFilter,
  LibrarySort,
} from '../useLibrary'

interface LibraryToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  filter: LibraryFilter
  onFilterChange: (value: LibraryFilter) => void
  sort: LibrarySort
  onSortChange: (value: LibrarySort) => void
}

const FILTERS: {
  value: LibraryFilter
  label: string
}[] = [
  { value: 'all', label: 'All' },
  { value: 'watched', label: 'Watched' },
  { value: 'unwatched', label: 'Unwatched' },
]

const SORTS: {
  value: LibrarySort
  label: string
}[] = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'title', label: 'Title (A–Z)' },
]

export function LibraryToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: LibraryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-reel p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <label
          className="sr-only"
          htmlFor="library-search"
        >
          Search saved movies
        </label>

        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(event) =>
            onQueryChange(event.target.value)
          }
          placeholder="Search your list…"
          className="w-full rounded-md border border-haze/30 bg-booth px-3 py-2 text-screen placeholder:text-haze focus:outline-none focus:ring-2 focus:ring-marquee sm:w-64"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter saved movies"
          className="flex gap-1"
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                onFilterChange(item.value)
              }
              aria-pressed={
                filter === item.value
              }
              className={`rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-marquee ${
                filter === item.value
                  ? 'bg-marquee text-booth'
                  : 'bg-booth text-haze hover:text-screen'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div>
          <label
            className="sr-only"
            htmlFor="library-sort"
          >
            Sort saved movies
          </label>

          <select
            id="library-sort"
            value={sort}
            onChange={(event) =>
              onSortChange(
                event.target.value as LibrarySort,
              )
            }
            className="rounded-md border border-haze/30 bg-booth px-3 py-2 text-sm text-screen focus:outline-none focus:ring-2 focus:ring-marquee"
          >
            {SORTS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
} 