import type { Movie } from '../../../types'

type MovieCardProps = {
  movie?: Movie
  selected?: boolean
  onToggle?: (movie: Movie) => void
}

export function MovieCard(_props: MovieCardProps) {
  return (
    <article className="aspect-[2/3] rounded-2xl border border-dashed border-line bg-reel/55 p-4">
      <p className="font-utility text-xs uppercase tracking-wider text-marquee">Contributor 3 · Movie card</p>
      <p className="mt-3 text-sm leading-6 text-haze">
        TODO: poster, fallback artwork, title, year, genres, selection state, details link, image loading,
        keyboard interaction, and grid/list variants.
      </p>
    </article>
  )
}
