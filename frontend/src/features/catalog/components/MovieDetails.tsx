import { TodoPanel } from '../../../components/ui/TodoPanel'

export function MovieDetails() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.75fr)_1.5fr]">
      <TodoPanel owner="Contributor 3" title="Poster and primary actions">
        TODO: resolve the route ID, render poster/fallback, show selected state, and provide Add to my
        picks, Remove, and Back controls.
      </TodoPanel>
      <div className="grid gap-6">
        <TodoPanel owner="Contributor 3" title="Movie information">
          TODO: title, parsed year, genres, accessible status announcements, and any optional metadata
          present in the provided catalog.
        </TodoPanel>
        <TodoPanel owner="Contributor 3" title="Related from the archive">
          TODO: rank catalog titles by shared genres, exclude the current movie, and reuse MovieCard.
        </TodoPanel>
      </div>
    </div>
  )
}
