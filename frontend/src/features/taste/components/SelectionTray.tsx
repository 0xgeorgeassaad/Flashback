import { Link } from 'react-router-dom'
import { MIN_SELECTED_MOVIES } from '../../../constants'
import { useTaste } from '../../../state/TasteContext'

export function SelectionTray() {
  const { selectedMovies } = useTaste()

  return (
    <aside className="rounded-2xl border border-marquee/40 bg-reel p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">
            Contributor 4 · Your reel
          </p>
          <p className="mt-2 text-sm text-screen">
            {selectedMovies.length} selected · {MIN_SELECTED_MOVIES} minimum
          </p>
        </div>
        <Link to="/taste" className="rounded-full bg-marquee px-4 py-2 text-sm font-semibold text-booth">
          Review my picks
        </Link>
      </div>
      <p className="mt-4 text-xs leading-5 text-haze">
        TODO: make this the signature film-strip tray with poster thumbnails, remove controls, mobile
        collapse behavior, and an accessible selection announcement.
      </p>
    </aside>
  )
}
