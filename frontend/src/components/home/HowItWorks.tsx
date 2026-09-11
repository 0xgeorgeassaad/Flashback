const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Search and filter the archive until familiar favorites surface.',
  },
  {
    number: '02',
    title: 'Build your reel',
    description: 'Choose at least five films that say something about your taste.',
  },
  {
    number: '03',
    title: 'Get five picks',
    description: 'Send the reel to the recommender and keep what catches your eye.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" className="relative overflow-hidden rounded-panel border border-line bg-reel/45 p-6 shadow-panel sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full border border-marquee/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full border border-marquee/10" aria-hidden="true" />

      <div className="relative">
        <p className="font-utility text-[0.7rem] uppercase tracking-[0.22em] text-marquee">The three-act flow</p>
        <h2 id="how-it-works-title" className="mt-3 max-w-2xl font-display text-3xl leading-tight tracking-tight text-screen sm:text-4xl">
          From old favorites to a new watch.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="group relative rounded-2xl border border-line bg-booth/55 p-5 transition-colors duration-200 hover:border-haze/50"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-utility text-xs text-ticket">ACT {step.number}</span>
                {index < steps.length - 1 ? (
                  <span className="hidden h-px flex-1 bg-line md:block" aria-hidden="true" />
                ) : null}
              </div>
              <h3 className="mt-8 text-lg font-semibold text-screen">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-haze">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
