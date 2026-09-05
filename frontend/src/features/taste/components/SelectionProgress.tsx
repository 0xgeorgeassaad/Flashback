import { MIN_SELECTED_MOVIES } from '../../../constants'
import { useTaste } from '../../../state/TasteContext'

export function SelectionProgress() {
  const { selectedMovies } = useTaste()
  const progress = Math.min(100, (selectedMovies.length / MIN_SELECTED_MOVIES) * 100)

  return (
    <section className="rounded-2xl border border-line bg-reel/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-screen">Your selection</h2>
        <p className="font-utility text-xs text-marquee">
          {selectedMovies.length} / {MIN_SELECTED_MOVIES} minimum
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-booth" aria-hidden="true">
        <div className="h-full bg-marquee" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm text-haze">
        TODO [Contributor 4]: add contextual instructions for empty, incomplete, and ready states.
      </p>
    </section>
  )
}
