import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Skeleton } from '../../../components/ui/Skeleton'
import { posterUrl } from '../../../lib/posters'
import type { Recommendation } from '../../../types'
import { parseYearFromTitle, titleWithoutYear } from '../../../utils/parseYear'

type RecommendationHeroProps = {
  recommendation: Recommendation
  saved: boolean
  onToggleSaved: (recommendation: Recommendation) => void
}

type ImageLoadState = {
  source: string | null
  status: 'loading' | 'loaded' | 'error'
}

export function RecommendationHero({
  recommendation,
  saved,
  onToggleSaved,
}: RecommendationHeroProps) {
  const source = posterUrl(recommendation.posterPath)
  const [imageState, setImageState] = useState<ImageLoadState>({
    source,
    status: 'loading',
  })
  const imageStatus = imageState.source === source ? imageState.status : 'loading'
  const year = parseYearFromTitle(recommendation.title)
  const displayTitle = titleWithoutYear(recommendation.title)

  return (
    <section
      aria-labelledby="top-pick-title"
      className="relative overflow-hidden rounded-panel border border-marquee/35 bg-reel shadow-glow"
    >
      <div className="film-perforation absolute inset-x-0 top-0 h-5 border-b border-line bg-booth/70" />
      <div className="grid gap-0 pt-5 md:grid-cols-[minmax(15rem,0.78fr)_1.4fr]">
        <div className="relative aspect-[2/3] min-h-0 overflow-hidden bg-reel-raised md:aspect-auto md:min-h-[32rem]">
          {source && imageStatus !== 'error' ? (
            <>
              {imageStatus === 'loading' ? <Skeleton className="absolute inset-0" rounded="sm" /> : null}
              <img
                src={source}
                alt=""
                onLoad={() => setImageState({ source, status: 'loaded' })}
                onError={() => setImageState({ source, status: 'error' })}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 p-8 text-center text-haze">
              <svg
                viewBox="0 0 24 24"
                className="size-12"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-utility text-xs uppercase tracking-[0.18em]">Artwork unavailable</span>
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full border border-marquee bg-booth/90 px-3 py-1 font-utility text-xs text-marquee backdrop-blur">
            Top pick
          </span>
        </div>

        <div className="relative flex flex-col justify-between gap-10 p-6 sm:p-9 lg:p-12">
          <span
            className="pointer-events-none absolute right-5 top-2 font-display text-[7rem] leading-none text-screen/[0.035] sm:text-[10rem]"
            aria-hidden="true"
          >
            01
          </span>

          <div className="relative">
            <p className="font-utility text-xs uppercase tracking-[0.2em] text-marquee">
              First on your reel
            </p>
            <h2
              id="top-pick-title"
              className="mt-4 max-w-2xl font-display text-4xl leading-[0.95] tracking-tight text-screen sm:text-5xl lg:text-6xl"
            >
              {displayTitle}
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-haze">
              {year ? <span className="font-utility text-marquee-soft">{year}</span> : null}
              {recommendation.genres.length > 0 ? (
                <span>{recommendation.genres.join(' · ')}</span>
              ) : null}
            </div>
          </div>

          <div className="relative grid gap-6 border-t border-line pt-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="font-utility text-[0.65rem] uppercase tracking-[0.18em] text-haze">
                Model score
              </p>
              <p className="mt-1 font-utility text-2xl text-screen">
                {recommendation.score.toFixed(3)}
              </p>
              <p className="mt-2 max-w-md text-xs leading-5 text-haze">
                This score orders the five titles in this reel. It is not a probability or rating.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={saved ? 'secondary' : 'primary'}
                onClick={() => onToggleSaved(recommendation)}
                aria-pressed={saved}
              >
                {saved ? 'Remove from My List' : 'Save to My List'}
              </Button>
              <Link
                to={`/movies/${recommendation.movieId}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-booth/40 px-5 text-sm font-semibold text-screen transition-colors hover:border-haze hover:bg-reel-raised"
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function RecommendationHeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-reel pt-5">
      <div className="grid md:grid-cols-[minmax(15rem,0.78fr)_1.4fr]">
        <Skeleton className="aspect-[2/3] min-h-80 md:aspect-auto md:min-h-[32rem]" rounded="sm" />
        <div className="flex flex-col justify-between gap-10 p-6 sm:p-9 lg:p-12">
          <div className="space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3 border-t border-line pt-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-11 w-52" rounded="full" />
          </div>
        </div>
      </div>
    </div>
  )
}
