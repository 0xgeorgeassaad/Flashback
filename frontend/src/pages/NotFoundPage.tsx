import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl items-center justify-center py-16 text-center" aria-labelledby="not-found-title">
      <div>
        <p className="font-utility text-[0.7rem] uppercase tracking-[0.22em] text-ticket">404 · Missing reel</p>
        <h1 id="not-found-title" className="mt-4 font-display text-5xl leading-tight tracking-tight text-screen sm:text-7xl">
          That page is not in the archive.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-haze sm:text-lg">
          The address may be wrong, or the reel you were looking for has moved. Return to the catalog and choose another film.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/discover"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-marquee px-5 text-sm font-semibold text-booth transition-colors hover:bg-screen"
          >
            Browse movies
          </Link>
          <Link
            to="/home"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-reel px-5 text-sm font-semibold text-screen transition-colors hover:border-haze"
          >
            Back to Flashback
          </Link>
        </div>
        <p className="mt-8 font-utility text-[0.65rem] uppercase tracking-[0.14em] text-haze/70">
          Press Tab to move through the available actions.
        </p>
      </div>
    </section>
  )
}
