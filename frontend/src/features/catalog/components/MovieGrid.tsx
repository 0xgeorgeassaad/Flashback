import { useCatalog } from '../../../state/CatalogContext'
import { MovieCard } from './MovieCard'

export function MovieGrid() {
  const { movies, status, error, reload } = useCatalog()

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-ticket/50 bg-ticket/10 p-5 text-sm text-screen">
        <p>{error}</p>
        <button type="button" onClick={reload} className="mt-3 font-semibold text-marquee">
          Try loading again
        </button>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-utility text-xs uppercase tracking-[0.18em] text-marquee">Contributor 3</p>
          <h2 className="mt-2 font-display text-2xl text-screen">Catalog grid</h2>
        </div>
        <p className="text-xs text-haze">{status === 'ready' ? `${movies.length} loaded` : 'Loading…'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <MovieCard key={index} />
        ))}
      </div>
      <p className="mt-4 text-sm text-haze">
        TODO [Contributors 2 &amp; 3]: render filtered movies, loading skeletons, pagination/load-more, empty
        state, and both view modes.
      </p>
    </section>
  )
}
