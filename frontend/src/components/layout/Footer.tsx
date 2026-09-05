import { useCatalog } from '../../state/CatalogContext'

export function Footer() {
  const { movies, status } = useCatalog()

  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-xs text-haze sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Flashback · A recommender system built on top of MovieLens.</p>
        <p className="font-utility">
          {status === 'ready' ? `${movies.length} titles in this catalog` : `Catalog: ${status}`}
        </p>
      </div>
    </footer>
  )
}
