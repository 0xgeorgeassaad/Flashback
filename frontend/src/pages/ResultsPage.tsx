import { Link } from 'react-router-dom'
import { PageIntro } from '../components/ui/PageIntro'
import { GenreComparison } from '../features/recommendations/components/GenreComparison'
import { RecommendationGrid } from '../features/recommendations/components/RecommendationGrid'
import { RecommendationHero } from '../features/recommendations/components/RecommendationHero'

export function ResultsPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 5 · Recommendations"
        title="Five films for what comes next."
        description="Lead with the strongest recommendation, then give every result enough context to make a decision."
      />
      <RecommendationHero />
      <RecommendationGrid />
      <GenreComparison />
      <div className="flex flex-wrap gap-3">
        <Link to="/taste" className="rounded-full border border-line px-5 py-3 font-semibold text-screen">
          Refine my picks
        </Link>
        <Link to="/discover" className="rounded-full bg-marquee px-5 py-3 font-semibold text-booth">
          Start another reel
        </Link>
      </div>
    </div>
  )
}
