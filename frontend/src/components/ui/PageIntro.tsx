type PageIntroProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <header className="max-w-3xl">
      <p className="font-utility text-xs uppercase tracking-[0.2em] text-marquee">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl leading-[0.95] tracking-tight text-screen sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-haze sm:text-lg">{description}</p>
    </header>
  )
}
