import { useMemo } from 'react'
import type { Movie, Recommendation } from '../../../types'

type GenreComparisonProps = {
  selectedMovies: Movie[]
  recommendations: Recommendation[]
}

type GenreStat = {
  genre: string
  selectedCount: number
  recommendationCount: number
}

export function GenreComparison({ selectedMovies, recommendations }: GenreComparisonProps) {
  const comparison = useMemo(() => {
    const selectedCounts = countGenres(selectedMovies)
    const recommendationCounts = countGenres(recommendations)
    const shared: GenreStat[] = []

    for (const [genre, recommendationCount] of recommendationCounts) {
      const selectedCount = selectedCounts.get(genre) ?? 0
      if (selectedCount > 0) shared.push({ genre, selectedCount, recommendationCount })
    }

    shared.sort(
      (first, second) =>
        second.recommendationCount - first.recommendationCount ||
        second.selectedCount - first.selectedCount ||
        first.genre.localeCompare(second.genre),
    )

    const recommendationsWithOverlap = recommendations.filter((movie) =>
      movie.genres.some((genre) => selectedCounts.has(genre)),
    ).length

    return { shared, recommendationsWithOverlap }
  }, [recommendations, selectedMovies])

  return (
    <section
      aria-labelledby="genre-comparison-title"
      className="archive-grid rounded-panel border border-line bg-booth/45 p-6 sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">Catalog connection</p>
          <h2 id="genre-comparison-title" className="mt-2 font-display text-2xl text-screen sm:text-3xl">
            What these reels share
          </h2>
          {selectedMovies.length > 0 ? (
            <p className="mt-4 max-w-lg text-sm leading-6 text-haze">
              {comparison.recommendationsWithOverlap} of {recommendations.length} recommendations share at least one catalog genre with your selected movies.
            </p>
          ) : (
            <p className="mt-4 max-w-lg text-sm leading-6 text-haze">
              The selected movies for this older reel are no longer available in the current catalog, so a genre comparison cannot be calculated.
            </p>
          )}
        </div>

        {comparison.shared.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {comparison.shared.slice(0, 6).map((stat) => (
              <li key={stat.genre} className="rounded-xl border border-line bg-reel/70 p-4">
                <p className="font-semibold text-screen">{stat.genre}</p>
                <p className="mt-1 text-xs leading-5 text-haze">
                  {stat.selectedCount} selected, {stat.recommendationCount} recommended
                </p>
              </li>
            ))}
          </ul>
        ) : selectedMovies.length > 0 ? (
          <p className="rounded-xl border border-line bg-reel/70 p-4 text-sm leading-6 text-haze">
            These recommendations do not share catalog genre labels with your selected movies. This observation describes the metadata only, not how the model made its choices.
          </p>
        ) : null}
      </div>
    </section>
  )
}

function countGenres(movies: Movie[]) {
  const counts = new Map<string, number>()
  for (const movie of movies) {
    for (const genre of movie.genres) counts.set(genre, (counts.get(genre) ?? 0) + 1)
  }
  return counts
}
