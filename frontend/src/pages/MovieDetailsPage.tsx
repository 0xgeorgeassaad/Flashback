import { useParams } from 'react-router-dom'
import { PageIntro } from '../components/ui/PageIntro'
import { MovieDetails } from '../features/catalog/components/MovieDetails'

export function MovieDetailsPage() {
  const { movieId } = useParams()

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 3 · Movie details"
        title={`Archive title ${movieId ?? ''}`}
        description="A reusable details experience opened from discovery, recommendations, or the local library."
      />
      <MovieDetails />
    </div>
  )
}
