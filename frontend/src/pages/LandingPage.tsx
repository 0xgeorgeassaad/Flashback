import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const reelFrames = [
  { label: 'Choose', detail: 'Five favorites' },
  { label: 'Match', detail: 'Your taste' },
  { label: 'Watch', detail: 'Five new picks' },
]

export function LandingPage() {
  const auth = useAuth()

  if (auth.status === 'authenticated') return <Navigate to="/home" replace />

  return (
    <div className="flex min-h-svh flex-col bg-booth text-screen">
      <header className="border-b border-line/80 bg-booth/90">
        <nav
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8"
          aria-label="Public navigation"
        >
          <span className="inline-flex items-center gap-2 font-display text-xl tracking-tight text-marquee sm:text-2xl">
            <span aria-hidden="true" className="h-5 w-1 rounded-full bg-ticket" />
            Flashback
          </span>

          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden min-h-10 items-center rounded-full px-4 text-sm font-semibold text-haze transition-colors hover:text-screen sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/auth?mode=sign-up"
              className="inline-flex min-h-10 items-center rounded-full border border-marquee bg-marquee px-4 text-sm font-semibold text-booth transition-colors hover:border-screen hover:bg-screen"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="archive-grid flex flex-1 items-center">
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-32">
          <div>
            <p className="font-utility text-xs uppercase tracking-[0.2em] text-ticket">
              A recommender built on MovieLens
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.92] tracking-[-0.045em] text-screen sm:text-7xl lg:text-8xl">
              Rewind your taste. Find what comes next.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-haze sm:text-lg">
              Pick five movies you already love. Flashback turns that reel into five personalized recommendations and keeps your favorites ready on every device.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth?mode=sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-marquee bg-marquee px-6 text-base font-semibold text-booth shadow-[0_12px_30px_rgb(255_176_0_/_12%)] transition-colors hover:border-screen hover:bg-screen"
              >
                Create your account
              </Link>
              <Link
                to="/auth"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-reel/70 px-6 text-sm font-semibold text-screen transition-colors hover:border-haze hover:bg-reel"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="rounded-panel border border-line bg-reel/55 p-4 shadow-panel sm:p-6" aria-label="How Flashback works">
            <div className="film-perforation h-3 opacity-50" aria-hidden="true" />
            <ol className="my-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {reelFrames.map((frame, index) => (
                <li key={frame.label} className="flex items-center gap-4 rounded-xl border border-line bg-booth/70 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-marquee/40 font-utility text-xs text-marquee-soft">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-screen">{frame.label}</p>
                    <p className="mt-1 text-sm text-haze">{frame.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="film-perforation h-3 opacity-50" aria-hidden="true" />
          </div>
        </section>
      </main>
    </div>
  )
}
