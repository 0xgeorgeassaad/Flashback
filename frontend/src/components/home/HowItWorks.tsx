const steps = [
  ['Discover', 'Search and filter the catalog until familiar favorites surface.'],
  ['Build your reel', 'Choose at least five films that say something about your taste.'],
  ['Get five picks', 'Send the reel to the recommender and save what catches your eye.'],
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title">
      <p className="font-utility text-xs uppercase tracking-[0.2em] text-marquee">The three-act flow</p>
      <h2 id="how-it-works-title" className="mt-2 font-display text-2xl text-screen sm:text-3xl">
        From old favorites to a new watch.
      </h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map(([title, description], index) => (
          <article key={title} className="rounded-2xl border border-line bg-reel/70 p-5">
            <p className="font-utility text-xs text-ticket">ACT {index + 1}</p>
            <h3 className="mt-3 text-lg font-semibold text-screen">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-haze">{description}</p>
          </article>
        ))}
      </div>
      {/* TODO [Contributor 1]: refine copy, responsive rhythm, icons, and restrained reveal motion. */}
    </section>
  )
}
