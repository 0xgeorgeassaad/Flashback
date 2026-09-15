import { Button } from '../../../components/ui/Button'
import { Chip } from '../../../components/ui/Chip'
import type { CatalogSort, ViewMode } from '../../../types'
import type { ActiveFilterChip } from '../hooks/useMovieFilters'

const SORT_LABELS: Record<CatalogSort, string> = {
  'title-asc': 'Title (A-Z)',
  'title-desc': 'Title (Z-A)',
  'year-newest': 'Year (newest first)',
  'year-oldest': 'Year (oldest first)',
}

const SORT_OPTIONS = Object.keys(SORT_LABELS) as CatalogSort[]

const TOGGLE_BUTTON_RESET =
  'rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee/40 focus-visible:ring-offset-2 focus-visible:ring-offset-booth'

type FilterPanelProps = {
  availableGenres: string[]
  availableDecades: number[]
  filters: {
    genres: string[]
    decades: number[]
    sort: CatalogSort
    view: ViewMode
  }
  toggleGenre: (genre: string) => void
  toggleDecade: (decade: number) => void
  setSort: (sort: CatalogSort) => void
  setView: (view: ViewMode) => void
  activeFilterChips: ActiveFilterChip[]
  clearAllFilters: () => void
}

export function FilterPanel({
  availableGenres,
  availableDecades,
  filters,
  toggleGenre,
  toggleDecade,
  setSort,
  setView,
  activeFilterChips,
  clearAllFilters,
}: FilterPanelProps) {

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">Genres</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Genre filters">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={TOGGLE_BUTTON_RESET}
              aria-pressed={filters.genres.includes(genre)}
              onClick={() => toggleGenre(genre)}
            >
              <Chip active={filters.genres.includes(genre)}>{genre}</Chip>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">Decades</legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Decade filters">
          {availableDecades.map((decade) => (
            <button
              key={decade}
              type="button"
              className={TOGGLE_BUTTON_RESET}
              aria-pressed={filters.decades.includes(decade)}
              onClick={() => toggleDecade(decade)}
            >
              <Chip active={filters.decades.includes(decade)}>{decade}s</Chip>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">
          Sort by
          <select
            value={filters.sort}
            onChange={(event) => setSort(event.target.value as CatalogSort)}
            className="min-h-11 rounded-full border border-line bg-reel/70 px-4 font-sans text-sm normal-case tracking-normal text-screen focus:border-marquee focus:outline-none focus:ring-2 focus:ring-marquee/40"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1.5" role="group" aria-label="View mode">
          <Button
            variant={filters.view === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={filters.view === 'grid'}
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={filters.view === 'list' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={filters.view === 'list'}
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
      </div>

      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {activeFilterChips.map((chip) => (
            <Chip key={chip.key} removable onRemove={chip.onClear}>
              {chip.label}
            </Chip>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
