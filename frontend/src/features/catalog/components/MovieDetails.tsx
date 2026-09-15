import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../../../state/CatalogContext'
import { useTaste } from '../../../state/TasteContext'
import { posterUrl } from '../../../lib/posters'
import { parseYearFromTitle, titleWithoutYear } from '../../../utils/parseYear'
import { Button } from '../../../components/ui/Button'
import { Skeleton } from '../../../components/ui/Skeleton'
import { MovieCard } from './MovieCard'

type ImageLoadState = {
  source: string | null
  status: 'loading' | 'loaded' | 'error'
}

export function MovieDetails() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const { movies, status } = useCatalog()
  const { selectedMovies, toggleMovie } = useTaste()
  const [imageState, setImageState] = useState<ImageLoadState>({ source: null, status: 'loading' })

  const numericId = Number(movieId)
  const movie = useMemo(() => movies.find((m) => m.movieId === numericId), [movies, numericId])

  const related = useMemo(() => {
    if (!movie) return []
    const genreSet = new Set(movie.genres)
    return movies
      .filter((m) => m.movieId !== movie.movieId && m.genres.some((g) => genreSet.has(g)))
      .slice(0, 5)
  }, [movies, movie])

  if (status === 'loading') {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.75fr)_1.5fr]">
        <Skeleton className="aspect-[2/3] w-full" rounded="lg" />
        <div className="grid gap-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="rounded-2xl border border-ticket/50 bg-ticket/10 p-8 text-center">
        <p className="font-display text-xl text-screen">This title isn&apos;t in the archive</p>
        <p className="mt-2 text-sm text-haze">It may have been removed, or the link is incorrect.</p>
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/discover')}>
          Back to Discover
        </Button>
      </div>
    )
  }

  const selected = selectedMovies.some((m) => m.movieId === movie.movieId)
  const src = posterUrl(movie.posterPath)
  const imageStatus = imageState.source === src ? imageState.status : 'loading'
  const year = parseYearFromTitle(movie.title)
  const displayTitle = titleWithoutYear(movie.title)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.75fr)_1.5fr]">
      <div>
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-reel-raised">
          {src && imageStatus !== 'error' ? (
            <>
              {imageStatus === 'loading' && <Skeleton className="absolute inset-0" rounded="sm" />}
              <img
                src={src}
                alt=""
                onLoad={() => setImageState({ source: src, status: 'loaded' })}
                onError={() => setImageState({ source: src, status: 'error' })}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <svg viewBox="0 0 24 24" className="size-10 text-haze" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-utility text-xs uppercase tracking-wide text-haze">No artwork</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" variant={selected ? 'secondary' : 'primary'} onClick={() => toggleMovie(movie)} className="flex-1">
            {selected ? 'Remove from my picks' : 'Add to my picks'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div role="status">
          <h1 className="font-display text-3xl leading-tight text-screen sm:text-4xl">{displayTitle}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-haze">
            {year && <span className="font-utility text-marquee">{year}</span>}
            {movie.genres.length > 0 && <span>{movie.genres.join(' · ')}</span>}
          </div>
          {selected && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-marquee/60 bg-marquee/10 px-3 py-1 text-xs font-semibold text-marquee-soft">
              In your picks
            </p>
          )}
        </div>

        {related.length > 0 && (
          <section>
            <h2 className="font-display text-lg text-screen">Related from the archive</h2>
            <p className="mt-1 text-xs text-haze">Titles that share a genre with this one.</p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {related.map((relatedMovie) => (
                <MovieCard
                  key={relatedMovie.movieId}
                  movie={relatedMovie}
                  selected={selectedMovies.some((m) => m.movieId === relatedMovie.movieId)}
                  onToggle={toggleMovie}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
