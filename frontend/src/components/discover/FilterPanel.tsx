import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import type { CatalogSort, ViewMode } from '../../types'
import type { ActiveFilterChip } from '../../hooks/useMovieFilters'

const SORT_LABELS: Record<CatalogSort, string> = {
  'title-asc': 'Title (A–Z)',
  'title-desc': 'Title (Z–A)',
  'year-newest': 'Year (newest first)',
  'year-oldest': 'Year (oldest first)',
}

const SORT_OPTIONS = Object.keys(SORT_LABELS) as CatalogSort[]

// Reset default <button> chrome so a Chip can sit inside a real <button>
// (for aria-pressed semantics) without doubled borders/padding.
const TOGGLE_BUTTON_RESET =
  'rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee/40 focus-visible:ring-offset-2 focus-visible:ring-offset-booth'

type FilterPanelProps = {
  availableGenres: readonly string[]
  selectedGenres: string[]
  onToggleGenre: (genre: string) => void
  availableDecades: number[]
  selectedDecades: number[]
  onToggleDecade: (decade: number) => void
  sort: CatalogSort
  onSortChange: (sort: CatalogSort) => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  activeFilterChips: ActiveFilterChip[]
  onClearAll: () => void
}

export function FilterPanel({
  availableGenres,
  selectedGenres,
  onToggleGenre,
  availableDecades,
  selectedDecades,
  onToggleDecade,
  sort,
  onSortChange,
  view,
  onViewChange,
  activeFilterChips,
  onClearAll,
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
              aria-pressed={selectedGenres.includes(genre)}
              onClick={() => onToggleGenre(genre)}
            >
              <Chip active={selectedGenres.includes(genre)}>{genre}</Chip>
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
              aria-pressed={selectedDecades.includes(decade)}
              onClick={() => onToggleDecade(decade)}
            >
              <Chip active={selectedDecades.includes(decade)}>{decade}s</Chip>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">
          Sort by
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as CatalogSort)}
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
            variant={view === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={view === 'grid'}
            onClick={() => onViewChange('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'primary' : 'secondary'}
            size="sm"
            aria-pressed={view === 'list'}
            onClick={() => onViewChange('list')}
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
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
