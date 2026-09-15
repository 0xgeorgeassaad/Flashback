import { Button } from '../../../components/ui/Button'
import { MovieCard, MovieCardSkeleton } from '../../catalog/components/MovieCard'
import type { Recommendation } from '../../../types'

type RecommendationGridProps = {
  recommendations: Recommendation[]
  isSaved: (movieId: number) => boolean
  onToggleSaved: (recommendation: Recommendation) => void
}

export function RecommendationGrid({
  recommendations,
  isSaved,
  onToggleSaved,
}: RecommendationGridProps) {
  if (recommendations.length === 0) return null

  return (
    <section aria-labelledby="more-recommendations-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">Next in line</p>
          <h2 id="more-recommendations-title" className="mt-2 font-display text-2xl text-screen sm:text-3xl">
            Four more for the queue
          </h2>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-haze sm:block">
          Scores rank this set only. A higher score places a title earlier in this reel.
        </p>
      </div>

      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((recommendation, index) => {
          const saved = isSaved(recommendation.movieId)
          return (
            <li key={recommendation.movieId} className="relative pt-9">
              <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-line pb-2 font-utility text-[0.65rem] uppercase tracking-[0.15em] text-haze">
                <span>Rank {String(index + 2).padStart(2, '0')}</span>
                <span className="text-marquee-soft">Score {recommendation.score.toFixed(3)}</span>
              </div>
              <MovieCard
                movie={recommendation}
                primaryAction={
                  <Button
                    type="button"
                    size="sm"
                    variant={saved ? 'secondary' : 'primary'}
                    onClick={() => onToggleSaved(recommendation)}
                    aria-pressed={saved}
                    className="flex-1"
                  >
                    {saved ? 'Saved' : 'Save'}
                  </Button>
                }
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function RecommendationGridSkeleton() {
  return (
    <div>
      <SkeletonHeader />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 pt-9">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonHeader() {
  return (
    <div className="space-y-2">
      <div className="h-3 w-24 animate-pulse rounded bg-screen/8" />
      <div className="h-8 w-72 max-w-full animate-pulse rounded bg-screen/8" />
    </div>
  )
}
