import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { HowItWorks } from '../components/home/HowItWorks'
import { Button, Chip, Dialog, Skeleton } from '../components/ui'
import { MOVIE_GENRES, STORAGE_KEYS } from '../constants'
import { useLocalStoragePresence } from '../hooks/useLocalStorage'
import { posterUrl } from '../lib/posters'
import { useCatalog } from '../state/CatalogContext'
import { useTaste } from '../state/TasteContext'
import type { Movie } from '../types'

function MoviePoster({ movie }: { movie: Movie }) {
  const [failed, setFailed] = useState(false)
  const src = posterUrl(movie.posterPath)

  if (!src || failed) {
    return (
      <div className="group flex aspect-[2/3] items-end overflow-hidden rounded-xl border border-line bg-reel p-3">
        <span className="line-clamp-3 text-[0.65rem] font-semibold leading-4 text-haze-strong">
          {movie.title}
        </span>
      </div>
    )
  }

  return (
    <div className="group aspect-[2/3] overflow-hidden rounded-xl border border-screen/10 bg-reel shadow-panel">
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function PosterMarquee() {
  const { movies, status } = useCatalog()
  const [isMarqueePaused, setIsMarqueePaused] = useState(false)
  const [isMoviesDialogOpen, setIsMoviesDialogOpen] = useState(false)

  const posters = useMemo(() => {
    return movies.filter((movie) => movie.posterPath).slice(0, 18)
  }, [movies])

  if (status === 'loading' && posters.length === 0) {
    return (
      <div
        className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3"
        aria-label="Loading catalog preview"
      >
        {Array.from({ length: 15 }, (_, index) => (
          <Skeleton
            key={index}
            className="aspect-[2/3]"
            rounded="lg"
          />
        ))}
      </div>
    )
  }

  if (status === 'error' || posters.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-reel/40 p-8 text-center">
        <span className="font-utility text-[0.7rem] uppercase tracking-[0.18em] text-ticket">
          Archive signal
        </span>

        <p className="mt-3 max-w-xs text-sm leading-6 text-haze">
          The catalog preview is unavailable right now, but discovery can
          still be started from the archive.
        </p>

        <Link
          to="/discover"
          className="mt-5 text-sm font-semibold text-marquee-soft underline decoration-marquee/40 underline-offset-4 hover:text-screen"
        >
          Open the catalog
        </Link>
      </div>
    )
  }

  const repeated = [...posters, ...posters]

  return (
    <>
      <section
        aria-labelledby="featured-movies-title"
        className="relative overflow-hidden rounded-panel border border-line bg-reel/35 p-3 shadow-glow sm:p-4"
      >
        <h2 id="featured-movies-title" className="sr-only">
          Featured movies
        </h2>

        <div
          className="film-perforation absolute inset-x-0 top-0 h-2 opacity-40"
          aria-hidden="true"
        />

        <div className="marquee-viewport relative mt-1 overflow-hidden rounded-2xl">
          <div
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,var(--color-booth)_0%,transparent_10%,transparent_90%,var(--color-booth)_100%)]"
            aria-hidden="true"
          />

          <div
            className={`marquee-track grid w-max grid-flow-col auto-cols-[5.7rem] gap-2.5 sm:auto-cols-[6.9rem] sm:gap-3 md:auto-cols-[7.6rem] ${
              isMarqueePaused ? 'marquee-paused' : ''
            }`}
            aria-hidden="true"
          >
            {repeated.map((movie, index) => (
              <MoviePoster
                key={`${movie.movieId}-${index}`}
                movie={movie}
              />
            ))}
          </div>

          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-2 pb-2 pt-3">
            <p className="font-utility text-[0.65rem] uppercase tracking-[0.14em] text-haze">
              A moving contact sheet from the movie archive
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-pressed={isMarqueePaused}
                onClick={() =>
                  setIsMarqueePaused((value) => !value)
                }
              >
                {isMarqueePaused ? 'Play posters' : 'Pause posters'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsMoviesDialogOpen(true)}
              >
                Browse featured movies
              </Button>
            </div>
          </div>
        </div>

        <div
          className="film-perforation absolute inset-x-0 bottom-0 h-2 rotate-180 opacity-40"
          aria-hidden="true"
        />
      </section>

      <Dialog
        open={isMoviesDialogOpen}
        onClose={() => setIsMoviesDialogOpen(false)}
        title="Featured movies"
        description="Choose a movie to open its details."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {posters.map((movie) => (
            <Link
              key={movie.movieId}
              to={`/movies/${movie.movieId}`}
              onClick={() => setIsMoviesDialogOpen(false)}
              className="rounded-xl border border-line bg-reel/60 px-4 py-3 text-sm font-semibold text-screen transition-colors hover:border-haze hover:bg-reel focus-visible:border-marquee focus-visible:text-marquee-soft"
            >
              {movie.title}
            </Link>
          ))}
        </div>
      </Dialog>
    </>
  )
}

export function HomePage() {
  const { movies, status, reload } = useCatalog()
  const { selectedMovies } = useTaste()

  const hasStoredTasteDraft = useLocalStoragePresence(
    STORAGE_KEYS.tasteDraft,
  )

  const draftExists =
    selectedMovies.length > 0 || hasStoredTasteDraft

  const genres = MOVIE_GENRES.slice(0, 8)

  return (
    <div className="space-y-16 sm:space-y-20">
      <section
        className="grid items-center gap-9 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12"
        aria-labelledby="hero-title"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-utility text-[0.7rem] uppercase tracking-[0.22em] text-ticket">
              Your next watch starts here
            </span>

            <span
              className="size-1 rounded-full bg-line"
              aria-hidden="true"
            />

            <span className="font-utility text-[0.65rem] uppercase tracking-[0.16em] text-haze">
              Five favorites → five picks
            </span>
          </div>

          <h1
            id="hero-title"
            className="mt-5 max-w-3xl font-display text-5xl leading-[0.9] tracking-[-0.04em] text-screen sm:text-7xl lg:text-8xl"
          >
            Rewind your taste. Find what comes next.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-haze sm:text-lg">
            Build a reel from movies you already love. Flashback turns that
            familiar list into five recommendations worth taking into your
            next movie night.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-marquee bg-marquee px-6 text-base font-semibold tracking-tight text-booth shadow-[0_12px_30px_rgb(255_176_0_/_12%)] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-screen"
            >
              Start discovering
              <span aria-hidden="true">→</span>
            </Link>

            {draftExists ? (
              <Link
                to="/taste"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-reel/60 px-5 text-sm font-semibold text-screen transition-colors hover:border-haze hover:bg-reel"
              >
                Continue your reel

                <span className="ml-2 font-utility text-[0.65rem] text-marquee-soft">
                  {selectedMovies.length || 'saved'}
                </span>
              </Link>
            ) : null}
          </div>

          <div
            className="mt-7 flex flex-wrap items-center gap-3"
            aria-live="polite"
          >
            <span className="font-utility text-[0.65rem] uppercase tracking-[0.12em] text-haze">
              Archive status
            </span>

            <span
              className="h-px w-8 bg-line"
              aria-hidden="true"
            />

            <span
              className={`font-utility text-[0.65rem] uppercase tracking-[0.12em] ${
                status === 'ready'
                  ? 'text-marquee-soft'
                  : status === 'error'
                    ? 'text-ticket'
                    : 'text-haze'
              }`}
            >
              {status === 'ready'
                ? `${movies.length.toLocaleString()} titles loaded`
                : status === 'error'
                  ? 'Unavailable'
                  : 'Loading'}
            </span>

            {status === 'error' ? (
              <button
                type="button"
                onClick={reload}
                className="font-utility text-[0.65rem] uppercase tracking-[0.12em] text-screen underline decoration-line underline-offset-4 hover:text-marquee-soft"
              >
                Retry
              </button>
            ) : null}
          </div>
        </div>

        <PosterMarquee />
      </section>

      <HowItWorks />

      <section
        aria-labelledby="genre-shortcuts-title"
        className="grid gap-7 rounded-panel border border-line bg-reel/25 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-10"
      >
        <div>
          <p className="font-utility text-[0.7rem] uppercase tracking-[0.22em] text-marquee">
            Choose your doorway
          </p>

          <h2
            id="genre-shortcuts-title"
            className="mt-3 font-display text-3xl leading-tight text-screen sm:text-4xl"
          >
            Start with a feeling.
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-6 text-haze">
            Jump into the archive by genre, then narrow the shelves until your
            five favorites appear.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {genres.map((genre) => (
            <Link
              key={genre}
              to={`/discover?genre=${encodeURIComponent(genre)}`}
            >
              <Chip active>{genre}</Chip>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="relative overflow-hidden rounded-panel border border-marquee/20 bg-marquee/6 p-6 sm:p-8 lg:p-10"
        aria-labelledby="cta-title"
      >
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-utility text-[0.7rem] uppercase tracking-[0.22em] text-marquee-soft">
              The reel is yours
            </p>

            <h2
              id="cta-title"
              className="mt-3 max-w-2xl font-display text-3xl leading-tight text-screen sm:text-4xl"
            >
              Pick five movies. Let the archive surprise you.
            </h2>
          </div>

          <Link
            to="/discover"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-marquee px-6 py-3 text-sm font-semibold text-booth transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-screen"
          >
            Enter the archive

            <span aria-hidden="true" className="ml-2">
              ↗
            </span>
          </Link>
        </div>

        <div
          className="film-perforation pointer-events-none absolute inset-x-0 bottom-0 h-2 opacity-30"
          aria-hidden="true"
        />
      </section>
    </div>
  )
}