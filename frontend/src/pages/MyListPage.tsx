import { PageIntro } from '../components/ui/PageIntro'
import { LibraryToolbar } from '../features/library/components/LibraryToolbar'
import { RecommendationHistory } from '../features/library/components/RecommendationHistory'
import { SavedMovies } from '../features/library/components/SavedMovies'

export function MyListPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 6 · Local library"
        title="Keep the ones worth remembering."
        description="Saved movies and recent recommendation sessions live only in this browser; no account required."
      />
      <LibraryToolbar />
      <SavedMovies />
      <RecommendationHistory />
    </div>
  )
}
