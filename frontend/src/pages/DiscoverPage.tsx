import { PageIntro } from '../components/ui/PageIntro'
import { FilterPanel } from '../features/catalog/components/FilterPanel'
import { MovieGrid } from '../features/catalog/components/MovieGrid'
import { MovieSearch } from '../features/catalog/components/MovieSearch'
import { SelectionTray } from '../features/taste/components/SelectionTray'

export function DiscoverPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Contributor 2 · Discovery / Contributor 3 · Catalog"
        title="Search the shelves. Find your five."
        description="Use titles, genres, and decades to find the films that best represent what you enjoy."
      />
      <MovieSearch />
      <FilterPanel />
      <MovieGrid />
      <div className="sticky bottom-4 z-30">
        <SelectionTray />
      </div>
    </div>
  )
}
