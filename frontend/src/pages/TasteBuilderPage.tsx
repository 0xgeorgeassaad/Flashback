import { PageIntro } from '../components/ui/PageIntro'
import { SelectedMovieList } from '../features/taste/components/SelectedMovieList'
import { SelectionProgress } from '../features/taste/components/SelectionProgress'
import { TasteSummary } from '../features/taste/components/TasteSummary'

export function TasteBuilderPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 4 · Taste builder"
        title="Cut your taste reel."
        description="Review the movies that will shape this recommendation run. Five is the minimum; a thoughtful mix works better."
      />
      <SelectionProgress />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <SelectedMovieList />
        <TasteSummary />
      </div>
    </div>
  )
}
