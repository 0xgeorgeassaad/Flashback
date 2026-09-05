import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-24 text-center">
      <p className="font-utility text-xs uppercase tracking-[0.2em] text-ticket">404 · Missing reel</p>
      <h1 className="mt-4 font-display text-5xl text-screen">That page is not in the archive.</h1>
      <p className="mt-5 text-haze">Check the address or return to the catalog to choose another film.</p>
      <Link
        to="/discover"
        className="mt-8 inline-flex rounded-full bg-marquee px-5 py-3 font-semibold text-booth"
      >
        Browse movies
      </Link>
      {/* TODO [Contributor 1]: verify focus management and navigation behavior for unknown routes. */}
    </section>
  )
}
