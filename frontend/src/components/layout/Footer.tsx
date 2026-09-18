import { useCatalog } from '../../state/CatalogContext'

export function Footer() {
  const { movies, status } = useCatalog()

  const statusLabel =
    status === 'ready'
      ? `${movies.length.toLocaleString()} titles in this catalog`
      : status === 'error'
        ? 'Catalog unavailable'
        : status === 'loading'
          ? 'Catalog loading'
          : 'Catalog idle'

  const statusClass =
    status === 'ready'
      ? 'text-marquee-soft'
      : status === 'error'
        ? 'text-ticket'
        : 'text-haze'

  return (
    <footer className="mt-auto border-t border-line/80 bg-booth/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-lg text-screen">Flashback</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-haze">
            A personalized movie recommender built on top of the MovieLens catalog.
          </p>
        </div>
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <span className={`size-2 rounded-full ${status === 'ready' ? 'bg-marquee' : status === 'error' ? 'bg-ticket' : 'bg-haze'}`} aria-hidden="true" />
          <p className={`font-utility text-[0.7rem] uppercase tracking-[0.12em] ${statusClass}`}>{statusLabel}</p>
        </div>
      </div>
    </footer>
  )
}
