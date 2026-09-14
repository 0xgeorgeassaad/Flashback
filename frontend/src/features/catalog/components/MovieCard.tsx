import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../../types'
import { posterUrl } from '../../../lib/posters'
import { Button } from '../../../components/ui/Button'
import { Skeleton } from '../../../components/ui/Skeleton'

type MovieCardProps = {
  movie: Movie
  selected?: boolean
  onToggle?: (movie: Movie) => void
  view?: 'grid' | 'list'
}

/** Pull a trailing "(YYYY)" year out of a title, e.g. "Toy Story (1995)". */
function parseYear(title: string): string | null {
  const match = title.match(/\((\d{4})\)\s*$/)
  return match ? match[1] : null
}

export function MovieCard({ movie, selected = false, onToggle, view = 'grid' }: MovieCardProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const src = posterUrl(movie.posterPath)
  const year = parseYear(movie.title)

  const poster = (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-reel-raised">
      {src && imageState !== 'error' ? (
        <>
          {imageState === 'loading' && <Skeleton className="absolute inset-0" rounded="sm" />}
          <img
            src={src}
            alt=""
            loading="lazy"
            onLoad={() => setImageState('loaded')}
            onError={() => setImageState('error')}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
          <svg viewBox="0 0 24 24" className="size-8 text-haze" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-utility text-[0.65rem] uppercase tracking-wide text-haze">No artwork</span>
        </div>
      )}
      {selected && (
        <span className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full border border-marquee bg-marquee text-booth shadow-[0_8px_20px_rgb(255_176_0_/_30%)]">
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </div>
  )

  return (
    <article
      className={`group flex gap-4 rounded-2xl border p-3 transition-colors duration-200 ${
        view === 'list' ? 'flex-row items-center' : 'flex-col'
      } ${selected ? 'border-marquee/70 bg-marquee/5' : 'border-line bg-reel/55 hover:border-haze'}`}
    >
      <div className={view === 'list' ? 'w-20 shrink-0' : 'w-full'}>{poster}</div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="min-w-0">
          <Link
            to={`/movies/${movie.movieId}`}
            className="line-clamp-2 font-display text-sm leading-tight text-screen underline-offset-4 hover:text-marquee hover:underline sm:text-base"
          >
            {movie.title}
          </Link>
          {year && <p className="mt-1 font-utility text-xs text-haze">{year}</p>}
        </div>

        {movie.genres.length > 0 && (
          <p className="line-clamp-1 text-xs text-haze-strong">{movie.genres.join(' · ')}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            variant={selected ? 'secondary' : 'primary'}
            onClick={() => onToggle?.(movie)}
            aria-pressed={selected}
            className="flex-1"
          >
            {selected ? 'Remove' : 'Select'}
          </Button>
          <Link
            to={`/movies/${movie.movieId}`}
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-line px-3 text-xs font-semibold text-haze-strong transition-colors hover:border-haze hover:text-screen"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Loading placeholder that matches MovieCard's footprint, for use while the catalog fetches. */
export function MovieCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  return (
    <div className={`flex gap-4 rounded-2xl border border-line bg-reel/55 p-3 ${view === 'list' ? 'flex-row items-center' : 'flex-col'}`}>
      <Skeleton className={view === 'list' ? 'aspect-[2/3] w-20 shrink-0' : 'aspect-[2/3] w-full'} rounded="lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-2 h-9 w-full" rounded="full" />
      </div>
    </div>
  )
}