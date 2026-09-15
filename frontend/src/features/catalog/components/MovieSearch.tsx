import { Button } from '../../../components/ui/Button'
import type { CatalogStatus } from '../../../types'

type MovieSearchProps = {
  value: string
  onChange: (value: string) => void
  resultCount: number
  status: CatalogStatus
}

export function MovieSearch({ value, onChange, resultCount, status }: MovieSearchProps) {

  return (
    <div className="flex w-full max-w-sm flex-col gap-1.5">
      <label htmlFor="movie-search-input" className="font-utility text-[0.7rem] uppercase tracking-[0.12em] text-haze">
        Search
      </label>
      <div className="flex items-center gap-2">
        <input
          id="movie-search-input"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search titles..."
          autoComplete="off"
          className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-reel/70 px-4 text-sm text-screen placeholder:text-haze focus:border-marquee focus:outline-none focus:ring-2 focus:ring-marquee/40"
        />
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onChange('')}>
            Clear
          </Button>
        )}
      </div>
      <p className="font-utility text-xs text-haze" aria-live="polite">
        {status === 'ready'
          ? `${resultCount.toLocaleString()} ${resultCount === 1 ? 'title' : 'titles'} found`
          : status === 'error'
            ? 'Catalog unavailable'
            : 'Loading titles...'}
      </p>
    </div>
  )
}
