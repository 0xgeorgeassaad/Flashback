import { Link } from 'react-router-dom'
import { HowItWorks } from '../components/home/HowItWorks'
import { TodoPanel } from '../components/ui/TodoPanel'

export function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid min-h-[30rem] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-utility text-xs uppercase tracking-[0.22em] text-ticket">
            Your next watch starts with five old favorites
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.88] tracking-[-0.04em] text-screen sm:text-7xl lg:text-8xl">
            Rewind your taste. Find what comes next.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-haze">
            Build a reel from movies you already love. Flashback returns five recommendations worth
            taking into your next movie night.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/discover"
              className="rounded-full bg-marquee px-6 py-3 font-semibold text-booth hover:bg-screen"
            >
              Start discovering
            </Link>
            <Link
              to="/taste"
              className="rounded-full border border-line px-6 py-3 font-semibold text-screen hover:border-haze"
            >
              Continue my reel
            </Link>
          </div>
        </div>

        <TodoPanel owner="Contributor 1" title="Poster marquee" className="min-h-80 lg:rotate-2">
          TODO: create the landing page's one signature visual, a responsive poster marquee or contact
          sheet built from the provided catalog. Keep it accessible, performant, and restrained under
          reduced-motion preferences.
        </TodoPanel>
      </section>

      <HowItWorks />

      <TodoPanel owner="Contributor 1" title="Genre shortcuts and resume state">
        TODO: show meaningful genre entry points, catalog status, and a Continue your reel panel only
        when a locally persisted selection exists.
      </TodoPanel>
    </div>
  )
}
